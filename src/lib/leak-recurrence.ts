export type RecurrenceLevel = "recurring" | "episodic" | "one-time";

export const LEAK_RECURRENCE: Record<string, { level: RecurrenceLevel; label: string; description: string }> = {
  failed_payment: { level: "recurring", label: "Recurring", description: "New failures appear daily as cards expire and payments decline" },
  expiring_card: { level: "recurring", label: "Recurring", description: "Card expirations happen on a rolling basis every month" },
  expired_coupon: { level: "episodic", label: "Episodic", description: "Recurs with each promotion you run (4-8x per year)" },
  ghost_subscription: { level: "episodic", label: "Episodic", description: "Accumulates gradually from edge cases, needs periodic cleanup" },
  legacy_pricing: { level: "episodic", label: "Episodic", description: "Only appears when you change pricing (1-2x per year)" },
  unbilled_overage: { level: "recurring", label: "Recurring", description: "Continuous for usage-based pricing models" },
  never_expiring_discount: { level: "one-time", label: "One-time fix", description: "Clean up once, stays solved unless you create new permanent discounts" },
  missing_payment_method: { level: "one-time", label: "One-time fix", description: "Usually a migration or configuration issue, fix once" },
  trial_expired: { level: "one-time", label: "One-time fix", description: "More of a conversion signal than a billing leak" },
  duplicate_subscription: { level: "one-time", label: "One-time fix", description: "Fix and configure checkout to prevent, problem solved" },
};

export function getRecurrence(leakType: string) {
  return LEAK_RECURRENCE[leakType] || { level: "one-time" as const, label: "One-time fix", description: "" };
}
