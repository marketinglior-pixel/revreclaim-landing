import Stripe from "stripe";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanLegacyPricing(
  subscriptions: Stripe.Subscription[],
  prices: Stripe.Price[],
  products: Stripe.Product[]
): Leak[] {
  const leaks: Leak[] = [];

  // Build a map: productId -> sorted prices (newest first)
  const productPrices = new Map<string, Stripe.Price[]>();
  for (const price of prices) {
    if (!price.active) continue;
    if (!price.recurring) continue;

    const productId =
      typeof price.product === "string"
        ? price.product
        : (price.product as Stripe.Product).id;

    if (!productPrices.has(productId)) {
      productPrices.set(productId, []);
    }
    productPrices.get(productId)!.push(price);
  }

  // Sort each product's prices by created date (newest first)
  for (const [, pList] of productPrices) {
    pList.sort((a, b) => b.created - a.created);
  }

  // Build a set of archived/inactive product IDs
  const archivedProducts = new Set(
    products.filter((p) => !p.active).map((p) => p.id)
  );

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    for (const item of sub.items.data) {
      const price = item.price;
      const productId =
        typeof price.product === "string"
          ? price.product
          : (price.product as Stripe.Product).id;

      // Check 1: Subscription on an archived product
      if (archivedProducts.has(productId)) {
        const monthlyAmount = getItemMonthlyAmount(item);
        if (monthlyAmount <= 0) continue;

        const customerEmail =
          typeof sub.customer === "string"
            ? null
            : (sub.customer as Stripe.Customer).email;

        leaks.push({
          id: generateLeakId(),
          type: "legacy_pricing",
          severity: "medium",
          title: `Subscription on archived product`,
          description: `This customer is on a product that has been archived/deactivated. They may be on legacy pricing that doesn't reflect your current plans.`,
          customerEmail: customerEmail ? maskEmail(customerEmail) : null,
          customerId:
            typeof sub.customer === "string"
              ? sub.customer
              : sub.customer.id,
          subscriptionId: sub.id,
          monthlyImpact: 0, // Can't calculate without knowing the new price
          annualImpact: 0,
          recoveryRate: 0.3,
          isRecurring: true, // Price difference continues every month
          fixSuggestion:
            "Migrate this customer to your current pricing plan. Go to Stripe Dashboard → Subscriptions → Select subscription → Update subscription → Choose new price.",
          stripeUrl: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
          detectedAt: new Date().toISOString(),
          metadata: {
            productId,
            priceId: price.id,
            currentAmount: price.unit_amount,
            archived: true,
          },
        });
        continue;
      }

      // Check 2: Older price exists when a newer price for the same product is available
      const allPricesForProduct = productPrices.get(productId);
      if (!allPricesForProduct || allPricesForProduct.length < 2) continue;

      const newestPrice = allPricesForProduct[0];
      if (newestPrice.id === price.id) continue; // Already on newest price

      // Only flag if the newer price is more expensive (actual revenue loss)
      const currentMonthly = normalizeToMonthly(price);
      const newestMonthly = normalizeToMonthly(newestPrice);

      if (newestMonthly <= currentMonthly) continue; // New price is same or cheaper

      const priceDifference = newestMonthly - currentMonthly;
      const percentDiff = Math.round(
        (priceDifference / currentMonthly) * 100
      );

      const severity =
        percentDiff > 30 ? "high" : percentDiff > 15 ? "medium" : "low";

      const customerEmail =
        typeof sub.customer === "string"
          ? null
          : (sub.customer as Stripe.Customer).email;

      leaks.push({
        id: generateLeakId(),
        type: "legacy_pricing",
        severity,
        title: `Customer on old pricing - ${percentDiff}% below current rate`,
        description: `This customer pays ${formatCents(currentMonthly)}/mo but your current price is ${formatCents(newestMonthly)}/mo. That's ${formatCents(priceDifference)}/mo in potential revenue.`,
        customerEmail: customerEmail ? maskEmail(customerEmail) : null,
        customerId:
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer.id,
        subscriptionId: sub.id,
        monthlyImpact: priceDifference,
        annualImpact: priceDifference * 12,
        recoveryRate: 0.3, // Only ~30% of customers will accept a price increase without churning
        isRecurring: true, // Price difference continues every month
        fixSuggestion: `Consider migrating this customer to the current price (${formatCents(newestMonthly)}/mo). You can grandfather them or offer a gradual increase. Go to Stripe Dashboard → Subscriptions → Update subscription.`,
        stripeUrl: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
        detectedAt: new Date().toISOString(),
        metadata: {
          currentPriceId: price.id,
          newestPriceId: newestPrice.id,
          currentAmount: currentMonthly,
          newestAmount: newestMonthly,
          percentDiff,
        },
      });
    }
  }

  return leaks;
}

function normalizeToMonthly(price: Stripe.Price): number {
  const amount = price.unit_amount || 0;
  switch (price.recurring?.interval) {
    case "month":
      return amount;
    case "year":
      return Math.round(amount / 12);
    case "week":
      return Math.round(amount * 4.33);
    case "day":
      return Math.round(amount * 30);
    default:
      return amount;
  }
}

function getItemMonthlyAmount(item: Stripe.SubscriptionItem): number {
  const price = item.price;
  if (!price.unit_amount) return 0;
  const amount = price.unit_amount * (item.quantity || 1);
  switch (price.recurring?.interval) {
    case "month":
      return amount;
    case "year":
      return Math.round(amount / 12);
    case "week":
      return Math.round(amount * 4.33);
    case "day":
      return Math.round(amount * 30);
    default:
      return amount;
  }
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
