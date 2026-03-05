import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

// Lazy Stripe instance for billing operations (separate from stripe-scanner which uses customer API keys)
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

// Service-role Supabase client for admin operations
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Map plan IDs to Stripe Price IDs
export const PLAN_PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
};

// Map Stripe Price IDs back to plan names
export function getPlanFromPriceId(priceId: string): "pro" | "team" | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return "team";
  return null;
}

/**
 * Get or create a Stripe customer for a user.
 * Checks profiles.stripe_customer_id first, creates customer if null.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = getServiceClient();

  // Check if customer already exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create Stripe customer
  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  });

  // Save to profile
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for a subscription.
 */
export async function createCheckoutSession({
  userId,
  email,
  plan,
  baseUrl,
}: {
  userId: string;
  email: string;
  plan: "pro" | "team";
  baseUrl: string;
}): Promise<string> {
  const priceId = PLAN_PRICE_MAP[plan];
  if (!priceId) {
    throw new Error(`No price configured for plan: ${plan}`);
  }

  const customerId = await getOrCreateStripeCustomer(userId, email);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/#pricing`,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}

/**
 * Create a Stripe Billing Portal session.
 */
export async function createBillingPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Construct and verify a Stripe webhook event.
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );
}

export { getStripe, getServiceClient };
