// ============================================================
// Polar Action Executor
// Executes write actions against the Polar API
// ============================================================

import type { RecoveryAction, RemoveCouponActionData, CancelSubscriptionActionData } from "../types";
import type { ExecutionResult } from "./types";

const POLAR_API = "https://api.polar.sh/v1";

/**
 * Polar doesn't support payment retry via API.
 */
export async function polarRetryPayment(
  _apiKey: string,
  _action: RecoveryAction
): Promise<ExecutionResult> {
  return {
    success: false,
    error: "Payment retry is not supported by Polar. Use dunning emails instead.",
  };
}

/**
 * Remove a discount from a Polar subscription.
 * Uses: PATCH /v1/subscriptions/{id} to clear discount
 */
export async function polarRemoveCoupon(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as RemoveCouponActionData;
  const subscriptionId = data.subscriptionId || action.subscription_id;

  if (!subscriptionId) {
    return { success: false, error: "Missing subscription ID for discount removal." };
  }

  try {
    const res = await fetch(`${POLAR_API}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ discount_id: null }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: formatPolarError(res.status, body),
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to remove discount from Polar subscription.",
    };
  }
}

/**
 * Cancel a Polar subscription.
 * Uses: DELETE /v1/subscriptions/{id} to cancel
 */
export async function polarCancelSubscription(
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const data = action.action_data as CancelSubscriptionActionData;
  const subscriptionId = data.subscriptionId || action.subscription_id;

  if (!subscriptionId) {
    return { success: false, error: "Missing subscription ID for cancellation." };
  }

  try {
    const res = await fetch(`${POLAR_API}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: formatPolarError(res.status, body),
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel Polar subscription.",
    };
  }
}

function formatPolarError(status: number, body: string): string {
  if (status === 401) {
    return "Invalid Action API Key. Please check your Polar token in Settings.";
  }
  if (status === 403) {
    return "Token is missing write permissions. Please use a Polar token with subscriptions:write scope.";
  }
  if (status === 404) {
    return "Subscription not found. It may have already been cancelled.";
  }
  if (status === 429) {
    return "Polar rate limit hit. Please wait a moment and try again.";
  }
  try {
    const parsed = JSON.parse(body);
    return parsed.detail || parsed.message || `Polar API error (${status})`;
  } catch {
    return `Polar API error (${status})`;
  }
}
