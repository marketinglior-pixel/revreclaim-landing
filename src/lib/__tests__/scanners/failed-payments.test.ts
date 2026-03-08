import { describe, it, expect, beforeEach } from "vitest";
import { scanFailedPayments } from "../../scanners-v2/failed-payments";
import { mockInvoice, resetCounter } from "./helpers";

describe("scanFailedPayments", () => {
  beforeEach(() => {
    resetCounter();
  });

  it("returns empty array when no invoices", () => {
    expect(scanFailedPayments([])).toEqual([]);
  });

  it("ignores paid invoices", () => {
    const inv = mockInvoice({ status: "paid" });
    expect(scanFailedPayments([inv])).toEqual([]);
  });

  it("ignores void invoices", () => {
    const inv = mockInvoice({ status: "void" });
    expect(scanFailedPayments([inv])).toEqual([]);
  });

  it("ignores open invoices with zero amount remaining", () => {
    const inv = mockInvoice({ amountRemainingCents: 0 });
    expect(scanFailedPayments([inv])).toEqual([]);
  });

  it("ignores invoices with zero or negative amount due", () => {
    const inv = mockInvoice({ amountDueCents: 0 });
    expect(scanFailedPayments([inv])).toEqual([]);
  });

  it("detects open invoice with unpaid amount", () => {
    const inv = mockInvoice({
      amountDueCents: 4900,
      amountRemainingCents: 4900,
      attempted: true,
    });

    const leaks = scanFailedPayments([inv]);
    expect(leaks).toHaveLength(1);
    expect(leaks[0].type).toBe("failed_payment");
    expect(leaks[0].monthlyImpact).toBe(4900);
    expect(leaks[0].annualImpact).toBe(4900 * 12);
  });

  it("assigns critical severity for invoices > $500", () => {
    const inv = mockInvoice({ amountDueCents: 60000 });
    const leaks = scanFailedPayments([inv]);
    expect(leaks[0].severity).toBe("critical");
  });

  it("assigns high severity for invoices > $100", () => {
    const inv = mockInvoice({ amountDueCents: 15000 });
    const leaks = scanFailedPayments([inv]);
    expect(leaks[0].severity).toBe("high");
  });

  it("assigns medium severity for invoices <= $100", () => {
    const inv = mockInvoice({ amountDueCents: 4900 });
    const leaks = scanFailedPayments([inv]);
    expect(leaks[0].severity).toBe("medium");
  });

  it("includes attempted status in description", () => {
    const inv = mockInvoice({ attempted: true });
    const leaks = scanFailedPayments([inv]);
    expect(leaks[0].description).toContain("Payment was attempted but failed");
  });

  it("includes not-attempted status in description", () => {
    const inv = mockInvoice({ attempted: false });
    const leaks = scanFailedPayments([inv]);
    expect(leaks[0].description).toContain("Payment has not been attempted");
  });

  it("calculates days overdue from dueDate", () => {
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 86400 * 7;
    const inv = mockInvoice({ dueDate: sevenDaysAgo });

    const leaks = scanFailedPayments([inv]);
    const daysOverdue = leaks[0].metadata.daysOverdue as number;
    expect(daysOverdue).toBeGreaterThanOrEqual(6);
    expect(daysOverdue).toBeLessThanOrEqual(8);
  });

  it("handles multiple failed invoices", () => {
    const invoices = [
      mockInvoice({ amountDueCents: 4900 }),
      mockInvoice({ amountDueCents: 9900 }),
      mockInvoice({ status: "paid" }), // Should be skipped
    ];

    const leaks = scanFailedPayments(invoices);
    expect(leaks).toHaveLength(2);
  });
});
