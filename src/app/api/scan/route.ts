import { NextRequest, NextResponse } from "next/server";
import { runFullScan } from "@/lib/stripe-scanner";
import { runPlatformScan, type BillingPlatform } from "@/lib/platforms";
import { validateApiKey, validateEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { canRunScan } from "@/lib/plan-limits";
import type { PlanType } from "@/lib/plan-limits";
import { sendScanCompleteEmail, sendScanLimitReachedEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";
import { generateRecoveryActions } from "@/lib/recovery/action-generator";
import { canUseRecoveryActions } from "@/lib/plan-limits";

export const maxDuration = 60; // Allow up to 60s for large accounts

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 scans per IP per hour
    const ip = getClientIP(req);
    const rl = rateLimit({ name: "scan", maxRequests: 5, windowSeconds: 3600 }, ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many scans. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const { email, apiKey, platform: rawPlatform } = body;

    // Validate platform (default to stripe)
    const validPlatforms: BillingPlatform[] = ["stripe", "polar", "paddle"];
    const platform: BillingPlatform = validPlatforms.includes(rawPlatform) ? rawPlatform : "stripe";

    // Validate email
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate API key format (platform-aware)
    const keyValidation = validateApiKey(apiKey, platform);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.error },
        { status: 400 }
      );
    }

    // Plan enforcement: check if authenticated user can run a scan
    let authenticatedUserId: string | null = null;
    try {
      const supabaseCheck = await createClient();
      const { data: { user: authUser } } = await supabaseCheck.auth.getUser();
      if (authUser) {
        authenticatedUserId = authUser.id;
        const { data: profile } = await supabaseCheck
          .from("profiles")
          .select("plan, scan_count_this_period, is_disabled")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          // Kill switch: block disabled users instantly
          if (profile.is_disabled) {
            return NextResponse.json(
              { error: "Your account has been suspended. Please contact support." },
              { status: 403 }
            );
          }

          const plan = (profile.plan || "free") as PlanType;
          const scanCount = profile.scan_count_this_period ?? 0;
          const scanCheck = canRunScan(plan, scanCount);
          if (!scanCheck.allowed) {
            sendScanLimitReachedEmail(email).catch(() => {});
            return NextResponse.json(
              { error: scanCheck.reason, errorType: "plan_limit" },
              { status: 403 }
            );
          }
        }
      }
    } catch {
      // Plan check is non-blocking for unauthenticated users
    }

    // Track scan started event
    trackEvent("scan_started", authenticatedUserId, { email }).catch(() => {});

    // Log the scan attempt (NOT the API key or email)
    console.log(
      `[SCAN] Started for user=${authenticatedUserId || "anon"} platform=${platform} at ${new Date().toISOString()}`
    );

    // Log to Google Sheets webhook
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "revreclaim-scan",
          action: "scan_started",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {}); // Fire and forget
    }

    // Run the full scan — dispatch to correct platform scanner
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

    // Ensure platform field is set
    if (!report.platform) report.platform = platform;
    // Set platformUrl aliases for Stripe reports
    if (platform === "stripe") {
      for (const leak of report.leaks) {
        if (leak.stripeUrl && !leak.platformUrl) {
          leak.platformUrl = leak.stripeUrl;
        }
      }
    }

    console.log(
      `[SCAN] Complete for user=${authenticatedUserId || "anon"}: ${report.summary.leaksFound} leaks found, $${(report.summary.mrrAtRisk / 100).toFixed(0)}/mo at risk`
    );

    // Log completion to webhook
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "revreclaim-scan",
          action: "scan_completed",
          leaksFound: report.summary.leaksFound,
          mrrAtRisk: report.summary.mrrAtRisk,
          healthScore: report.summary.healthScore,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    // If user is authenticated, save report to database and increment scan count
    try {
      const supabase = await createClient();
      const userId = authenticatedUserId;

      if (userId) {
        const isTestMode = platform === "stripe"
          ? apiKey.startsWith("rk_test_")
          : false;
        const { error: dbError } = await supabase.from("reports").insert({
          id: report.id,
          user_id: userId,
          platform,
          summary: JSON.parse(JSON.stringify(report.summary)),
          categories: JSON.parse(JSON.stringify(report.categories)),
          leaks: JSON.parse(JSON.stringify(report.leaks)),
          is_test_mode: isTestMode,
        });

        if (dbError) {
          console.error("[SCAN] Failed to save report to DB:", dbError.message);
        } else {
          console.log(`[SCAN] Report ${report.id} saved to DB for user ${userId}`);

          // Track scan completed + send email (fire-and-forget)
          trackEvent("scan_completed", userId, {
            reportId: report.id,
            leaksFound: report.summary.leaksFound,
            mrrAtRisk: report.summary.mrrAtRisk,
            healthScore: report.summary.healthScore,
          }).catch(() => {});
          sendScanCompleteEmail(email, report.summary, report.id).catch(() => {});

          // Increment scan count (fire-and-forget)
          supabase
            .from("profiles")
            .select("scan_count_this_period, plan")
            .eq("id", userId)
            .single()
            .then(async ({ data: p }) => {
              if (p) {
                supabase
                  .from("profiles")
                  .update({ scan_count_this_period: (p.scan_count_this_period ?? 0) + 1 })
                  .eq("id", userId)
                  .then(() => {});

                // Generate recovery actions for Pro/Team users
                const userPlan = (p.plan || "free") as PlanType;
                if (canUseRecoveryActions(userPlan).allowed && report.leaks.length > 0) {
                  try {
                    const actions = generateRecoveryActions(report, emailMap, platform);
                    if (actions.length > 0) {
                      const rows = actions.map((a) => ({
                        user_id: userId,
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
                        console.error("[SCAN] Failed to insert recovery actions:", actionsErr.message);
                      } else {
                        console.log(`[SCAN] Generated ${actions.length} recovery actions for user ${userId}`);
                      }
                    }
                  } catch (actionErr) {
                    console.error("[SCAN] Action generation error:", actionErr);
                  }
                }
              }
            });
        }
      }
    } catch (dbErr) {
      // DB save is non-critical — log and continue
      console.error("[SCAN] DB save error:", dbErr);
    }

    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Scan failed. Please try again.";

    console.error(`[SCAN ERROR] ${message}`);

    // Determine error type for the client
    let errorType = "scan_failed";
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes("invalid api key") ||
      lowerMessage.includes("invalid api token") ||
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("authentication") ||
      lowerMessage.includes("401")
    ) {
      errorType = "invalid_key";
    } else if (lowerMessage.includes("permissions") || lowerMessage.includes("forbidden")) {
      errorType = "insufficient_permissions";
    }

    return NextResponse.json(
      { error: message, errorType },
      { status: errorType === "scan_failed" ? 500 : 400 }
    );
  }
}
