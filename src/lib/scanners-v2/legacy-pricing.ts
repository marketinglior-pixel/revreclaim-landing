import {
  NormalizedSubscription,
  NormalizedPrice,
  NormalizedProduct,
  PLATFORM_LABELS,
  normalizeIntervalToMonthly,
} from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanLegacyPricing(
  subscriptions: NormalizedSubscription[],
  prices: NormalizedPrice[],
  products: NormalizedProduct[]
): Leak[] {
  const leaks: Leak[] = [];

  // Build a map: productId -> sorted prices (newest first)
  const productPrices = new Map<string, NormalizedPrice[]>();
  for (const price of prices) {
    if (!price.active) continue;
    if (!productPrices.has(price.productId)) {
      productPrices.set(price.productId, []);
    }
    productPrices.get(price.productId)!.push(price);
  }

  // Sort each product's prices by created date (newest first)
  for (const [, pList] of productPrices) {
    pList.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Build a set of archived/inactive product IDs
  const archivedProducts = new Set(
    products.filter((p) => !p.active).map((p) => p.id)
  );

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    const platformLabel = PLATFORM_LABELS[sub.platform];

    for (const item of sub.items) {
      // Check 1: Subscription on an archived product
      if (archivedProducts.has(item.productId)) {
        const monthlyAmount = normalizeIntervalToMonthly(
          item.unitAmountCents * item.quantity,
          item.interval
        );
        if (monthlyAmount <= 0) continue;

        leaks.push({
          id: generateLeakId(),
          type: "legacy_pricing",
          severity: "medium",
          title: `Subscription on archived product`,
          description: `This customer is on a product that has been archived/deactivated. They may be on legacy pricing that doesn't reflect your current plans.`,
          customerEmail: sub.customerEmail
            ? maskEmail(sub.customerEmail)
            : null,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          monthlyImpact: 0,
          annualImpact: 0,
          recoveryRate: 0.3,
          isRecurring: true, // Price difference continues every month
          fixSuggestion: `Migrate this customer to your current pricing plan. Go to ${platformLabel} Dashboard → Subscriptions → Update subscription.`,
          platformUrl: sub.platformUrl,
          stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
          detectedAt: new Date().toISOString(),
          metadata: {
            productId: item.productId,
            priceId: item.priceId,
            currentAmount: item.unitAmountCents,
            archived: true,
            platform: sub.platform,
          },
        });
        continue;
      }

      // Check 2: Older price when a newer, more expensive price exists
      const allPricesForProduct = productPrices.get(item.productId);
      if (!allPricesForProduct || allPricesForProduct.length < 2) continue;

      const newestPrice = allPricesForProduct[0];
      if (newestPrice.id === item.priceId) continue; // Already on newest

      const currentMonthly = normalizeIntervalToMonthly(
        item.unitAmountCents,
        item.interval
      );
      const newestMonthly = normalizeIntervalToMonthly(
        newestPrice.unitAmountCents,
        newestPrice.interval
      );

      if (newestMonthly <= currentMonthly) continue; // New price is same or cheaper

      const priceDifference = newestMonthly - currentMonthly;
      const percentDiff = Math.round(
        (priceDifference / currentMonthly) * 100
      );

      const severity =
        percentDiff > 30 ? "high" : percentDiff > 15 ? "medium" : "low";

      leaks.push({
        id: generateLeakId(),
        type: "legacy_pricing",
        severity,
        title: `Customer on old pricing - ${percentDiff}% below current rate`,
        description: `This customer pays ${formatCents(currentMonthly)}/mo but your current price is ${formatCents(newestMonthly)}/mo. That's ${formatCents(priceDifference)}/mo in potential revenue.`,
        customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        monthlyImpact: priceDifference,
        annualImpact: priceDifference * 12,
        recoveryRate: 0.3,
        isRecurring: true, // Price difference continues every month
        fixSuggestion: `Consider migrating this customer to the current price (${formatCents(newestMonthly)}/mo). Go to ${platformLabel} Dashboard → Subscriptions → Update subscription.`,
        platformUrl: sub.platformUrl,
        stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
        detectedAt: new Date().toISOString(),
        metadata: {
          currentPriceId: item.priceId,
          newestPriceId: newestPrice.id,
          currentAmount: currentMonthly,
          newestAmount: newestMonthly,
          percentDiff,
          platform: sub.platform,
        },
      });
    }
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
