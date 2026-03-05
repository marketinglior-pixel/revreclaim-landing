export type LeakSeverity = "critical" | "high" | "medium" | "low";

export type LeakType =
  | "expired_coupon"
  | "never_expiring_discount"
  | "failed_payment"
  | "expiring_card"
  | "ghost_subscription"
  | "legacy_pricing"
  | "missing_payment_method";

export const LEAK_TYPE_LABELS: Record<LeakType, string> = {
  expired_coupon: "Expired Coupons",
  never_expiring_discount: "Never-Expiring Discounts",
  failed_payment: "Failed Payments",
  expiring_card: "Expiring Cards",
  ghost_subscription: "Ghost Subscriptions",
  legacy_pricing: "Legacy Pricing",
  missing_payment_method: "Missing Payment Methods",
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
  monthlyImpact: number; // in cents
  annualImpact: number; // in cents
  fixSuggestion: string;
  detectedAt: string; // ISO 8601
  metadata: Record<string, unknown>;
}

export interface LeakCategorySummary {
  type: LeakType;
  label: string;
  count: number;
  totalMonthlyImpact: number; // in cents
  percentage: number; // of total MRR at risk
}

export interface ScanSummary {
  mrrAtRisk: number; // in cents
  leaksFound: number;
  recoveryPotential: number; // in cents (annual)
  totalSubscriptions: number;
  totalCustomers: number;
  totalMRR: number; // in cents
  healthScore: number; // 0-100
}

export interface ScanReport {
  id: string;
  scannedAt: string; // ISO 8601
  summary: ScanSummary;
  categories: LeakCategorySummary[];
  leaks: Leak[];
}

export interface ScanRequest {
  email: string;
  apiKey: string;
}

export type ScanStatus =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "scanning"; step: string; progress: number }
  | { status: "complete"; report: ScanReport }
  | { status: "error"; message: string };
