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
    const validPlatforms: BillingPlatform[] = ["stripe", "polar", "lemonsqueezy", "paddle"];
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
          .select("plan, scan_count_this_period")
          .eq("id", authUser.id)
          .single();

        if (profile) {
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

    // Log the scan attempt (NOT the API key)
    console.log(
      `[SCAN] Started for ${email} at ${new Date().toISOString()}`
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
    const report = platform === "stripe"
      ? await runFullScan(apiKey)
      : await runPlatformScan(platform, apiKey);

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
      `[SCAN] Complete for ${email}: ${report.summary.leaksFound} leaks found, $${(report.summary.mrrAtRisk / 100).toFixed(0)}/mo at risk`
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

          // Increment scan count for this billing period
          const { data: currentProfile } = await supabase
            .from("profiles")
            .select("scan_count_this_period")
            .eq("id", userId)
            .single();

          if (currentProfile) {
            await supabase
              .from("profiles")
              .update({
                scan_count_this_period: (currentProfile.scan_count_this_period ?? 0) + 1,
              })
              .eq("id", userId);
          }
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
