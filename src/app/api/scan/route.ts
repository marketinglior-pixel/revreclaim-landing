import { NextRequest, NextResponse } from "next/server";
import { runFullScan } from "@/lib/stripe-scanner";
import { validateApiKey, validateEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

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
    const { email, apiKey } = body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate API key format
    const keyValidation = validateApiKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.error },
        { status: 400 }
      );
    }

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

    // Run the full scan
    const report = await runFullScan(apiKey);

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

    // If user is authenticated, save report to database
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const isTestMode = apiKey.startsWith("rk_test_");
        const { error: dbError } = await supabase.from("reports").insert({
          id: report.id,
          user_id: user.id,
          summary: JSON.parse(JSON.stringify(report.summary)),
          categories: JSON.parse(JSON.stringify(report.categories)),
          leaks: JSON.parse(JSON.stringify(report.leaks)),
          is_test_mode: isTestMode,
        });

        if (dbError) {
          console.error("[SCAN] Failed to save report to DB:", dbError.message);
        } else {
          console.log(`[SCAN] Report ${report.id} saved to DB for user ${user.id}`);
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
    if (message.includes("Invalid API key")) {
      errorType = "invalid_key";
    } else if (message.includes("permissions")) {
      errorType = "insufficient_permissions";
    }

    return NextResponse.json(
      { error: message, errorType },
      { status: errorType === "scan_failed" ? 500 : 400 }
    );
  }
}
