import { NormalizedSubscription, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

/**
 * Duplicate Subscriptions Scanner
 *
 * Detects customers who have multiple active subscriptions when they likely
 * should only have one. This is a common revenue integrity issue that can
 * indicate:
 *
 * - Failed subscription upgrade (old sub not canceled, new one created)
 * - Double-charge risk (customer paying twice, will eventually dispute)
 * - Botched migration (manual sub creation without canceling the old one)
 * - Webhook race condition (checkout session creates duplicate)
 *
 * Two checks:
 * 1. Same customer with 2+ active subs to the SAME product
 * 2. Same customer with 2+ active subs where one looks like an upgrade of another
 */
export function scanDuplicateSubscriptions(
  subscriptions: NormalizedSubscription[]
): Leak[] {
  const leaks: Leak[] = [];

  // Group active/trialing subscriptions by customer
  const subsByCustomer = new Map<string, NormalizedSubscription[]>();
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    if (!subsByCustomer.has(sub.customerId)) {
      subsByCustomer.set(sub.customerId, []);
    }
    subsByCustomer.get(sub.customerId)!.push(sub);
  }

  for (const [customerId, customerSubs] of subsByCustomer) {
    if (customerSubs.length < 2) continue;

    // Check 1: Same product appearing in multiple active subscriptions
    // Build a map of productId -> subscriptions containing that product
    const subsByProduct = new Map<string, NormalizedSubscription[]>();
    for (const sub of customerSubs) {
      for (const item of sub.items) {
        if (!subsByProduct.has(item.productId)) {
          subsByProduct.set(item.productId, []);
        }
        const existing = subsByProduct.get(item.productId)!;
        // Avoid adding the same sub twice (if it has multiple items with same product)
        if (!existing.some((s) => s.id === sub.id)) {
          existing.push(sub);
        }
      }
    }

    for (const [, productSubs] of subsByProduct) {
      if (productSubs.length < 2) continue;

      // Found duplicate: same customer, same product, multiple active subs
      // Sort by creation date (oldest first) — the newer one is likely the duplicate
      productSubs.sort((a, b) => a.createdAt - b.createdAt);

      const older = productSubs[0];
      const newer = productSubs[productSubs.length - 1];
      const platformLabel = PLATFORM_LABELS[newer.platform];

      // The duplicate charge is the smaller of the two (the one that shouldn't exist)
      const duplicateAmount = Math.min(
        older.monthlyAmountCents,
        newer.monthlyAmountCents
      );

      if (duplicateAmount <= 0) continue;

      leaks.push({
        id: generateLeakId(),
        type: "duplicate_subscription",
        severity:
          duplicateAmount > 10000
            ? "critical"
            : duplicateAmount > 3000
              ? "high"
              : "medium",
        title: `Customer has ${productSubs.length} active subscriptions for the same product`,
        description: `This customer has ${productSubs.length} overlapping active subscriptions containing the same product. The older subscription (${formatCents(older.monthlyAmountCents)}/mo) was created on ${formatDate(older.createdAt)} and the newer one (${formatCents(newer.monthlyAmountCents)}/mo) on ${formatDate(newer.createdAt)}. One is likely a duplicate — the customer may be double-charged.`,
        customerEmail: newer.customerEmail
          ? maskEmail(newer.customerEmail)
          : null,
        customerId,
        subscriptionId: newer.id, // Flag the newer sub as the likely duplicate
        monthlyImpact: duplicateAmount,
        annualImpact: duplicateAmount * 12,
        fixSuggestion: `Review this customer's subscriptions in ${platformLabel} Dashboard. If one is a duplicate from a failed upgrade or migration, cancel it and consider issuing a proactive refund to prevent a chargeback.`,
        platformUrl: newer.platformUrl,
        stripeUrl: newer.platform === "stripe" ? newer.platformUrl : undefined,
        detectedAt: new Date().toISOString(),
        metadata: {
          duplicateCount: productSubs.length,
          olderSubId: older.id,
          olderMonthlyCents: older.monthlyAmountCents,
          olderCreatedAt: formatDate(older.createdAt),
          newerSubId: newer.id,
          newerMonthlyCents: newer.monthlyAmountCents,
          newerCreatedAt: formatDate(newer.createdAt),
          platform: newer.platform,
        },
      });
    }

    // Check 2: Multiple active subs that look like a tier upgrade
    // (different products but one was created shortly after another — within 48 hours)
    // Only check if we haven't already flagged this customer in Check 1
    if (leaks.some((l) => l.customerId === customerId)) continue;

    // Sort by creation date
    const sorted = [...customerSubs].sort(
      (a, b) => a.createdAt - b.createdAt
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const olderSub = sorted[i];
      const newerSub = sorted[i + 1];

      // If the newer sub was created within 48 hours of the older one,
      // and the newer one costs more, it's likely a failed upgrade
      const hoursBetween =
        (newerSub.createdAt - olderSub.createdAt) / 3600;

      if (
        hoursBetween <= 48 &&
        newerSub.monthlyAmountCents > olderSub.monthlyAmountCents
      ) {
        const platformLabel = PLATFORM_LABELS[olderSub.platform];

        leaks.push({
          id: generateLeakId(),
          type: "duplicate_subscription",
          severity:
            olderSub.monthlyAmountCents > 5000 ? "high" : "medium",
          title: `Possible failed upgrade — old subscription still active`,
          description: `This customer created a higher-tier subscription (${formatCents(newerSub.monthlyAmountCents)}/mo) within ${Math.round(hoursBetween)} hours of their existing one (${formatCents(olderSub.monthlyAmountCents)}/mo), but the old subscription was never canceled. They may be paying for both.`,
          customerEmail: olderSub.customerEmail
            ? maskEmail(olderSub.customerEmail)
            : null,
          customerId,
          subscriptionId: olderSub.id, // The old sub that should have been canceled
          monthlyImpact: olderSub.monthlyAmountCents,
          annualImpact: olderSub.monthlyAmountCents * 12,
          fixSuggestion: `Check if this customer upgraded their plan in ${platformLabel} Dashboard. If so, cancel the older subscription (${formatCents(olderSub.monthlyAmountCents)}/mo) and consider refunding any overlap charges.`,
          platformUrl: olderSub.platformUrl,
          stripeUrl:
            olderSub.platform === "stripe"
              ? olderSub.platformUrl
              : undefined,
          detectedAt: new Date().toISOString(),
          metadata: {
            olderSubId: olderSub.id,
            olderMonthlyCents: olderSub.monthlyAmountCents,
            olderCreatedAt: formatDate(olderSub.createdAt),
            newerSubId: newerSub.id,
            newerMonthlyCents: newerSub.monthlyAmountCents,
            newerCreatedAt: formatDate(newerSub.createdAt),
            hoursBetween: Math.round(hoursBetween),
            platform: olderSub.platform,
          },
        });
        break; // Only flag the first upgrade mismatch per customer
      }
    }
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toISOString().split("T")[0];
}
