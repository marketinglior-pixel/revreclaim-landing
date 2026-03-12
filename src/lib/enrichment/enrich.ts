import type { Leak, LeakSeverity } from "../types";
import type { ContactSignals, EnrichmentProvider } from "./types";

// ============================================================
// Enrichment Rules Engine
//
// Takes a Leak + CRM signals → adjusts severity, recoveryRate,
// and adds a human-readable explanation.
//
// NEVER changes: monthlyImpact, annualImpact (billing facts).
// ============================================================

interface Adjustment {
  newSeverity: LeakSeverity | null;
  recoveryRateDelta: number;
  reason: string;
}

/**
 * Apply CRM enrichment to a single Leak.
 *
 * If no CRM contact is found, the leak is still annotated with
 * enrichment.signals.found = false (so the UI can show "no CRM data").
 *
 * Returns the modified leak (mutated in place for efficiency).
 */
export function enrichLeak(
  leak: Leak,
  signals: ContactSignals,
  provider: EnrichmentProvider = "hubspot"
): Leak {
  const adjustment = calculateAdjustment(leak, signals);

  const originalSeverity = leak.severity;
  const originalRecoveryRate = leak.recoveryRate;

  // Apply severity adjustment
  if (adjustment.newSeverity && adjustment.newSeverity !== leak.severity) {
    leak.severity = adjustment.newSeverity;
  }

  // Apply recovery rate adjustment (clamped to [0.05, 0.95])
  if (adjustment.recoveryRateDelta !== 0) {
    leak.recoveryRate = clamp(
      leak.recoveryRate + adjustment.recoveryRateDelta,
      0.05,
      0.95
    );
  }

  // Attach enrichment metadata
  leak.enrichment = {
    originalSeverity,
    originalRecoveryRate,
    severityAdjusted: leak.severity !== originalSeverity,
    recoveryRateAdjusted: leak.recoveryRate !== originalRecoveryRate,
    adjustmentReason: adjustment.reason || null,
    signals,
    provider,
  };

  return leak;
}

// ── Adjustment Rules ────────────────────────────────────────

