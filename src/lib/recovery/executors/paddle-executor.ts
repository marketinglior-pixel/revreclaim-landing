// ============================================================
// Paddle Action Executor
// Executes write actions against the Paddle API
// ============================================================

import type { RecoveryAction, RemoveCouponActionData, CancelSubscriptionActionData } from "../types";
import type { ExecutionResult } from "./types";

const PADDLE_API = "https://api.paddle.com";

/**
 * Paddle doesn't support direct payment retry via API.
 */
export async function paddleRetryPayment(
  _apiKey: string,
  _action: RecoveryAction
): Promise<ExecutionResult> {
  return {
    success: false,
    error: "Payment retry is not supported by Paddle. Use dunning emails instead.",
  };
}

/**
 * Remove a discount from a Paddle subscription.
 * Uses: PATCH /subscriptions/{id} to clear the discount
 */
export async function paddleRemoveCoupon(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as RemoveCouponActionData;
  const subscriptionId = data.subscriptionId || action.subscription_id;

  if (!subscriptionId) {
    return { success: false, error: "Missing subscription ID for discount removal." };
  }

  try {
    const res = await fetch(`${PADDLE_API}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ discount: null }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: formatPaddleError(res.status, body),
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to remove discount from Paddle subscription.",
    };
  }
}

/**
 * Cancel a Paddle subscription.
 * Uses: POST /subscriptions/{id}/cancel
 */
export async function paddleCancelSubscription(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as CancelSubscriptionActionData;
  const subscriptionId = data.subscriptionId || action.subscription_id;

  if (!subscriptionId) {
    return { success: false, error: "Missing subscription ID for cancellation." };
  }

  try {
    const res = await fetch(`${PADDLE_API}/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        effective_from: "next_billing_period",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: formatPaddleError(res.status, body),
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel Paddle subscription.",
    };
  }
}

function formatPaddleError(status: number, body: string): string {
  if (status === 401) {
    return "Invalid Action API Key. Please check your Paddle key in Settings.";
  }
  if (status === 403) {
    return "API key does not have write permissions. Please use a Paddle key with subscription update access.";
  }
  if (status === 404) {
    return "Subscription not found. It may have already been cancelled.";
  }
  if (status === 429) {
    return "Paddle rate limit hit. Please wait a moment and try again.";
  }
  try {
    const parsed = JSON.parse(body);
    const err = parsed.error?.detail || parsed.error?.message || parsed.message;
    return err || `Paddle API error (${status})`;
  } catch {
    return `Paddle API error (${status})`;
  }
}
