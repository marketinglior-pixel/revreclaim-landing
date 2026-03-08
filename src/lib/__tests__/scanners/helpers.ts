/**
 * Shared mock data factories for scanner tests.
 */

import type {
  NormalizedSubscription,
  // NormalizedSubscriptionItem is available but not currently used
  NormalizedDiscount,
  NormalizedPaymentMethod,
  NormalizedInvoice,
  NormalizedPrice,
  NormalizedProduct,
  BillingPlatform,
} from "../../platforms/types";

let counter = 0;

function nextId(prefix = "mock"): string {
  return `${prefix}_${++counter}`;
}

export function resetCounter() {
  counter = 0;
}

// ---- Subscriptions ----

export function mockSubscription(
  overrides: Partial<NormalizedSubscription> = {}
): NormalizedSubscription {
  return {
    id: nextId("sub"),
    platform: "stripe" as BillingPlatform,
    status: "active",
    customerId: nextId("cus"),
    customerEmail: "user@example.com",
    monthlyAmountCents: 4900,
    items: [
      {
        priceId: nextId("price"),
        productId: nextId("prod"),
        unitAmountCents: 4900,
        quantity: 1,
        interval: "month" as const,
      },
    ],
    discounts: [],
    defaultPaymentMethod: null,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
    canceledAt: null,
    pauseResumesAt: null,
    platformUrl: "https://dashboard.stripe.com/subscriptions/sub_1",
    ...overrides,
  };
}

// ---- Discounts ----

export function mockDiscount(
  overrides: Partial<NormalizedDiscount> = {}
): NormalizedDiscount {
  return {
    id: nextId("dis"),
    couponId: nextId("coupon"),
    couponName: "Test Coupon",
    percentOff: 20,
    amountOffCents: null,
    duration: "repeating",
    durationInMonths: 3,
    redeemBy: null,
    endsAt: null,
    ...overrides,
  };
}

// ---- Payment Methods ----

export function mockPaymentMethod(
  overrides: Partial<NormalizedPaymentMethod> = {}
): NormalizedPaymentMethod {
  return {
    id: nextId("pm"),
    type: "card",
    cardLast4: "4242",
    cardBrand: "visa",
    cardExpMonth: 12,
    cardExpYear: new Date().getFullYear() + 2,
    ...overrides,
  };
}

// ---- Invoices ----

export function mockInvoice(
  overrides: Partial<NormalizedInvoice> = {}
): NormalizedInvoice {
  return {
    id: nextId("inv"),
    platform: "stripe" as BillingPlatform,
    number: "INV-001",
    status: "open",
    amountDueCents: 4900,
    amountRemainingCents: 4900,
    customerId: nextId("cus"),
    customerEmail: "user@example.com",
    subscriptionId: nextId("sub"),
    attempted: true,
    dueDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 14,
    nextPaymentAttempt: null,
    platformUrl: "https://dashboard.stripe.com/invoices/inv_1",
    ...overrides,
  };
}

// ---- Prices ----

export function mockPrice(
  overrides: Partial<NormalizedPrice> = {}
): NormalizedPrice {
  return {
    id: nextId("price"),
    productId: "prod_1",
    unitAmountCents: 4900,
    interval: "month" as const,
    active: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 365,
    ...overrides,
  };
}

// ---- Products ----

export function mockProduct(
  overrides: Partial<NormalizedProduct> = {}
): NormalizedProduct {
  return {
    id: nextId("prod"),
    name: "Pro Plan",
    active: true,
    ...overrides,
  };
}
