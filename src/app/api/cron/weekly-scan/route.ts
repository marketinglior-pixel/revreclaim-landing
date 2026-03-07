import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { runFullScan } from "@/lib/stripe-scanner";
import { runPlatformScan } from "@/lib/platforms";
import type { BillingPlatform } from "@/lib/platforms/types";
import { decrypt } from "@/lib/encryption";
import { sendScanCompleteEmail } from "@/lib/email";
import { calculateNextScan } from "@/lib/scan-utils";
import { generateRecoveryActions } from "@/lib/recovery/action-generator";
import { canUseRecoveryActions } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { verifyCronSecret } from "@/lib/api-security";
import { fireAndForget } from "@/lib/fire-and-forget";

export const maxDuration = 300; // 5 minutes for batch processing

/**
 * Weekly cron job to run automated scans for all active scan configs.
 * Called by Vercel Cron on schedule defined in vercel.json.
 *
 * Security: Protected by CRON_SECRET bearer token.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret (timing-safe comparison)
  if (!verifyCronSecret(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CRON] Weekly scan job started");

  // Use service role client to bypass RLS
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );

  // Fetch all active scan configs that are due
  const now = new Date().toISOString();
  const { data: configs, error: fetchError } = await supabase
    .from("scan_configs")
    .select("*, profiles!inner(email, is_disabled, plan)")
    .eq("is_active", true)
    .eq("profiles.is_disabled", false)
    .lte("next_scan_at", now);

  if (fetchError) {
    console.error("[CRON] Failed to fetch configs:", fetchError.message);
    return NextResponse.json(
      { error: "Failed to fetch scan configs" },
      { status: 500 }
    );
  }

  if (!configs || configs.length === 0) {
    console.log("[CRON] No scans due at this time");
    return NextResponse.json({ message: "No scans due", processed: 0 });
  }

  console.log(`[CRON] Found ${configs.length} scan(s) to process`);

  let successCount = 0;
  let errorCount = 0;

  for (const config of configs) {
    try {
      // Decrypt the API key
      const apiKey = decrypt(config.encrypted_api_key);
      const platform: BillingPlatform = (config.platform as BillingPlatform) || "stripe";

      console.log(`[CRON] Running ${platform} scan for user ${config.user_id}`);

      // Run the scan — dispatch to correct scanner
      let report;
      let emailMap = new Map<string, string>();

      if (platform === "stripe") {
        const result = await runFullScan(apiKey);
        report = result.report;
        emailMap = result.emailMap;
      } else {
        const result = await runPlatformScan(platform, apiKey);
        report = result.report;
        emailMap = result.emailMap;
      }

      // Save report to database
      const isTestMode = platform === "stripe" ? apiKey.startsWith("rk_test_") : false;
      const { error: insertError } = await supabase.from("reports").insert({
        id: report.id,
        user_id: config.user_id,
        summary: report.summary as unknown as Record<string, unknown>,
        categories: report.categories as unknown as Record<string, unknown>[],
        leaks: report.leaks as unknown as Record<string, unknown>[],
        is_test_mode: isTestMode,
        platform,
      });

      if (insertError) {
        console.error(`[CRON] Failed to save report for ${config.user_id}:`, insertError.message);
        errorCount++;
        continue;
      }

      // Generate recovery actions for Pro/Team users
      const profileData = config.profiles as unknown as { email: string; plan?: string };
      const userPlan = (profileData?.plan || "free") as PlanType;
      if (canUseRecoveryActions(userPlan).allowed && report.leaks.length > 0) {
        try {
          const actions = generateRecoveryActions(report, emailMap, platform);
          if (actions.length > 0) {
            const rows = actions.map((a) => ({
              user_id: config.user_id,
              report_id: report.id,
              leak_id: a.leak_id,
              action_type: a.action_type as string,
              platform: a.platform,
              customer_email_encrypted: a.customer_email_encrypted,
              customer_id: a.customer_id,
              subscription_id: a.subscription_id,
              action_data: JSON.parse(JSON.stringify(a.action_data)),
              monthly_impact: a.monthly_impact,
            }));
            const { error: actionsErr } = await supabase
              .from("recovery_actions")
              .insert(rows);
            if (actionsErr) {
              console.error(`[CRON] Failed to insert recovery actions for ${config.user_id}:`, actionsErr.message);
            } else {
              console.log(`[CRON] Generated ${actions.length} recovery actions for ${config.user_id}`);
            }
          }
        } catch (actionErr) {
          console.error(`[CRON] Action generation error for ${config.user_id}:`, actionErr);
        }
      }

      // Calculate next scan time
      const nextScan = calculateNextScan(config.scan_frequency);

      // Update scan config
      await supabase
        .from("scan_configs")
        .update({
          last_scan_at: new Date().toISOString(),
          next_scan_at: nextScan,
        })
        .eq("id", config.id);

      console.log(
        `[CRON] Scan complete for ${config.user_id}: ${report.summary.leaksFound} leaks, $${(report.summary.mrrAtRisk / 100).toFixed(0)}/mo at risk`
      );

      // Send scan completion email (fire-and-forget)
      if (profileData?.email) {
        fireAndForget(sendScanCompleteEmail(profileData.email, report.summary, report.id), "CRON_SCAN_COMPLETE_EMAIL");
      }

      successCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[CRON] Scan failed for ${config.user_id}:`, message);

      // If API key is invalid, deactivate the config
      const lm = message.toLowerCase();
      if (lm.includes("invalid api") || lm.includes("unauthorized") || lm.includes("401") || lm.includes("permissions") || lm.includes("forbidden")) {
        await supabase
          .from("scan_configs")
          .update({ is_active: false })
          .eq("id", config.id);
        console.log(`[CRON] Deactivated config for ${config.user_id} due to API key issue`);
      }

      errorCount++;
    }
  }

  const summary = `Processed ${configs.length} scans: ${successCount} succeeded, ${errorCount} failed`;
  console.log(`[CRON] ${summary}`);

  return NextResponse.json({
    message: summary,
    processed: configs.length,
    success: successCount,
    errors: errorCount,
  });
}

