/**
 * Custom Webhook Integration
 *
 * Sends signed JSON payloads to user-configured webhook URLs
 * on key events (scan_complete, action_executed, action_failed).
 *
 * Enables integration with Zapier, n8n, custom dashboards, etc.
 * Security: HMAC-SHA256 signature in X-RevReclaim-Signature header.
 */

import { createHmac, randomBytes } from "crypto";
import { createLogger } from "@/lib/logger";

const log = createLogger("WEBHOOK");

export type WebhookEvent =
  | "scan_complete"
  | "action_executed"
  | "action_failed"
  | "test";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface ScanCompleteData {
  reportId: string;
  leaksFound: number;
  mrrAtRisk: number;
  healthScore: number;
  recoveryPotential: number;
  platform: string;
}

export interface ActionEventData {
  actionId: string;
  actionType: string;
  customerId: string;
  monthlyImpact: number;
  status: "executed" | "failed";
  error?: string;
}

/**
 * Generate a random webhook secret for HMAC signing.
 */
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

/**
 * Validate a webhook URL.
 * Must be a valid HTTPS URL (HTTP allowed for localhost in dev).
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Allow HTTP only for localhost (development)
    if (parsed.protocol === "http:") {
      return (
        parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
      );
    }
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sign a payload string using HMAC-SHA256.
 */
function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Send a webhook notification to a configured URL.
 * Includes HMAC-SHA256 signature for verification.
 *
 * @param url - The webhook endpoint URL
 * @param secret - The webhook secret for HMAC signing
 * @param event - The event type
 * @param data - Event-specific data
 */
export async function sendWebhookNotification(
  url: string,
  secret: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);
  const signature = signPayload(body, secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RevReclaim-Signature": signature,
        "X-RevReclaim-Event": event,
        "User-Agent": "RevReclaim-Webhook/1.0",
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      log.error(`Webhook failed: ${res.status} ${res.statusText} → ${url}`);
    } else {
      log.info(`Webhook sent: ${event} → ${url} (${res.status})`);
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      log.error(`Webhook timeout: ${event} → ${url}`);
    } else {
      log.error(`Webhook error: ${event} → ${url}`, err);
    }
  }
}

/**
 * Get webhook config for a user from their scan config.
 * Returns null if not configured.
 */
export async function getWebhookConfig(
  userId: string
): Promise<{ url: string; secret: string } | null> {
  try {
    const { createClient } = await import("@supabase/supabase-js");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("scan_configs")
      .select("webhook_url, webhook_secret")
      .eq("user_id", userId)
      .single();

    if (data?.webhook_url && data?.webhook_secret) {
      return { url: data.webhook_url, secret: data.webhook_secret };
    }

    return null;
  } catch {
    return null;
  }
}
