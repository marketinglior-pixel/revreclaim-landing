/**
 * Scan Notifications
 *
 * Handles all fire-and-forget notifications triggered during and after a scan:
 * analytics events, webhook logs, and emails.
 */

import { trackEvent } from "@/lib/analytics";
import { sendScanCompleteEmail } from "@/lib/email";
import { fireAndForget } from "@/lib/fire-and-forget";
import { createLogger } from "@/lib/logger";
import {
  getSlackWebhookUrl,
  sendSlackScanNotification,
} from "@/lib/notifications/slack";
import type { ScanReport } from "@/lib/types";

const log = createLogger("SCAN_NOTIFY");

/**
 * Fire-and-forget: track scan started event + log to webhook.
 */
export function notifyScanStarted(
  userId: string | null,
  email: string
): void {
  fireAndForget(
    trackEvent("scan_started", userId, { email }),
    "SCAN_STARTED_TRACKING"
  );

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    fireAndForget(
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "revreclaim-scan",
          action: "scan_started",
          timestamp: new Date().toISOString(),
        }),
      }),
      "SCAN_STARTED_WEBHOOK"
    );
  }
}

/**
 * Fire-and-forget: track scan completed event, send email, log to webhook.
 */
export function notifyScanCompleted(
  userId: string,
  email: string,
  report: ScanReport
): void {
  fireAndForget(
    trackEvent("scan_completed", userId, {
      reportId: report.id,
      leaksFound: report.summary.leaksFound,
      mrrAtRisk: report.summary.mrrAtRisk,
      healthScore: report.summary.healthScore,
    }),
    "SCAN_COMPLETED_TRACKING"
  );

  // Find top quick-win leak by monthly impact for email
  const topLeak = report.leaks.length > 0
    ? report.leaks.reduce((best, l) => l.monthlyImpact > best.monthlyImpact ? l : best)
    : undefined;

  fireAndForget(
    sendScanCompleteEmail(
      email,
      report.summary,
      report.id,
      topLeak ? { type: topLeak.type, monthlyImpact: topLeak.monthlyImpact } : undefined
    ),
    "SCAN_COMPLETE_EMAIL"
  );

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    fireAndForget(
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
      }),
      "SCAN_COMPLETED_WEBHOOK"
    );
  }

  // Slack notification (per-user webhook)
  fireAndForget(
    (async () => {
      const slackUrl = await getSlackWebhookUrl(userId);
      if (slackUrl) {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://revreclaim.com";
        await sendSlackScanNotification(slackUrl, {
          leaksFound: report.summary.leaksFound,
          mrrAtRisk: report.summary.mrrAtRisk,
          healthScore: report.summary.healthScore,
          recoveryPotential: report.summary.recoveryPotential,
          reportId: report.id,
          baseUrl,
        });
      }
    })(),
    "SCAN_SLACK_NOTIFICATION"
  );

  log.info(
    `Notifications sent for report ${report.id}`
  );
}
