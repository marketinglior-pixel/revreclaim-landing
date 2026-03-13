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
} as const;

export type RiskMultiplierKey = keyof typeof RISK_MULTIPLIERS;
