// ============================================================
// Multi-Platform Billing Types
// Normalized data structures that all scanners consume
// ============================================================

export type BillingPlatform = "stripe" | "polar" | "paddle";

export const PLATFORM_LABELS: Record<BillingPlatform, string> = {
  stripe: "Stripe",
  polar: "Polar",
  paddle: "Paddle",
};

export const PLATFORM_COLORS: Record<BillingPlatform, string> = {
  stripe: "#635BFF",
  polar: "#0062FF",
  paddle: "#3B82F6",
};

export const PLATFORM_DASHBOARD_URLS: Record<BillingPlatform, string> = {
  stripe: "https://dashboard.stripe.com",
  polar: "https://polar.sh",
  paddle: "https://vendors.paddle.com",
};

// --- Normalized Subscription ---

export type NormalizedSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface NormalizedSubscriptionItem {
  priceId: string;
  productId: string;
  unitAmountCents: number;
  quantity: number;
  interval: "day" | "week" | "month" | "year";
}

export interface NormalizedDiscount {
  id: string;
  couponId: string;
  couponName: string | null;
  percentOff: number | null;
  amountOffCents: number | null;
  duration: "once" | "repeating" | "forever";
  durationInMonths: number | null;
  redeemBy: number | null; // unix timestamp — coupon no longer redeemable after this
  endsAt: number | null; // unix timestamp — when the discount stops applying
}

export interface NormalizedPaymentMethod {
  id: string;
  type: "card" | "other";
  cardLast4: string | null;
  cardBrand: string | null;
  cardExpMonth: number | null; // 1-12
  cardExpYear: number | null; // 4-digit year
}

export interface NormalizedSubscription {
  id: string;
  platform: BillingPlatform;
  status: NormalizedSubscriptionStatus;
  customerId: string;
  customerEmail: string | null;
  monthlyAmountCents: number;
  items: NormalizedSubscriptionItem[];
  discounts: NormalizedDiscount[];
  defaultPaymentMethod: NormalizedPaymentMethod | null;
  createdAt: number; // unix timestamp
  canceledAt: number | null;
  pauseResumesAt: number | null;
  platformUrl: string;
}

// --- Normalized Invoice ---

export interface NormalizedInvoice {
  id: string;
  platform: BillingPlatform;
  number: string | null;
  status: "open" | "paid" | "void" | "uncollectible";
  amountDueCents: number;
  amountRemainingCents: number;
  customerId: string;
  customerEmail: string | null;
  subscriptionId: string | null;
  attempted: boolean;
  dueDate: number | null; // unix timestamp
  createdAt: number;
  nextPaymentAttempt: number | null;
  platformUrl: string;
}

// --- Normalized Price & Product ---

export interface NormalizedPrice {
  id: string;
  productId: string;
  unitAmountCents: number;
  interval: "day" | "week" | "month" | "year";
  active: boolean;
  createdAt: number;
}

export interface NormalizedProduct {
  id: string;
  name: string;
  active: boolean;
}

// --- Complete Normalized Dataset ---

export interface NormalizedBillingData {
  platform: BillingPlatform;
  subscriptions: NormalizedSubscription[];
  invoices: NormalizedInvoice[];
  prices: NormalizedPrice[];
  products: NormalizedProduct[];
  paymentMethods: Map<string, NormalizedPaymentMethod[]>;
}

// --- Platform Capabilities ---

export interface PlatformCapabilities {
  failedPayments: boolean;
  stuckSubscriptions: boolean;
  expiringCards: boolean;
  expiredCoupons: boolean;
  neverExpiringDiscounts: boolean;
  legacyPricing: boolean;
  missingPaymentMethods: boolean;
  unbilledOverages: boolean;
  trialExpired: boolean;
  duplicateSubscriptions: boolean;
  staleCoupons: boolean;
  billingChurn: boolean;
}

export const PLATFORM_CAPABILITIES: Record<
  BillingPlatform,
  PlatformCapabilities
> = {
  stripe: {
    failedPayments: true,
    stuckSubscriptions: true,
    expiringCards: true,
    expiredCoupons: true,
    neverExpiringDiscounts: true,
    legacyPricing: true,
    missingPaymentMethods: true,
    unbilledOverages: true,
    trialExpired: true,
    duplicateSubscriptions: true,
    staleCoupons: true,
    billingChurn: true,
  },
  polar: {
    failedPayments: true,
    stuckSubscriptions: true,
    expiringCards: true, // via Customer Session → Customer Portal payment methods API
    expiredCoupons: true,
    neverExpiringDiscounts: true,
    legacyPricing: true,
    missingPaymentMethods: true,
    unbilledOverages: true,
    trialExpired: true,
    duplicateSubscriptions: true,
    staleCoupons: true,
    billingChurn: true,
  },
  paddle: {
    failedPayments: true,
    stuckSubscriptions: true,
    expiringCards: true, // via GET /customers/{id}/payment-methods
    expiredCoupons: true,
    neverExpiringDiscounts: true,
    legacyPricing: true,
    missingPaymentMethods: true,
    unbilledOverages: true,
    trialExpired: true,
    duplicateSubscriptions: true,
    staleCoupons: true,
    billingChurn: true,
  },
};

// --- Helpers ---

export function normalizeIntervalToMonthly(
  amountCents: number,
  interval: "day" | "week" | "month" | "year"
): number {
  switch (interval) {
    case "month":
      return amountCents;
    case "year":
      return Math.round(amountCents / 12);
    case "week":
      return Math.round(amountCents * 4.33);
    case "day":
      return Math.round(amountCents * 30);
    default:
      return amountCents;
  }
}
