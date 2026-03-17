import { LeakType } from "./types";

/**
 * Leak types that require manual review (no automated recovery action).
 * These are separated from "Needs Action" leaks in the report UI.
 */
export const REVIEW_ONLY_LEAK_TYPES: Set<LeakType> = new Set([
  "legacy_pricing",
  "never_expiring_discount",
  "unbilled_overage",
]);

/** Returns true if the leak type has automated recovery actions. */
export function isActionableLeak(type: LeakType): boolean {
  return !REVIEW_ONLY_LEAK_TYPES.has(type);
}

/** Action buckets group leaks by what the founder needs to DO, not by leak type. */
export type ActionBucket = "fix_in_stripe" | "email_customer" | "pricing_decision";

export const LEAK_ACTION_BUCKET: Record<LeakType, ActionBucket> = {
  expired_coupon: "fix_in_stripe",
  duplicate_subscription: "fix_in_stripe",
  trial_expired: "fix_in_stripe",
  missing_payment_method: "fix_in_stripe",
  stuck_subscription: "fix_in_stripe",
  failed_payment: "email_customer",
  expiring_card: "email_customer",
  legacy_pricing: "pricing_decision",
  never_expiring_discount: "pricing_decision",
  unbilled_overage: "pricing_decision",
  stale_coupon: "pricing_decision",
  billing_churn: "email_customer",
};
