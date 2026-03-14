import { describe, it, expect, beforeEach } from "vitest";
import { scanExpiredCoupons } from "../../scanners-v2/expired-coupons";
import {
  mockSubscription,
  mockDiscount,
  resetCounter,
} from "./helpers";

describe("scanExpiredCoupons", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanExpiredCoupons([])).toEqual([]);
  });

  it("returns empty array when subscriptions have no discounts", () => {
    const subs = [mockSubscription()];
    expect(scanExpiredCoupons(subs)).toEqual([]);
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({
      status: "canceled",
      discounts: [
        mockDiscount({
          redeemBy: Math.floor(Date.now() / 1000) - 86400, // expired yesterday
        }),
      ],
    });
    expect(scanExpiredCoupons([sub])).toEqual([]);
  });

  it("detects expired coupon on active subscription (endsAt in past)", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 10000,
      discounts: [
        mockDiscount({
          percentOff: 20,
          endsAt: Math.floor(Date.now() / 1000) - 86400 * 30, // expired 30 days ago
        }),
      ],
    });

    const leaks = scanExpiredCoupons([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("expired_coupon");
    expect(leaks[0].monthlyImpact).toBe(2000); // 20% of 10000
    expect(leaks[0].annualImpact).toBe(24000);
    expect(leaks[0].customerId).toBe(sub.customerId);
  });

  it("detects expired coupon via endsAt field", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 5000,
      discounts: [
        mockDiscount({
          percentOff: 50,
          redeemBy: null,
          endsAt: Math.floor(Date.now() / 1000) - 86400, // expired yesterday
        }),
      ],
    });

    const leaks = scanExpiredCoupons([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].monthlyImpact).toBe(2500); // 50% of 5000
  });

  it("ignores coupons that haven't expired yet", () => {
    const sub = mockSubscription({
      discounts: [
        mockDiscount({
          redeemBy: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        }),
      ],
    });
    expect(scanExpiredCoupons([sub])).toEqual([]);
  });

  it("ignores coupons with no expiration date", () => {
    const sub = mockSubscription({
      discounts: [
        mockDiscount({
          redeemBy: null,
          endsAt: null,
        }),
      ],
    });
    expect(scanExpiredCoupons([sub])).toEqual([]);
  });

  it("calculates fixed amount discount correctly", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 10000,
      discounts: [
        mockDiscount({
          percentOff: null,
          amountOffCents: 3000,
          endsAt: Math.floor(Date.now() / 1000) - 86400,
        }),
      ],
    });

    const leaks = scanExpiredCoupons([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].monthlyImpact).toBe(3000);
  });

  it("assigns high severity for large discounts (>$100/mo)", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 100000, // $1000/mo
      discounts: [
        mockDiscount({
          percentOff: 20, // $200/mo impact
          endsAt: Math.floor(Date.now() / 1000) - 86400,
        }),
      ],
    });

    const leaks = scanExpiredCoupons([sub]);
    expect(leaks[0].severity).toBe("high");
  });

  it("assigns medium severity for smaller discounts", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 4900, // $49/mo
      discounts: [
        mockDiscount({
          percentOff: 10, // $4.90/mo impact
          endsAt: Math.floor(Date.now() / 1000) - 86400,
        }),
      ],
    });

    const leaks = scanExpiredCoupons([sub]);
    expect(leaks[0].severity).toBe("medium");
  });

  it("works on trialing subscriptions", () => {
    const sub = mockSubscription({
      status: "trialing",
      discounts: [
        mockDiscount({
          percentOff: 10,
          endsAt: Math.floor(Date.now() / 1000) - 86400,
        }),
      ],
    });

    const leaks = scanExpiredCoupons([sub]);
    expect(leaks).toHaveLength(1);
  });

  it("skips discounts with zero impact", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 0,
      discounts: [
        mockDiscount({
          percentOff: 20,
          redeemBy: Math.floor(Date.now() / 1000) - 86400,
        }),
      ],
    });

    expect(scanExpiredCoupons([sub])).toEqual([]);
  });
});
