import { describe, it, expect, beforeEach } from "vitest";
import { scanStaleCoupons } from "../../scanners-v2/stale-coupons";
import { mockSubscription, mockDiscount, resetCounter } from "./helpers";

describe("scanStaleCoupons", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanStaleCoupons([])).toEqual([]);
  });

  it("detects forever coupon with >30% off on 7-month-old sub", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 29900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 210, // 7 months ago
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 40,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("stale_coupon");
    // 40% of 29900 = 11960, * 0.4 risk = 4784
    expect(leaks[0].monthlyImpact).toBe(4784);
  });

  it("ignores forever coupon with 10% off (too small)", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 9900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 210,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 10,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(0);
  });

  it("detects coupon with promotional keyword in name", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 19900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 200,
      discounts: [
        mockDiscount({
          couponName: "BF2024-40",
          duration: "forever",
          percentOff: 20,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].metadata.staleReason).toContain("BF2024-40");
  });

  it("ignores recent sub (<6 months) with forever coupon and 30%", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 29900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 90, // 3 months
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 30,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(0);
  });

  it("detects aggressive discount (>40%) even on recent sub", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 29900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 60, // 2 months
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 50,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(1);
  });

  it("ignores expired coupons (caught by expired_coupon scanner)", () => {
    const sub = mockSubscription({
      monthlyAmountCents: 29900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 210,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 50,
          endsAt: Math.floor(Date.now() / 1000) - 86400, // expired yesterday
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(0);
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({
      status: "canceled",
      monthlyAmountCents: 29900,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 210,
      discounts: [
        mockDiscount({
          duration: "forever",
          percentOff: 50,
          endsAt: null,
        }),
      ],
    });

    const leaks = scanStaleCoupons([sub]);
    expect(leaks).toHaveLength(0);
  });
});
