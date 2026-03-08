/**
 * Slack Webhook Integration
 *
 * Sends formatted notifications to user-configured Slack channels
 * via incoming webhooks. Used for scan completion alerts and
 * recovery action summaries.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("SLACK");

interface SlackScanPayload {
  leaksFound: number;
  mrrAtRisk: number;
  healthScore: number;
  recoveryPotential: number;
  reportId: string;
  baseUrl: string;
}

interface SlackActionPayload {
  actionType: string;
  customerId: string;
  status: "executed" | "failed";
  error?: string;
}

/**
 * Validate a Slack incoming webhook URL.
 */
export function isValidSlackWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "hooks.slack.com" &&
      parsed.pathname.startsWith("/services/")
    );
  } catch {
    return false;
  }
}

/**
 * Send a scan completion notification to Slack.
 */
export async function sendSlackScanNotification(
  webhookUrl: string,
  payload: SlackScanPayload
): Promise<void> {
  const mrrFormatted = `$${(payload.mrrAtRisk / 100).toLocaleString()}`;
  const recoveryFormatted = `$${(payload.recoveryPotential / 100).toLocaleString()}`;
  const reportUrl = `${payload.baseUrl}/report/${payload.reportId}`;

  const scoreEmoji =
    payload.healthScore >= 80
      ? "🟢"
      : payload.healthScore >= 60
        ? "🟡"
        : "🔴";

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🔍 Scan Complete: ${payload.leaksFound} leak${payload.leaksFound === 1 ? "" : "s"} found`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Health Score*\n${scoreEmoji} ${payload.healthScore}/100`,
        },
        {
          type: "mrkdwn",
          text: `*MRR at Risk*\n${mrrFormatted}/mo`,
        },
        {
          type: "mrkdwn",
          text: `*Leaks Found*\n${payload.leaksFound}`,
        },
        {
          type: "mrkdwn",
          text: `*Recovery Potential*\n${recoveryFormatted}/mo`,
        },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Full Report →",
            emoji: true,
          },
          url: reportUrl,
          style: "primary",
        },
      ],
    },
  ];

  await sendSlackMessage(webhookUrl, { blocks });
}

/**
 * Send a recovery action status notification to Slack.
 */
export async function sendSlackActionNotification(
  webhookUrl: string,
  payload: SlackActionPayload
): Promise<void> {
  const statusEmoji = payload.status === "executed" ? "✅" : "❌";
  const actionLabel = payload.actionType.replace(/_/g, " ");

  const text =
    payload.status === "executed"
      ? `${statusEmoji} *Action executed*: ${actionLabel} for customer \`${payload.customerId}\``
      : `${statusEmoji} *Action failed*: ${actionLabel} for customer \`${payload.customerId}\`\n> ${payload.error || "Unknown error"}`;

  await sendSlackMessage(webhookUrl, { text });
}

/**
 * Send a raw message to a Slack webhook.
 */
async function sendSlackMessage(
  webhookUrl: string,
  body: Record<string, unknown>
): Promise<void> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      log.error(`Slack webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    log.error("Slack webhook error:", err);
  }
}

/**
 * Get the Slack webhook URL for a user from their scan config.
 * Returns null if not configured.
 */
export async function getSlackWebhookUrl(
  userId: string
): Promise<string | null> {
  try {
    const { createClient } = await import("@supabase/supabase-js");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("scan_configs")
      .select("slack_webhook_url")
      .eq("user_id", userId)
      .single();

    return data?.slack_webhook_url || null;
  } catch {
    return null;
  }
}
