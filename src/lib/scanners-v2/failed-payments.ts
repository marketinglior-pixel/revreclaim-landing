import { NormalizedInvoice, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanFailedPayments(invoices: NormalizedInvoice[]): Leak[] {
  const leaks: Leak[] = [];

  for (const invoice of invoices) {
    if (invoice.status !== "open") continue;
    if (invoice.amountRemainingCents === 0) continue;
    if (invoice.amountDueCents <= 0) continue;

    const severity: "critical" | "high" | "medium" =
      invoice.amountDueCents > 50000
        ? "critical"
        : invoice.amountDueCents > 10000
          ? "high"
          : "medium";

    const daysOverdue = invoice.dueDate
      ? Math.floor((Date.now() / 1000 - invoice.dueDate) / 86400)
      : invoice.createdAt
        ? Math.floor((Date.now() / 1000 - invoice.createdAt) / 86400)
        : 0;

    const platformLabel = PLATFORM_LABELS[invoice.platform];

    leaks.push({
      id: generateLeakId(),
      type: "failed_payment",
      severity,
      title: `Unpaid invoice for ${formatCents(invoice.amountDueCents)}`,
      description: `Invoice ${invoice.number || invoice.id} has been unpaid for ${Math.max(0, daysOverdue)} days. ${
        invoice.attempted
          ? "Payment was attempted but failed."
          : "Payment has not been attempted yet."
      }`,
      customerEmail: invoice.customerEmail
        ? maskEmail(invoice.customerEmail)
        : null,
      customerId: invoice.customerId,
      subscriptionId: invoice.subscriptionId,
      monthlyImpact: invoice.amountDueCents,
      annualImpact: invoice.amountDueCents, // One-time: single failed invoice
      recoveryRate: 0.6,
      isRecurring: false,
      fixSuggestion: invoice.attempted
        ? `The payment failed. Contact the customer to update their payment method, or retry the payment from ${platformLabel} Dashboard.`
        : `This invoice hasn't been charged yet. Go to ${platformLabel} Dashboard to charge the customer.`,
      platformUrl: invoice.platformUrl,
      stripeUrl:
        invoice.platform === "stripe" ? invoice.platformUrl : undefined,
      detectedAt: new Date().toISOString(),
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        amountDue: invoice.amountDueCents,
        daysOverdue: Math.max(0, daysOverdue),
        attempted: invoice.attempted,
        nextPaymentAttempt: invoice.nextPaymentAttempt,
        platform: invoice.platform,
      },
    });
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
