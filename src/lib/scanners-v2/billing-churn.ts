import { NormalizedSubscription, NormalizedInvoice, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";
import { RISK_MULTIPLIERS } from "./risk-multipliers";

/**
 * Detect billing-caused churn: subscriptions that were canceled
 * within 14 days of a failed payment.
 *
 * This is NOT a general churn reason tool (that's InsightLab's domain).
 * It specifically detects when billing failures CAUSE churn.
 * Actionable: better dunning setup = fewer of these.
 *
 * Logic:
 * 1. Find all canceled subscriptions (canceledAt exists)
 * 2. For each, check if there's a failed/open invoice within 14 days before canceledAt
 * 3. If yes → this customer likely churned because of billing failure
 */

const FOURTEEN_DAYS_SECONDS = 86400 * 14;

export function scanBillingChurn(
  subscriptions: NormalizedSubscription[],
  invoices: NormalizedInvoice[]
): Leak[] {
  const leaks: Leak[] = [];

  // Index failed invoices by customerId for fast lookup
  const failedInvoicesByCustomer = new Map<string, NormalizedInvoice[]>();
  for (const inv of invoices) {
    if (inv.status !== "open" && inv.status !== "uncollectible") continue;
    if (inv.amountRemainingCents <= 0) continue;

    const existing = failedInvoicesByCustomer.get(inv.customerId) ?? [];
    existing.push(inv);
    failedInvoicesByCustomer.set(inv.customerId, existing);
  }

  for (const sub of subscriptions) {
    // Only look at canceled subscriptions
    if (sub.status !== "canceled" || !sub.canceledAt) continue;

    const customerInvoices = failedInvoicesByCustomer.get(sub.customerId);
    if (!customerInvoices || customerInvoices.length === 0) continue;

    // Check if any failed invoice happened within 14 days before cancellation
    const billingFailure = customerInvoices.find((inv) => {
      const timeBetween = sub.canceledAt! - inv.createdAt;
      // Invoice created before cancellation, within 14 days
      return timeBetween >= 0 && timeBetween <= FOURTEEN_DAYS_SECONDS;
    });

    if (!billingFailure) continue;

    const riskAdjusted = Math.round(sub.monthlyAmountCents * RISK_MULTIPLIERS.billing_churn);
    const platformLabel = PLATFORM_LABELS[sub.platform];
    const daysBetween = Math.round((sub.canceledAt - billingFailure.createdAt) / 86400);

    leaks.push({
      id: generateLeakId(),
      type: "billing_churn",
      severity: riskAdjusted > 10000 ? "high" : "medium",
      title: `Customer canceled ${daysBetween} days after payment failure`,
      description: `This subscription ($${(sub.monthlyAmountCents / 100).toFixed(2)}/mo) was canceled ${daysBetween} days after a payment of $${(billingFailure.amountDueCents / 100).toFixed(2)} failed. This churn was likely caused by a billing issue, not product dissatisfaction.`,
      customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
      customerId: sub.customerId,
      subscriptionId: sub.id,
      monthlyImpact: riskAdjusted,
      annualImpact: riskAdjusted, // one-time loss, not recurring
      recoveryRate: 0.3, // harder to recover — customer already left
      isRecurring: false,
      fixSuggestion: `Set up dunning emails in ${platformLabel} to prevent this pattern. Reach out to this customer with a direct payment link — they may resubscribe if the billing issue is resolved.`,
      platformUrl: sub.platformUrl,
      stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
      detectedAt: new Date().toISOString(),
      metadata: {
        canceledAt: new Date(sub.canceledAt * 1000).toISOString(),
        failedInvoiceId: billingFailure.id,
        failedInvoiceDate: new Date(billingFailure.createdAt * 1000).toISOString(),
        failedAmountCents: billingFailure.amountDueCents,
        daysBetweenFailureAndCancel: daysBetween,
        riskMultiplier: RISK_MULTIPLIERS.billing_churn,
        platform: sub.platform,
      },
    });
  }

  return leaks;
}