function calculateAdjustment(
  leak: Leak,
  signals: ContactSignals
): Adjustment {
  // No CRM contact found → no adjustment, just annotate
  if (!signals.found) {
    return { newSeverity: null, recoveryRateDelta: 0, reason: "" };
  }

  const { engagementLevel, daysSinceLastActivity, dealCount } = signals;

  switch (leak.type) {
    // ── Failed Payments ───────────────────────────────────
    case "failed_payment":
      if (engagementLevel === "inactive" && daysSinceLastActivity !== null) {
        return {
          newSeverity: null,
          recoveryRateDelta: -0.2,
          reason: `Customer inactive in CRM for ${daysSinceLastActivity} days. Payment failure may signal churn rather than a temporary card issue.`,
        };
      }
      if (engagementLevel === "active") {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.1,
          reason: "Customer recently active in CRM. High recovery potential — likely a temporary payment issue.",
        };
      }
      break;

    // ── Expiring Cards ────────────────────────────────────
    case "expiring_card":
      if (engagementLevel === "inactive" && daysSinceLastActivity !== null) {
        return {
          newSeverity: escalateSeverity(leak.severity, "high"),
          recoveryRateDelta: -0.15,
          reason: `Expiring card + no CRM activity for ${daysSinceLastActivity} days. High churn risk — customer may not update payment method.`,
        };
      }
      if (engagementLevel === "active") {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.1,
          reason: "Customer actively engaged in CRM. Likely to update their card when reminded.",
        };
      }
      break;

    // ── Ghost Subscriptions ───────────────────────────────
    case "ghost_subscription":
      if (
        engagementLevel === "inactive" &&
        daysSinceLastActivity !== null &&
        daysSinceLastActivity > 60
      ) {
        return {
          newSeverity: "critical",
          recoveryRateDelta: -0.3,
          reason: `Ghost sub confirmed — zero CRM activity in ${daysSinceLastActivity} days. Very unlikely to recover.`,
        };
      }
      if (engagementLevel === "active") {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.15,
          reason: "Customer still actively engaged in CRM despite billing issue. Worth personal outreach.",
        };
      }
      break;

    // ── Legacy Pricing ────────────────────────────────────
    case "legacy_pricing":
      if (engagementLevel === "active" && dealCount > 0) {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.2,
          reason: `High-value customer (${dealCount} deal${dealCount !== 1 ? "s" : ""}, actively engaged). Good candidate for pricing conversation.`,
        };
      }
      if (engagementLevel === "inactive" && daysSinceLastActivity !== null) {
        return {
          newSeverity: "low",
          recoveryRateDelta: -0.15,
          reason: `Customer inactive for ${daysSinceLastActivity} days. Price migration risks churn — proceed with caution.`,
        };
      }
      break;

    // ── Expired Coupons ───────────────────────────────────
    case "expired_coupon":
      if (engagementLevel === "active") {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.05,
          reason: "Actively engaged customer. Removing expired coupon is safe — they value the product.",
        };
      }
      break;

    // ── Never-Expiring Discounts ──────────────────────────
    case "never_expiring_discount":
      if (engagementLevel === "inactive" && daysSinceLastActivity !== null) {
        return {
          newSeverity: null,
          recoveryRateDelta: -0.2,
          reason: `Customer inactive for ${daysSinceLastActivity} days. Removing discount now risks losing them entirely.`,
        };
      }
      if (engagementLevel === "active" && dealCount > 0) {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.15,
          reason: "Engaged customer with active deals. Good candidate for renegotiating discount terms.",
        };
      }
      break;

    // ── Missing Payment Methods ───────────────────────────
    case "missing_payment_method":
      if (engagementLevel === "inactive") {
        return {
          newSeverity: null,
          recoveryRateDelta: -0.1,
          reason: "Customer inactive in CRM. Missing payment method may indicate abandoned account.",
        };
      }
      if (engagementLevel === "active") {
        return {
          newSeverity: escalateSeverity(leak.severity, "high"),
          recoveryRateDelta: 0.15,
          reason: "Active customer without payment method — critical to resolve before next billing cycle.",
        };
      }
      break;

    // ── Trial Expired ─────────────────────────────────────
    case "trial_expired":
      if (engagementLevel === "active") {
        return {
          newSeverity: "high",
          recoveryRateDelta: 0.2,
          reason: "Customer still engaged after trial expiry. High conversion potential with personalized outreach.",
        };
      }
      if (engagementLevel === "inactive") {
        return {
          newSeverity: null,
          recoveryRateDelta: -0.2,
          reason: "Customer disengaged after trial. Low conversion likelihood without re-engagement campaign.",
        };
      }
      break;

    // ── Duplicate Subscriptions ───────────────────────────
    case "duplicate_subscription":
      if (engagementLevel === "active") {
        return {
          newSeverity: null,
          recoveryRateDelta: 0,
          reason: "Active customer with duplicate subscription. Fix quickly to prevent chargeback complaint.",
        };
      }
      break;

    // ── Unbilled Overages ─────────────────────────────────
    case "unbilled_overage":
      if (dealCount > 1) {
        return {
          newSeverity: null,
          recoveryRateDelta: 0.1,
          reason: `High-value customer (${dealCount} deals). Strong case for correcting unbilled usage.`,
        };
      }
      break;
  }

  // Default: no adjustment, but still record that we checked CRM
  return {
    newSeverity: null,
    recoveryRateDelta: 0,
    reason: engagementLevel === "unknown"
      ? "CRM contact found but no recent activity data available."
      : `CRM: ${engagementLevel} engagement${daysSinceLastActivity !== null ? ` (${daysSinceLastActivity}d since last activity)` : ""}.`,
  };
}

// ── Helpers ─────────────────────────────────────────────────

/**
 * Escalate severity only if the new level is more severe.
 * Returns null if no escalation needed.
 */
function escalateSeverity(
  current: LeakSeverity,
  target: LeakSeverity
): LeakSeverity | null {
  const order: Record<LeakSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return order[target] < order[current] ? target : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
