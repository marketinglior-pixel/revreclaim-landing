import Stripe from "stripe";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanFailedPayments(
  invoices: Stripe.Invoice[]
): Leak[] {
  const leaks: Leak[] = [];

  for (const invoice of invoices) {
    // Only look at open invoices that payment was attempted but failed
    if (invoice.status !== "open") continue;
    if (invoice.amount_remaining === 0) continue;

    const amountDue = invoice.amount_due || 0;
    if (amountDue <= 0) continue;

    const severity: "critical" | "high" | "medium" =
      amountDue > 50000
        ? "critical"
        : amountDue > 10000
          ? "high"
          : "medium";

    const customerEmail =
      typeof invoice.customer === "string"
        ? null
        : (invoice.customer as Stripe.Customer)?.email || null;

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : (invoice.customer as Stripe.Customer)?.id || "unknown";

    const subDetails = invoice.parent?.subscription_details;
    const subscriptionId = subDetails
      ? typeof subDetails.subscription === "string"
        ? subDetails.subscription
        : subDetails.subscription?.id || null
      : null;

    const daysOverdue = invoice.due_date
      ? Math.floor((Date.now() / 1000 - invoice.due_date) / 86400)
      : invoice.created
        ? Math.floor((Date.now() / 1000 - invoice.created) / 86400)
        : 0;

    leaks.push({
      id: generateLeakId(),
      type: "failed_payment",
      severity,
      title: `Unpaid invoice for ${formatCents(amountDue)}`,
      description: `Invoice ${invoice.number || invoice.id} has been unpaid for ${Math.max(0, daysOverdue)} days. ${invoice.attempted ? "Payment was attempted but failed." : "Payment has not been attempted yet."}`,
      customerEmail: customerEmail ? maskEmail(customerEmail) : null,
      customerId,
      subscriptionId,
      monthlyImpact: amountDue,
      annualImpact: amountDue * 12,
      fixSuggestion:
        invoice.attempted
          ? "The payment failed. Contact the customer to update their payment method, or retry the payment from Stripe Dashboard → Invoices → Select invoice → Retry payment."
          : "This invoice hasn't been charged yet. Go to Stripe Dashboard → Invoices → Select invoice → Charge customer.",
      detectedAt: new Date().toISOString(),
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        amountDue,
        daysOverdue: Math.max(0, daysOverdue),
        attempted: invoice.attempted,
        nextPaymentAttempt: invoice.next_payment_attempt,
      },
    });
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
