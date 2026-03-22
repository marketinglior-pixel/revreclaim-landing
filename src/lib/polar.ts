import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("POLAR");

// Service-role Supabase client for admin operations
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ---------------------------------------------------------------------------
// Plan <-> Product mapping
// ---------------------------------------------------------------------------

/**
 * Map plan names to Polar product IDs.
 * Set these in your environment variables after creating products in Polar dashboard.
 */
export const PLAN_PRODUCT_MAP: Record<string, Record<string, string | undefined>> = {
  audit: {
    monthly: process.env.POLAR_AUDIT_PRODUCT_ID,
    annual: process.env.POLAR_AUDIT_PRODUCT_ID, // Same product, one-time payment
  },
  watch: {
    monthly: process.env.POLAR_WATCH_PRODUCT_ID,
    annual: process.env.POLAR_WATCH_ANNUAL_PRODUCT_ID,
  },
  pro: {
    monthly: process.env.POLAR_PRO_PRODUCT_ID,
    annual: process.env.POLAR_PRO_ANNUAL_PRODUCT_ID,
  },
  team: {
    monthly: process.env.POLAR_TEAM_PRODUCT_ID,
    annual: process.env.POLAR_TEAM_ANNUAL_PRODUCT_ID,
  },
};

/**
 * Reverse lookup — get plan name from a Polar product ID.
 */
export function getPlanFromProductId(
  productId: string
): "audit" | "watch" | "pro" | "team" | null {
  if (productId === process.env.POLAR_AUDIT_PRODUCT_ID)
    return "audit";
  if (
    productId === process.env.POLAR_WATCH_PRODUCT_ID ||
    productId === process.env.POLAR_WATCH_ANNUAL_PRODUCT_ID
  )
    return "watch";
  if (
    productId === process.env.POLAR_PRO_PRODUCT_ID ||
    productId === process.env.POLAR_PRO_ANNUAL_PRODUCT_ID
  )
    return "pro";
  if (
    productId === process.env.POLAR_TEAM_PRODUCT_ID ||
    productId === process.env.POLAR_TEAM_ANNUAL_PRODUCT_ID
  )
    return "team";
  return null;
}

// ---------------------------------------------------------------------------
// Checkout (via Polar API)
// ---------------------------------------------------------------------------

/**
 * Create a Polar checkout session via the API.
 * Polar uses a simple REST API with Bearer token auth.
 * Docs: https://docs.polar.sh/api-reference
 */
export async function createCheckout({
  userId,
  email,
  plan,
  baseUrl,
  discountId,
  billing = "monthly",
}: {
  userId: string;
  email: string;
  plan: "audit" | "watch" | "pro" | "team";
  baseUrl: string;
  discountId?: string;
  billing?: "monthly" | "annual";
}): Promise<string> {
  const productId = PLAN_PRODUCT_MAP[plan]?.[billing];
  if (!productId) {
    throw new Error(`No Polar product configured for plan: ${plan} (${billing})`);
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }

  const res = await fetch("https://api.polar.sh/v1/checkouts/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [productId],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      customer_email: email,
      allow_discount_codes: true,
      ...(discountId ? { discount_id: discountId } : {}),
      metadata: {
        user_id: userId,
        plan,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    log.error("Checkout API error:", errorText);
    throw new Error(`Failed to create checkout: ${res.status}`);
  }

  const data = await res.json();
  const checkoutUrl = data?.url;

  if (!checkoutUrl) {
    throw new Error("No checkout URL returned from Polar");
  }

  return checkoutUrl;
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

/**
 * Verify a Polar webhook signature.
 *
 * Polar uses the Standard Webhooks format:
 * - webhook-id: unique message ID
 * - webhook-timestamp: unix timestamp
 * - webhook-signature: v1,<base64-signature>
 *
 * The secret is base64 encoded with "whsec_" prefix.
 */
export function verifyWebhookSignature(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string
): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("POLAR_WEBHOOK_SECRET is not configured");
  }

  // Polar uses Standard Webhooks format
  // The secret may have prefix "whsec_" or "polar_whs_" before the base64 key
  let rawSecret = secret;
  if (rawSecret.startsWith("polar_whs_")) {
    rawSecret = rawSecret.slice(10); // Remove "polar_whs_" prefix
  } else if (rawSecret.startsWith("whsec_")) {
    rawSecret = rawSecret.slice(6); // Remove "whsec_" prefix
  }
  const secretBytes = Buffer.from(rawSecret, "base64");

  // Reject timestamps older than 5 minutes to prevent replay attacks
  const ts = parseInt(webhookTimestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isNaN(ts) || Math.abs(nowSeconds - ts) > 300) {
    return false;
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const computedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  // The webhook-signature header may contain multiple signatures (v1,xxx v2,yyy)
  const expectedSignatures = webhookSignature
    .split(" ")
    .map((sig) => sig.split(",")[1]);

  return expectedSignatures.some((expected) => {
    if (!expected) return false;
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, "base64"),
        Buffer.from(computedSignature, "base64")
      );
    } catch {
      return false;
    }
  });
}

// ---------------------------------------------------------------------------
// Webhook payload types
// ---------------------------------------------------------------------------

export interface PolarWebhookPayload {
  type: string;
  data: {
    id: string;
    metadata?: {
      user_id?: string;
      plan?: string;
    };
    product_id?: string;
    status?: string;
    customer_id?: string;
    customer?: {
      id: string;
      email: string;
    };
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    started_at?: string;
    ended_at?: string;
  };
}

export { getServiceClient };
