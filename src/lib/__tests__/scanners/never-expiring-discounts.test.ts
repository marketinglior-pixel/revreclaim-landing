import { describe, it, expect, beforeEach } from "vitest";
import { scanNeverExpiringDiscounts } from "../../scanners-v2/never-expiring-discounts";
import {
  mockSubscription,
  mockDiscount,
  resetCounter,
} from "./helpers";

describe("scanNeverExpiringDiscounts", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanNeverExpiringDiscounts([])).toEqual([]);
  });

  it("returns empty array for subscriptions without discounts", () => {
    expect(scanNeverExpiringDiscounts([mockSubscription()])).toEqual([]);
  });

  it("ignores non-forever discounts", () => {
    const sub = mockSubscription({
      discounts: [
        mockDiscount({ duration: "repeating" }),
        mockDiscount({ duration: "once" }),
      ],
    });
    expect(scanNeverExpiringDiscounts([sub])).toEqual([]);
  });

  it("detects forever discount with no end date", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 10000,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 25,
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanNeverExpiringDiscounts([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("never_expiring_discount");
    expect(leaks[0].monthlyImpact).toBe(2500); // 25% of 10000
    expect(leaks[0].annualImpact).toBe(30000);
  });

  it("detects forever discount with redeemBy but no endsAt (redeemBy is not an end date)", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 4900,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 20,
          redeemBy: Math.floor(Date.now() / 1000) + 86400 * 30,
        }),
      ],
    });
    // redeemBy only prevents NEW subscriptions from using the coupon;
    // it does NOT end the discount on existing subscriptions.
    const leaks = scanNeverExpiringDiscounts([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("never_expiring_discount");
  });

  it("ignores forever discount WITH endsAt", () => {
    const sub = mockSubscription({
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 20,
          endsAt: Math.floor(Date.now() / 1000) + 86400 * 30,
        }),
      ],
    });
    expect(scanNeverExpiringDiscounts([sub])).toEqual([]);
  });

  it("assigns high severity for > 30% off", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 10000,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 50,
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanNeverExpiringDiscounts([sub]);
    expect(leaks[0].severity).toBe("high");
  });

  it("assigns medium severity for 10-30% off", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 10000,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 15,
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanNeverExpiringDiscounts([sub]);
    expect(leaks[0].severity).toBe("medium");
  });

  it("assigns low severity for small percentage discounts", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 10000,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 5,
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanNeverExpiringDiscounts([sub]);
    expect(leaks[0].severity).toBe("low");
  });

  it("assigns high severity for fixed discounts > $50", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 20000,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: null,
          amountOffCents: 6000, // $60
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanNeverExpiringDiscounts([sub]);
    expect(leaks[0].severity).toBe("high");
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({
      status: "canceled",
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 50,
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });
    expect(scanNeverExpiringDiscounts([sub])).toEqual([]);
  });

  it("skips zero-value discounts", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 0,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 50,
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });
    expect(scanNeverExpiringDiscounts([sub])).toEqual([]);
  });
});
