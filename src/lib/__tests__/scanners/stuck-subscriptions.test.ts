import { describe, it, expect, beforeEach } from "vitest";
import { scanStuckSubscriptions } from "../../scanners-v2/stuck-subscriptions";
import { mockSubscription, resetCounter } from "./helpers";

describe("scanStuckSubscriptions", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanStuckSubscriptions([])).toEqual([]);
  });

  it("ignores active subscriptions", () => {
    const sub = mockSubscription({ status: "active" });
    expect(scanStuckSubscriptions([sub])).toEqual([]);
  });

  it("ignores trialing subscriptions", () => {
    const sub = mockSubscription({ status: "trialing" });
    expect(scanStuckSubscriptions([sub])).toEqual([]);
  });

  it("ignores canceled subscriptions", () => {
    const sub = mockSubscription({ status: "canceled" });
    expect(scanStuckSubscriptions([sub])).toEqual([]);
  });

  it("detects past_due subscription as critical", () => {
    const sub = mockSubscription({
      status: "past_due",
      monthlyAmountCents: 9900,
    });

    const leaks = scanStuckSubscriptions([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("stuck_subscription");
    expect(leaks[0].severity).toBe("critical");
    expect(leaks[0].monthlyImpact).toBe(9900);
    expect(leaks[0].title).toContain("Past due");
  });

  it("detects unpaid subscription as high severity", () => {
    const sub = mockSubscription({
      status: "unpaid",
      monthlyAmountCents: 4900,
    });

    const leaks = scanStuckSubscriptions([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("high");
    expect(leaks[0].title).toContain("Unpaid");
  });

  it("detects incomplete subscription as medium severity", () => {
    const sub = mockSubscription({
      status: "incomplete",
      monthlyAmountCents: 2900,
    });

    const leaks = scanStuckSubscriptions([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("medium");
    expect(leaks[0].title).toContain("Incomplete");
  });

  it("detects incomplete_expired subscription as low severity", () => {
    const sub = mockSubscription({
      status: "incomplete_expired",
      monthlyAmountCents: 2900,
    });

    const leaks = scanStuckSubscriptions([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("low");
  });

  it("detects indefinitely paused subscription", () => {
    const sub = mockSubscription({
      status: "paused",
      pauseResumesAt: null,
      monthlyAmountCents: 4900,
    });

    const leaks = scanStuckSubscriptions([sub]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("medium");
    expect(leaks[0].title).toContain("paused");
  });

  it("ignores paused subscription with a resume date", () => {
    const sub = mockSubscription({
      status: "paused",
      pauseResumesAt: Math.floor(Date.now() / 1000) + 86400 * 30,
    });

    expect(scanStuckSubscriptions([sub])).toEqual([]);
  });

  it("ignores zero-amount subscriptions", () => {
    const sub = mockSubscription({
      status: "past_due",
      monthlyAmountCents: 0,
    });

    expect(scanStuckSubscriptions([sub])).toEqual([]);
  });

  it("handles multiple stuck subscriptions", () => {
    const subs = [
      mockSubscription({ status: "past_due", monthlyAmountCents: 9900 }),
      mockSubscription({ status: "unpaid", monthlyAmountCents: 4900 }),
      mockSubscription({ status: "active", monthlyAmountCents: 2900 }), // skip
    ];

    const leaks = scanStuckSubscriptions(subs);
    expect(leaks).toHaveLength(2);
  });

  it("includes subscription status in metadata", () => {
    const sub = mockSubscription({
      status: "past_due",
      monthlyAmountCents: 9900,
    });

    const leaks = scanStuckSubscriptions([sub]);
    expect(leaks[0].metadata.subscriptionStatus).toBe("past_due");
  });
});
