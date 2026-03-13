// ============================================================
// Stripe Action Executor
// Executes write actions against the Stripe API
// ============================================================

import type { RecoveryAction, RetryPaymentActionData, RemoveCouponActionData, CancelSubscriptionActionData } from "../types";
import type { ExecutionResult } from "./types";

/**
 * Retry a failed payment by paying the invoice.
 */
export async function stripeRetryPayment(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as RetryPaymentActionData;

  if (!data.invoiceId) {
    return { success: false, error: "Missing invoice ID for payment retry." };
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(apiKey, { apiVersion: "2026-02-25.clover" });

    const invoice = await stripe.invoices.pay(data.invoiceId);

    if (invoice.status === "paid") {
      return { success: true };
    }

    return {
      success: false,
      error: `Invoice status after retry: ${invoice.status}. Payment may still be processing.`,
    };
  } catch (err) {
    return {
      success: false,
      error: formatStripeError(err),
    };
  }
}

/**
 * Remove an expired coupon/discount from a subscription.
 */
export async function stripeRemoveCoupon(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as RemoveCouponActionData;
  const subscriptionId = data.subscriptionId || action.subscription_id;

  if (!subscriptionId) {
    return { success: false, error: "Missing subscription ID for coupon removal." };
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(apiKey, { apiVersion: "2026-02-25.clover" });

    // Remove the discount from the subscription
    await stripe.subscriptions.deleteDiscount(subscriptionId);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: formatStripeError(err),
    };
  }
}

/**
 * Cancel a stuck subscription that's stuck in a broken state.
 */
export async function stripeCancelSubscription(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as CancelSubscriptionActionData;
  const subscriptionId = data.subscriptionId || action.subscription_id;

  if (!subscriptionId) {
    return { success: false, error: "Missing subscription ID for cancellation." };
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(apiKey, { apiVersion: "2026-02-25.clover" });

    const sub = await stripe.subscriptions.cancel(subscriptionId);

    if (sub.status === "canceled") {
      return { success: true };
    }

    return {
      success: false,
      error: `Subscription status after cancel: ${sub.status}`,
    };
  } catch (err) {
    return {
      success: false,
      error: formatStripeError(err),
    };
  }
}

function formatStripeError(err: unknown): string {
  if (err && typeof err === "object" && "type" in err) {
    const stripeErr = err as { type: string; message?: string; code?: string };
    if (stripeErr.type === "StripePermissionError") {
      return "API key does not have permission for this action. Please use a key with write access to Invoices and Subscriptions.";
    }
    if (stripeErr.type === "StripeAuthenticationError") {
      return "Invalid API key. Please check your Action API Key in Settings.";
    }
    return stripeErr.message || `Stripe error: ${stripeErr.type}`;
  }
  if (err instanceof Error) return err.message;
  return "Unknown Stripe error";
}
