import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { runFullScan } from "@/lib/stripe-scanner";
import { runPlatformScan } from "@/lib/platforms";
import type { BillingPlatform } from "@/lib/platforms/types";
import { decrypt } from "@/lib/encryption";
import { sendScanCompleteEmail } from "@/lib/email";
import {
  sendSlackScanNotification,
} from "@/lib/notifications/slack";
import { calculateNextScan } from "@/lib/scan-utils";
import { generateRecoveryActions } from "@/lib/recovery/action-generator";
import { executeAction } from "@/lib/recovery/executor";
import type { RecoveryAction, DunningEmailActionData } from "@/lib/recovery/types";
import { canUseRecoveryActions } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { verifyCronSecret } from "@/lib/api-security";
import { fireAndForget } from "@/lib/fire-and-forget";
import { sendWebhookNotification } from "@/lib/notifications/webhook";
import { createLogger } from "@/lib/logger";

const log = createLogger("CRON");

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

  log.info("Weekly scan job started");

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
    log.error("Failed to fetch configs:", fetchError.message);
    return NextResponse.json(
      { error: "Failed to fetch scan configs" },
      { status: 500 }
    );
  }

  if (!configs || configs.length === 0) {
    log.info("No scans due at this time");
    return NextResponse.json({ message: "No scans due", processed: 0 });
  }

  log.info(`Found ${configs.length} scan(s) to process`);

  let successCount = 0;
  let errorCount = 0;

  for (const config of configs) {
    try {
      // Decrypt the API key
      const apiKey = decrypt(config.encrypted_api_key);
      const platform: BillingPlatform = (config.platform as BillingPlatform) || "stripe";

      log.info(`Running ${platform} scan for user ${config.user_id}`);

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
        log.error(`Failed to save report for ${config.user_id}:`, insertError.message);
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
              log.error(`Failed to insert recovery actions for ${config.user_id}:`, actionsErr.message);
            } else {
              log.info(`Generated ${actions.length} recovery actions for ${config.user_id}`);
            }

            // Pre-dunning: auto-execute expiring card reminders
            if (config.pre_dunning_enabled && !actionsErr) {
              try {
                const preDunningActions = actions.filter(
                  (a) =>
                    a.action_type === "send_dunning_email" &&
                    (a.action_data as unknown as DunningEmailActionData).template === "expiring_card"
                );

                let preDunningSent = 0;
                for (const pdAction of preDunningActions) {
                  // Dedup check: don't send if we already sent for this customer+leak
                  const { count: existingCount } = await supabase
                    .from("recovery_actions")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", config.user_id)
                    .eq("customer_id", pdAction.customer_id)
                    .eq("action_type", "send_dunning_email")
                    .eq("status", "executed")
                    .neq("report_id", report.id);

                  if (existingCount && existingCount > 0) {
                    continue; // Already sent a pre-dunning email for this customer
                  }

                  // Find the inserted action row to auto-approve and execute
                  const { data: insertedAction } = await supabase
                    .from("recovery_actions")
                    .select("*")
                    .eq("user_id", config.user_id)
                    .eq("report_id", report.id)
                    .eq("leak_id", pdAction.leak_id)
                    .eq("action_type", "send_dunning_email")
                    .eq("status", "pending")
                    .single();

                  if (insertedAction) {
                    // Auto-approve
                    await supabase
                      .from("recovery_actions")
                      .update({ status: "approved", approved_at: new Date().toISOString() })
                      .eq("id", insertedAction.id);

                    // Execute the dunning email
                    const result = await executeAction(
                      insertedAction as unknown as RecoveryAction
                    );

                    if (result.success) {
                      await supabase
                        .from("recovery_actions")
                        .update({ status: "executed", executed_at: new Date().toISOString() })
                        .eq("id", insertedAction.id);
                      preDunningSent++;
                    } else {
                      await supabase
                        .from("recovery_actions")
                        .update({ status: "failed", error_message: result.error || "Pre-dunning failed" })
                        .eq("id", insertedAction.id);
                      log.error(`Pre-dunning failed for cus_••••${(pdAction.customer_id || "").slice(-4)}: ${result.error}`);
                    }
                  }
                }

                if (preDunningSent > 0) {
                  log.info(`Pre-dunning: sent ${preDunningSent} card expiry reminders for ${config.user_id}`);
                }
              } catch (pdErr) {
                log.error(`Pre-dunning error for ${config.user_id}:`, pdErr);
              }
            }
          }
        } catch (actionErr) {
          log.error(`Action generation error for ${config.user_id}:`, actionErr);
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

      log.info(
        `Scan complete for ${config.user_id}: ${report.summary.leaksFound} leaks, $${(report.summary.mrrAtRisk / 100).toFixed(0)}/mo at risk`
      );

      // Send scan completion email (fire-and-forget)
      if (profileData?.email) {
        fireAndForget(sendScanCompleteEmail(profileData.email, report.summary, report.id), "CRON_SCAN_COMPLETE_EMAIL");
      }

      // Send Slack notification if configured (fire-and-forget)
      if (config.slack_webhook_url) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";
        fireAndForget(
          sendSlackScanNotification(config.slack_webhook_url, {
            leaksFound: report.summary.leaksFound,
            mrrAtRisk: report.summary.mrrAtRisk,
            healthScore: report.summary.healthScore,
            recoveryPotential: report.summary.recoveryPotential,
            reportId: report.id,
            baseUrl,
          }),
          "CRON_SLACK_NOTIFICATION"
        );
      }

      // Send custom webhook notification if configured (fire-and-forget)
      if (config.webhook_url && config.webhook_secret) {
        fireAndForget(
          sendWebhookNotification(config.webhook_url, config.webhook_secret, "scan_complete", {
            reportId: report.id,
            platform,
            leaksFound: report.summary.leaksFound,
            mrrAtRisk: report.summary.mrrAtRisk,
            healthScore: report.summary.healthScore,
            recoveryPotential: report.summary.recoveryPotential,
          }),
          "CRON_WEBHOOK"
        );
      }

      successCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      log.error(`Scan failed for ${config.user_id}:`, message);

      // If API key is invalid, deactivate the config
      const lm = message.toLowerCase();
      if (lm.includes("invalid api") || lm.includes("unauthorized") || lm.includes("401") || lm.includes("permissions") || lm.includes("forbidden")) {
        await supabase
          .from("scan_configs")
          .update({ is_active: false })
          .eq("id", config.id);
        log.info(`Deactivated config for ${config.user_id} due to API key issue`);
      }

      errorCount++;
    }
  }

  const summary = `Processed ${configs.length} scans: ${successCount} succeeded, ${errorCount} failed`;
  log.info(`${summary}`);

  return NextResponse.json({
    message: summary,
    processed: configs.length,
    success: successCount,
    errors: errorCount,
  });
}

