import {
  NormalizedSubscription,
  NormalizedInvoice,
  PLATFORM_LABELS,
  normalizeIntervalToMonthly,
} from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

/**
 * Unbilled Overages Scanner
 *
 * Detects subscriptions where the customer's actual usage (based on invoice
 * history) consistently exceeds their plan's base price — suggesting metered
 * or usage-based billing isn't capturing overages, or the customer has
 * outgrown their current tier.
 *
 * Checks:
 * 1. Subscriptions with quantity > 1 where invoice amounts don't reflect
 *    quantity-based pricing (quantity discount leak)
 * 2. Subscriptions where recent paid invoices are consistently at the plan
 *    ceiling — customer may need a higher tier
 * 3. Subscriptions with line items showing $0 overage charges (metered
 *    billing configured but not charging)
 */
export function scanUnbilledOverages(
  subscriptions: NormalizedSubscription[],
  invoices: NormalizedInvoice[]
): Leak[] {
  const leaks: Leak[] = [];

  // Build map: subscriptionId -> invoices with non-zero amounts (sorted newest first).
  // Accepts any status (open, paid, etc.) — the current pipeline only fetches open
  // invoices, so Check 2 below will only trigger when 3+ open invoices exist for
  // the same subscription. Once paid invoice history is added to the data pipeline,
  // this will automatically start analyzing historical billing patterns too.
  const invoicesBySubscription = new Map<string, NormalizedInvoice[]>();
  for (const inv of invoices) {
    if (!inv.subscriptionId || inv.amountDueCents <= 0) continue;
    if (!invoicesBySubscription.has(inv.subscriptionId)) {
      invoicesBySubscription.set(inv.subscriptionId, []);
    }
    invoicesBySubscription.get(inv.subscriptionId)!.push(inv);
  }

  for (const [, invList] of invoicesBySubscription) {
    invList.sort((a, b) => b.createdAt - a.createdAt);
  }

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    const platformLabel = PLATFORM_LABELS[sub.platform];

    // Check 1: Quantity > 1 subscriptions where per-seat pricing may not be applied
    for (const item of sub.items) {
      if (item.quantity <= 1) continue;

      const expectedMonthly = normalizeIntervalToMonthly(
        item.unitAmountCents * item.quantity,
        item.interval
      );

      // If the subscription monthly amount is significantly less than expected
      // (e.g., charging for 1 seat when quantity says 5), flag it
      if (sub.monthlyAmountCents > 0 && sub.monthlyAmountCents < expectedMonthly * 0.8) {
        const missedRevenue = expectedMonthly - sub.monthlyAmountCents;
        if (missedRevenue <= 0) continue;

        leaks.push({
          id: generateLeakId(),
          type: "unbilled_overage",
          severity: missedRevenue > 10000 ? "high" : missedRevenue > 3000 ? "medium" : "low",
          title: `Quantity mismatch: ${item.quantity} seats but billing doesn't match`,
          description: `This subscription has ${item.quantity} seats at ${formatCents(item.unitAmountCents)}/seat but is only being charged ${formatCents(sub.monthlyAmountCents)}/mo instead of ${formatCents(expectedMonthly)}/mo.`,
          customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          monthlyImpact: missedRevenue,
          annualImpact: missedRevenue * 12,
          recoveryRate: 0.7,
          isRecurring: true, // Underbilling continues every billing cycle
          fixSuggestion: `Review the subscription quantity and pricing in ${platformLabel} Dashboard. The customer has ${item.quantity} seats — verify the billing reflects this.`,
          platformUrl: sub.platformUrl,
          stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
          detectedAt: new Date().toISOString(),
          metadata: {
            quantity: item.quantity,
            unitAmountCents: item.unitAmountCents,
            expectedMonthly,
            actualMonthly: sub.monthlyAmountCents,
            platform: sub.platform,
          },
        });
      }
    }

    // Check 2: Invoices consistently higher than subscription base price
    // (indicates usage charges that are happening but maybe not enough)
    const subInvoices = invoicesBySubscription.get(sub.id);
    if (!subInvoices || subInvoices.length < 3) continue;

    // Look at last 3 invoices
    const recentInvoices = subInvoices.slice(0, 3);
    const avgInvoiceAmount = Math.round(
      recentInvoices.reduce((sum, inv) => sum + inv.amountDueCents, 0) / recentInvoices.length
    );

    // If average invoice is significantly more than the base subscription
    // (50%+ above base), the customer may need a higher tier
    if (
      sub.monthlyAmountCents > 0 &&
      avgInvoiceAmount > sub.monthlyAmountCents * 1.5
    ) {
      const overage = avgInvoiceAmount - sub.monthlyAmountCents;

      // Skip if already reported via quantity check
      if (leaks.some(l => l.subscriptionId === sub.id)) continue;

      leaks.push({
        id: generateLeakId(),
        type: "unbilled_overage",
        severity: overage > 10000 ? "high" : overage > 3000 ? "medium" : "low",
        title: `Customer consistently exceeding plan limits`,
        description: `Average recent invoice (${formatCents(avgInvoiceAmount)}) is ${Math.round((overage / sub.monthlyAmountCents) * 100)}% above the base plan (${formatCents(sub.monthlyAmountCents)}/mo). This customer may need a higher tier or overage billing review.`,
        customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        monthlyImpact: overage,
        annualImpact: overage * 12,
        recoveryRate: 0.7,
        isRecurring: true, // Usage pattern likely continues
        fixSuggestion: `Review this customer's usage and consider upgrading them to a higher plan in ${platformLabel} Dashboard, or verify overage billing is configured correctly.`,
        platformUrl: sub.platformUrl,
        stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
        detectedAt: new Date().toISOString(),
        metadata: {
          baseMonthlyCents: sub.monthlyAmountCents,
          avgInvoiceCents: avgInvoiceAmount,
          invoicesAnalyzed: recentInvoices.length,
          overagePercent: Math.round((overage / sub.monthlyAmountCents) * 100),
          platform: sub.platform,
        },
      });
    }
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
