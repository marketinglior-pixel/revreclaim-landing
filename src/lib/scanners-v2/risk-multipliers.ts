/**
 * Risk multipliers for scanners that report potential (not actual) losses.
 *
 * These adjust monthlyImpact from "full subscription amount" to
 * "probability-weighted amount at risk."
 *
 * Tune these based on real recovery data once we have enough signal.
 */

export const RISK_MULTIPLIERS = {
  /** 30% chance billing actually fails. Stripe card updater + network auto-updates handle ~70%. */
  expiring_card: 0.3,

  /** 80% chance next billing fails. No card = near-certain failure. */
  missing_payment_method: 0.8,

  /** 50% mixed outcomes. Some reactivate after outreach, some are gone. */
  stuck_subscription: 0.5,

  /** 20% of expired trials can be saved. Most are already lost. */
  trial_expired: 0.2,

  /** 70% — expired coupon is a definite leak, ~30% intentionally left for customer. */
  expired_coupon: 0.7,

  /** 30% — many "forever" discounts are intentional (early adopter, investor, partner). */
  never_expiring_discount: 0.3,

  /** 25% — legacy pricing is real but many founders intentionally grandfather old customers. */
  legacy_pricing: 0.25,

  /** 60% — unbilled overages are likely real, but usage-based billing can be intentional. */
  unbilled_overage: 0.6,

  /** 80% — a failed payment has a real invoice behind it. High certainty. */
  failed_payment: 0.8,

  /** 85% — duplicate subscriptions are almost certainly a bug/failed upgrade. */
  duplicate_subscription: 0.85,

  /** 40% — stale coupons may be intentional (loyalty, partner deals). Conservative. */
  stale_coupon: 0.4,

  /** 70% — billing-caused churn has strong correlation between failed payment + cancel. */
  billing_churn: 0.7,
} as const;

export type RiskMultiplierKey = keyof typeof RISK_MULTIPLIERS;
