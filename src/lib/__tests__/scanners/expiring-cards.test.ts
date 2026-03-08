import { describe, it, expect, beforeEach } from "vitest";
import { scanExpiringCards } from "../../scanners-v2/expiring-cards";
import {
  mockSubscription,
  mockPaymentMethod,
  resetCounter,
} from "./helpers";
import type { NormalizedPaymentMethod } from "../../platforms/types";

describe("scanExpiringCards", () => {
  beforeEach(() => {
    resetCounter();
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  it("returns empty array when no subscriptions", () => {
    expect(scanExpiringCards([], new Map())).toEqual([]);
  });

  it("ignores subscriptions with cards expiring > 3 months out", () => {
    const sub = mockSubscription({
      defaultPaymentMethod: mockPaymentMethod({
        cardExpMonth: ((currentMonth + 5) % 12) || 12,
        cardExpYear: currentMonth + 5 > 12 ? currentYear + 1 : currentYear,
      }),
    });
    expect(scanExpiringCards([sub], new Map())).toEqual([]);
  });

  it("detects card expiring within 30 days (critical)", () => {
    // Card expires this month or next month
    const expMonth = currentMonth;
    const expYear = currentYear;

    const sub = mockSubscription({
      monthlyAmountCents: 9900,
      defaultPaymentMethod: mockPaymentMethod({
        cardExpMonth: expMonth,
        cardExpYear: expYear,
      }),
    });

    const leaks = scanExpiringCards([sub], new Map());
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("expiring_card");
    expect(leaks[0].severity).toBe("critical");
    expect(leaks[0].monthlyImpact).toBe(9900);
  });

  it("detects already expired card (critical)", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 4900,
      defaultPaymentMethod: mockPaymentMethod({
        cardExpMonth: 1,
        cardExpYear: currentYear - 1,
      }),
    });

    const leaks = scanExpiringCards([sub], new Map());
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("critical");
    expect(leaks[0].title).toContain("already expired");
  });

  it("detects card expiring within 60 days (high)", () => {
    // monthsUntilExpiry = 2 → high severity
    const rawMonth = currentMonth + 2;
    const futureMonth = ((rawMonth - 1) % 12) + 1;
    const futureYear = currentYear + Math.floor((rawMonth - 1) / 12);

    const sub = mockSubscription({
      defaultPaymentMethod: mockPaymentMethod({
        cardExpMonth: futureMonth,
        cardExpYear: futureYear,
      }),
    });

    const leaks = scanExpiringCards([sub], new Map());
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("high");
  });

  it("detects card expiring within 90 days (medium)", () => {
    // monthsUntilExpiry = 3 → medium severity
    const rawMonth = currentMonth + 3;
    const futureMonth = ((rawMonth - 1) % 12) + 1;
    const futureYear = currentYear + Math.floor((rawMonth - 1) / 12);

    const sub = mockSubscription({
      defaultPaymentMethod: mockPaymentMethod({
        cardExpMonth: futureMonth,
        cardExpYear: futureYear,
      }),
    });

    const leaks = scanExpiringCards([sub], new Map());
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("medium");
  });

  it("falls back to customer payment methods if no default", () => {
    const customerId = "cus_test";
    const sub = mockSubscription({
      customerId,
      defaultPaymentMethod: null,
    });

    const methods = new Map<string, NormalizedPaymentMethod[]>([
      [
        customerId,
        [
          mockPaymentMethod({
            cardExpMonth: currentMonth,
            cardExpYear: currentYear,
          }),
        ],
      ],
    ]);

    const leaks = scanExpiringCards([sub], methods);
    expect(leaks).toHaveLength(1);
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({
      status: "canceled",
      defaultPaymentMethod: mockPaymentMethod({
        cardExpMonth: currentMonth,
        cardExpYear: currentYear,
      }),
    });

    expect(scanExpiringCards([sub], new Map())).toEqual([]);
  });

  it("ignores non-card payment methods", () => {
    const customerId = "cus_test";
    const sub = mockSubscription({
      customerId,
      defaultPaymentMethod: null,
    });

    const methods = new Map<string, NormalizedPaymentMethod[]>([
      [customerId, [mockPaymentMethod({ type: "other", cardExpMonth: null, cardExpYear: null })]],
    ]);

    expect(scanExpiringCards([sub], methods)).toEqual([]);
  });

  it("includes card metadata in leak", () => {
    const sub = mockSubscription({
      defaultPaymentMethod: mockPaymentMethod({
        cardLast4: "1234",
        cardBrand: "mastercard",
        cardExpMonth: currentMonth,
        cardExpYear: currentYear,
      }),
    });

    const leaks = scanExpiringCards([sub], new Map());
    expect(leaks[0].metadata.cardLast4).toBe("1234");
    expect(leaks[0].metadata.cardBrand).toBe("mastercard");
  });
});
