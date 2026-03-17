import type { LeakEnrichment, EnrichmentProvider } from "./enrichment/types";

export type LeakSeverity = "critical" | "high" | "medium" | "low";

export type LeakType =
  | "expired_coupon"
  | "never_expiring_discount"
  | "failed_payment"
  | "expiring_card"
  | "stuck_subscription"
  | "legacy_pricing"
  | "missing_payment_method"
  | "unbilled_overage"
  | "trial_expired"
  | "duplicate_subscription";

export const LEAK_TYPE_LABELS: Record<LeakType, string> = {
  expired_coupon: "Expired Coupons",
  never_expiring_discount: "Never-Expiring Discounts",
  failed_payment: "Uncollected Revenue",
  expiring_card: "Expiring Cards",
  stuck_subscription: "Stuck Subscriptions",
  legacy_pricing: "Legacy Pricing",
  missing_payment_method: "Missing Payment Methods",
  unbilled_overage: "Unbilled Overages",
  trial_expired: "Expired Trials",
  duplicate_subscription: "Duplicate Subscriptions",
};

export const SEVERITY_ORDER: Record<LeakSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface Leak {
  id: string;
  type: LeakType;
  severity: LeakSeverity;
  title: string;
  description: string;
  customerEmail: string | null;
  customerId: string;
  subscriptionId: string | null;
  monthlyImpact: number; // in cents — the amount at risk per occurrence
  annualImpact: number; // in cents — monthlyImpact * 12 for recurring, or = monthlyImpact for one-time
  recoveryRate: number; // 0-1 probability of actually recovering this amount
  isRecurring: boolean; // true = leak compounds monthly (discounts, legacy pricing), false = one-time event (failed payment, expiring card)
  fixSuggestion: string;
  platformUrl?: string; // Direct link to platform dashboard
  stripeUrl?: string; // @deprecated — use platformUrl. Kept for backward compat.
  detectedAt: string; // ISO 8601
  metadata: Record<string, unknown>;
  /** CRM enrichment data — present when an enrichment provider is connected */
  enrichment?: LeakEnrichment;
}

export interface LeakCategorySummary {
  type: LeakType;
  label: string;
  count: number;
  totalMonthlyImpact: number; // in cents
  percentage: number; // of total MRR at risk
}

export interface ScanSummary {
  mrrAtRisk: number; // in cents (weighted by recoveryRate)
  rawMrrAtRisk: number; // in cents (unweighted — max potential)
  leaksFound: number;
  recoveryPotential: number; // in cents (annual, weighted)
  totalSubscriptions: number;
  totalCustomers: number;
  totalMRR: number; // in cents (active only, excludes trialing)
  trialingMRR: number; // in cents (trialing subs, shown separately)
  healthScore: number; // 0-100
}

/** Scan meta-data for benchmark dataset — logged per scan for aggregated insights */
export interface ScanMetadata {
  numberOfPlans: number; // count of distinct price IDs
  hasDunningSetup: boolean; // whether smart retries / dunning emails are configured
  billingModel: "self_serve" | "sales_led" | "mixed" | "unknown"; // inferred from avg deal size
  avgDealSizeCents: number; // average subscription amount in cents
  platformVersion?: string; // e.g. Stripe API version
}

export interface BillingHealthInsight {
  id: string;
  label: string;
  description: string;
  score: number; // 0-100 (higher = healthier)
  status: "healthy" | "warning" | "danger";
  detail: string; // e.g. "3 of 12 customers have discounts"
}

export interface BillingHealthInsights {
  insights: BillingHealthInsight[];
  overallGrade: "A" | "B" | "C" | "D" | "F";
}

export interface ScanReport {
  id: string;
  platform?: string; // BillingPlatform — which platform was scanned
  scannedAt: string; // ISO 8601
  summary: ScanSummary;
  categories: LeakCategorySummary[];
  leaks: Leak[];
  billingHealth?: BillingHealthInsights;
  /** Which enrichment provider was used, if any */
  enrichedWith?: EnrichmentProvider;
  /** Scan meta-data for benchmark aggregation */
  scanMetadata?: ScanMetadata;
}

export interface ScanRequest {
  email: string;
  apiKey: string;
  platform?: string; // BillingPlatform — defaults to 'stripe'
}

export type ScanStatus =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "scanning"; step: string; progress: number }
  | { status: "complete"; report: ScanReport }
  | { status: "error"; message: string };
