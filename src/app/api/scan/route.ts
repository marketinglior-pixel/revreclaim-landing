import { NextRequest, NextResponse } from "next/server";
import { runFullScan } from "@/lib/stripe-scanner";
import { runPlatformScan, type BillingPlatform } from "@/lib/platforms";
import { validateApiKey, validateEmail } from "@/lib/utils";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { guardMutation } from "@/lib/api-security";
import { authenticateAndCheckPlan } from "@/lib/scan/authenticate";
import { notifyScanStarted, notifyScanCompleted } from "@/lib/scan/notify";
import { persistScanResults } from "@/lib/scan/persist";
import { tryEnrichLeaks } from "@/lib/scan/enrich-step";
import { createLogger } from "@/lib/logger";

const log = createLogger("SCAN");

export const maxDuration = 60; // Allow up to 60s for large accounts

export async function POST(req: NextRequest) {
  const guard = guardMutation(req);
  if (guard) return guard;

  try {
    // Rate limit: 15 scans per IP per hour
    const ip = getClientIP(req);
    const rl = await rateLimit(
      { name: "scan", maxRequests: 15, windowSeconds: 3600 },
      ip
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Too many scans. Please try again in ${rl.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSeconds) },
        }
      );
    }

    const body = await req.json();
    const { email, apiKey, platform: rawPlatform } = body;

    // Validate platform (default to stripe)
    const validPlatforms: BillingPlatform[] = ["stripe", "polar", "paddle"];
    const platform: BillingPlatform = validPlatforms.includes(rawPlatform)
      ? rawPlatform
      : "stripe";

    // Validate inputs
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    const keyValidation = validateApiKey(apiKey, platform);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.error },
        { status: 400 }
      );
    }

    // Authenticate + plan enforcement
    const auth = await authenticateAndCheckPlan(email);
    if (auth.blockResponse) {
      return NextResponse.json(
        {
          error: auth.blockResponse.error,
          ...(auth.blockResponse.errorType && {
            errorType: auth.blockResponse.errorType,
          }),
        },
        { status: auth.blockResponse.status }
      );
    }

    log.info(
      `Started for user=${auth.userId || "anon"} platform=${platform}`
    );
    notifyScanStarted(auth.userId, email);

    // Run the scan
    let report;
    let emailMap = new Map<string, string>();

    const scanWarnings: string[] = [];

    if (platform === "stripe") {
      const result = await runFullScan(apiKey);
      report = result.report;
      emailMap = result.emailMap;
      scanWarnings.push(...result.warnings);
    } else {
      const result = await runPlatformScan(platform, apiKey);
      report = result.report;
      emailMap = result.emailMap;
    }

    // Normalize platform fields
    if (!report.platform) report.platform = platform;
    if (platform === "stripe") {
      for (const leak of report.leaks) {
        if (leak.stripeUrl && !leak.platformUrl) {
          leak.platformUrl = leak.stripeUrl;
        }
      }
    }

    // CRM Enrichment (HubSpot) — non-blocking, graceful degradation
    if (auth.userId && report.leaks.length > 0) {
      try {
        const enrichResult = await tryEnrichLeaks(
          auth.userId,
          report,
          emailMap
        );
        if (enrichResult) {
          report.leaks = enrichResult.leaks;
          report.enrichedWith = "hubspot";
          log.info(
            `Enriched ${enrichResult.enrichedCount}/${report.leaks.length} leaks (${enrichResult.matchedContacts} CRM matches)`
          );
        }
      } catch (err) {
        // Enrichment failure should never block the scan
        log.warn(
          "Enrichment failed, proceeding without CRM data:",
          err instanceof Error ? err.message : err
        );
      }
    }

    log.info(
      `Complete for user=${auth.userId || "anon"}: ${report.summary.leaksFound} leaks, $${(report.summary.mrrAtRisk / 100).toFixed(0)}/mo at risk`
    );

    // Persist + generate recovery actions + detect impact (non-blocking for anon)
    if (auth.userId) {
      notifyScanCompleted(auth.userId, email, report);
      // Don't await — DB save is non-critical
      persistScanResults({
        userId: auth.userId,
        report,
        platform,
        apiKey,
        emailMap,
      }).catch((err) => log.error("Persist error:", err));
    }

    // Build warnings
    if (platform === "stripe" && apiKey.startsWith("sk_")) {
      scanWarnings.push(
        "You used a secret key with full write access. We recommend creating a restricted read-only key (rk_live_...) and rotating this key in your Stripe Dashboard."
      );
    }

    return NextResponse.json({ report, ...(scanWarnings.length > 0 && { warnings: scanWarnings }) });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Scan failed. Please try again.";

    log.error(`${message}`);

    let errorType = "scan_failed";
    let userMessage = message;
    const lower = message.toLowerCase();
    if (
      lower.includes("invalid api key") ||
      lower.includes("invalid api token") ||
      lower.includes("unauthorized") ||
      lower.includes("authentication") ||
      lower.includes("401")
    ) {
      errorType = "invalid_key";
    } else if (
      lower.includes("permissions") ||
      lower.includes("forbidden") ||
      lower.includes("permission")
    ) {
      errorType = "insufficient_permissions";
      // If the error doesn't already specify the resource, add a helpful message
      if (!lower.includes("subscriptions") && !lower.includes("read access")) {
        userMessage =
          "This API key is missing required permissions. Please ensure read access is enabled for: Subscriptions, Invoices, Products, Prices, and Coupons. Customers read access is recommended but optional.";
      }
    }

    return NextResponse.json(
      { error: userMessage, errorType },
      { status: errorType === "scan_failed" ? 500 : 400 }
    );
  }
}
