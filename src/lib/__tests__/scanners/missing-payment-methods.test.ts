import { describe, it, expect, beforeEach } from "vitest";
import { scanMissingPaymentMethods } from "../../scanners-v2/missing-payment-methods";
import {
  mockSubscription,
  mockPaymentMethod,
  resetCounter,
} from "./helpers";
import type { NormalizedPaymentMethod } from "../../platforms/types";

describe("scanMissingPaymentMethods", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanMissingPaymentMethods([], new Map())).toEqual([]);
  });

  it("ignores subscriptions with a default payment method", () => {
    const sub = mockSubscription({
      defaultPaymentMethod: mockPaymentMethod(),
    });
    expect(scanMissingPaymentMethods([sub], new Map())).toEqual([]);
  });

  it("ignores subscriptions where customer has valid card in methods map", () => {
    const customerId = "cus_test";
    const sub = mockSubscription({
      customerId,
      defaultPaymentMethod: null,
    });

    const methods = new Map<string, NormalizedPaymentMethod[]>([
      [customerId, [mockPaymentMethod()]],
    ]);

    expect(scanMissingPaymentMethods([sub], methods)).toEqual([]);
  });

  it("detects subscription with no payment method at all", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 4900,
      defaultPaymentMethod: null,
    });

    const leaks = scanMissingPaymentMethods([sub], new Map());
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("missing_payment_method");
    expect(leaks[0].severity).toBe("critical");
    expect(leaks[0].monthlyImpact).toBe(Math.round(4900 * 0.8)); // Risk multiplier: 0.8
  });

  it("detects subscription when customer methods exist but no valid card", () => {
    const customerId = "cus_test";
    const sub = mockSubscription({
      customerId,
      monthlyAmountCents: 9900,
      defaultPaymentMethod: null,
    });

    const methods = new Map<string, NormalizedPaymentMethod[]>([
      [
        customerId,
        [mockPaymentMethod({ type: "other", cardLast4: null, cardBrand: null })],
      ],
    ]);

    const leaks = scanMissingPaymentMethods([sub], methods);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("critical");
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({
      status: "canceled",
      defaultPaymentMethod: null,
    });
    expect(scanMissingPaymentMethods([sub], new Map())).toEqual([]);
  });

  it("ignores zero-amount subscriptions", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 0,
      defaultPaymentMethod: null,
    });
    expect(scanMissingPaymentMethods([sub], new Map())).toEqual([]);
  });

  it("handles trialing subscriptions", () => {
    const sub = mockSubscription({
      status: "trialing",
      monthlyAmountCents: 2900,
      defaultPaymentMethod: null,
    });

    const leaks = scanMissingPaymentMethods([sub], new Map());
    expect(leaks).toHaveLength(1);
  });

  it("includes customer payment method count in metadata", () => {
    const customerId = "cus_test";
    const sub = mockSubscription({
      customerId,
      monthlyAmountCents: 4900,
      defaultPaymentMethod: null,
    });

    const methods = new Map<string, NormalizedPaymentMethod[]>([
      [
        customerId,
        [
          mockPaymentMethod({ type: "other", cardLast4: null, cardBrand: null }),
          mockPaymentMethod({ type: "other", cardLast4: null, cardBrand: null }),
        ],
      ],
    ]);

    const leaks = scanMissingPaymentMethods([sub], methods);
    expect(leaks[0].metadata.customerPaymentMethodCount).toBe(2);
  });
});
