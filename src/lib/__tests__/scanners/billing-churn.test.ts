import { describe, it, expect, beforeEach } from "vitest";
import { scanBillingChurn } from "../../scanners-v2/billing-churn";
import { mockSubscription, mockInvoice, resetCounter } from "./helpers";

describe("scanBillingChurn", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no subscriptions", () => {
    expect(scanBillingChurn([], [])).toEqual([]);
  });

  it("detects canceled sub + failed invoice 3 days before cancel", () => {
    const now = Math.floor(Date.now() / 1000);
    const customerId = "cus_churn_1";

    const sub = mockSubscription({
      status: "canceled",
      customerId,
      monthlyAmountCents: 19900,
      canceledAt: now - 86400 * 5, // canceled 5 days ago
    });

    const invoice = mockInvoice({
      customerId,
      status: "open",
      amountDueCents: 19900,
      amountRemainingCents: 19900,
      createdAt: now - 86400 * 8, // failed 8 days ago (3 days before cancel)
    });

    const leaks = scanBillingChurn([sub], [invoice]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("billing_churn");
    // 19900 * 0.7 risk = 13930
    expect(leaks[0].monthlyImpact).toBe(13930);
    expect(leaks[0].isRecurring).toBe(false);
    expect(leaks[0].metadata.daysBetweenFailureAndCancel).toBe(3);
  });

  it("ignores canceled sub with no failed invoices", () => {
    const now = Math.floor(Date.now() / 1000);

    const sub = mockSubscription({
      status: "canceled",
      customerId: "cus_no_fail",
      canceledAt: now - 86400 * 5,
    });

    const invoice = mockInvoice({
      customerId: "cus_no_fail",
      status: "paid", // not failed
      amountRemainingCents: 0,
    });

    const leaks = scanBillingChurn([sub], [invoice]);
    expect(leaks).toHaveLength(0);
  });

  it("ignores canceled sub with failed invoice 30 days before cancel", () => {
    const now = Math.floor(Date.now() / 1000);
    const customerId = "cus_old_fail";

    const sub = mockSubscription({
      status: "canceled",
      customerId,
      canceledAt: now - 86400 * 5,
    });

    const invoice = mockInvoice({
      customerId,
      status: "open",
      amountDueCents: 9900,
      amountRemainingCents: 9900,
      createdAt: now - 86400 * 35, // 30 days before cancel (too far)
    });

    const leaks = scanBillingChurn([sub], [invoice]);
    expect(leaks).toHaveLength(0);
  });

  it("ignores active sub with failed invoice (didn't cancel)", () => {
    const now = Math.floor(Date.now() / 1000);
    const customerId = "cus_active";

    const sub = mockSubscription({
      status: "active",
      customerId,
      canceledAt: null,
    });

    const invoice = mockInvoice({
      customerId,
      status: "open",
      amountDueCents: 9900,
      amountRemainingCents: 9900,
      createdAt: now - 86400 * 3,
    });

    const leaks = scanBillingChurn([sub], [invoice]);
    expect(leaks).toHaveLength(0);
  });

  it("assigns high severity for large amounts", () => {
    const now = Math.floor(Date.now() / 1000);
    const customerId = "cus_big";

    const sub = mockSubscription({
      status: "canceled",
      customerId,
      monthlyAmountCents: 49900, // $499/mo
      canceledAt: now - 86400 * 5,
    });

    const invoice = mockInvoice({
      customerId,
      status: "open",
      amountDueCents: 49900,
      amountRemainingCents: 49900,
      createdAt: now - 86400 * 7,
    });

    const leaks = scanBillingChurn([sub], [invoice]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].severity).toBe("high");
  });
});
