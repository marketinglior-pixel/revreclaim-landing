import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

// Service-role Supabase client for admin operations
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ---------------------------------------------------------------------------
// Plan <-> Variant mapping
// ---------------------------------------------------------------------------

/**
 * Map plan names to Lemon Squeezy Variant IDs.
 * Set these in your environment variables after creating products in LS dashboard.
 */
export const PLAN_VARIANT_MAP: Record<string, string | undefined> = {
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
  team: process.env.LEMONSQUEEZY_TEAM_VARIANT_ID,
};

/**
 * Reverse lookup — get plan name from a Lemon Squeezy variant ID.
 */
export function getPlanFromVariantId(variantId: string): "pro" | "team" | null {
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  if (variantId === process.env.LEMONSQUEEZY_TEAM_VARIANT_ID) return "team";
  return null;
}

// ---------------------------------------------------------------------------
// Checkout URL
// ---------------------------------------------------------------------------

/**
 * Build a Lemon Squeezy checkout URL.
 *
 * LS uses URL-based checkout — no server-side session creation needed.
 * We pass the userId as custom data so the webhook can identify the user.
 *
 * Format: https://<store>.lemonsqueezy.com/checkout/buy/<variant-uuid>
 *   ?checkout[custom][user_id]=xxx
 *   &checkout[email]=xxx
 *   &checkout[success_url]=xxx
 */
export function buildCheckoutUrl({
  userId,
  email,
  plan,
  baseUrl,
}: {
  userId: string;
  email: string;
  plan: "pro" | "team";
  baseUrl: string;
}): string {
  const variantId = PLAN_VARIANT_MAP[plan];
  if (!variantId) {
    throw new Error(`No Lemon Squeezy variant configured for plan: ${plan}`);
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not configured");
  }

  const url = new URL(
    `https://${storeId}.lemonsqueezy.com/checkout/buy/${variantId}`
  );

  // Pass custom data to identify user in webhook
  url.searchParams.set("checkout[custom][user_id]", userId);
  url.searchParams.set("checkout[custom][plan]", plan);
  url.searchParams.set("checkout[email]", email);
  url.searchParams.set(
    "checkout[success_url]",
    `${baseUrl}/dashboard?upgraded=true`
  );

  return url.toString();
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

/**
 * Verify a Lemon Squeezy webhook signature.
 *
 * LS signs webhooks with HMAC SHA-256 using the webhook secret.
 * The signature is in the `x-signature` header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(digest, "hex"),
    Buffer.from(signature, "hex")
  );
}

// ---------------------------------------------------------------------------
// Webhook payload types
// ---------------------------------------------------------------------------

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      product_name: string;
      variant_name: string;
      status: string;
      card_brand: string | null;
      renews_at: string | null;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
      urls: {
        update_payment_method: string;
        customer_portal: string;
        customer_portal_update_subscription: string;
      };
      first_subscription_item?: {
        id: number;
        subscription_id: number;
        price_id: number;
        quantity: number;
        created_at: string;
        updated_at: string;
      };
    };
  };
}

export { getServiceClient };
