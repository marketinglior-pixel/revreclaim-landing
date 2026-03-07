// ============================================================
// Platform Executor Registry
// Dispatches write actions to the correct platform executor
// ============================================================

import type { RecoveryAction, ActionType } from "../types";
import type { BillingPlatform } from "../../platforms/types";
import type { ExecutionResult } from "./types";

import {
  stripeRetryPayment,
  stripeRemoveCoupon,
  stripeCancelSubscription,
} from "./stripe-executor";

import {
  polarRetryPayment,
  polarRemoveCoupon,
  polarCancelSubscription,
} from "./polar-executor";

import {
  paddleRetryPayment,
  paddleRemoveCoupon,
  paddleCancelSubscription,
} from "./paddle-executor";

type PlatformActionFn = (
  apiKey: string,
  action: RecoveryAction
) => Promise<ExecutionResult>;

/**
 * Registry mapping: platform → action_type → executor function
 */
const EXECUTOR_REGISTRY: Record<
  BillingPlatform,
  Partial<Record<ActionType, PlatformActionFn>>
> = {
  stripe: {
    retry_payment: stripeRetryPayment,
    remove_coupon: stripeRemoveCoupon,
    cancel_subscription: stripeCancelSubscription,
  },
  polar: {
    retry_payment: polarRetryPayment,
    remove_coupon: polarRemoveCoupon,
    cancel_subscription: polarCancelSubscription,
  },
  paddle: {
    retry_payment: paddleRetryPayment,
    remove_coupon: paddleRemoveCoupon,
    cancel_subscription: paddleCancelSubscription,
  },
};

/**
 * Execute a platform write action.
 *
 * @param platform - The billing platform (stripe, polar, paddle)
 * @param apiKey - The decrypted write-capable API key
 * @param action - The recovery action to execute
 */
export async function executePlatformAction(
  platform: BillingPlatform,
  apiKey: string,
  action: RecoveryAction
): Promise<ExecutionResult> {
  const platformExecutors = EXECUTOR_REGISTRY[platform];
  if (!platformExecutors) {
    return {
      success: false,
      error: `Unsupported platform: ${platform}`,
    };
  }

  const executor = platformExecutors[action.action_type];
  if (!executor) {
    return {
      success: false,
      error: `Action "${action.action_type}" is not supported for ${platform}.`,
    };
  }

  return executor(apiKey, action);
}

/**
 * Check if a platform + action combination is supported.
 */
export function isPlatformActionSupported(
  platform: BillingPlatform,
  actionType: ActionType
): boolean {
  return !!EXECUTOR_REGISTRY[platform]?.[actionType];
}

export type { ExecutionResult } from "./types";
