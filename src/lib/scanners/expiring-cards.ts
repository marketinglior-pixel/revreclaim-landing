import Stripe from "stripe";
import { Leak, LeakSeverity } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanExpiringCards(
  subscriptions: Stripe.Subscription[],
  paymentMethods: Map<string, Stripe.PaymentMethod[]>
): Leak[] {
  const leaks: Leak[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    const customerId =
      typeof sub.customer === "string"
        ? sub.customer
        : sub.customer.id;

    const methods = paymentMethods.get(customerId) || [];

    // Check the default payment method first, then fall back to any card
    const defaultPM = sub.default_payment_method;
    let cardToCheck: Stripe.PaymentMethod | undefined;

    if (defaultPM && typeof defaultPM !== "string" && defaultPM.card) {
      cardToCheck = defaultPM;
    } else {
      // Find any card payment method
      cardToCheck = methods.find((m) => m.type === "card" && m.card);
    }

    if (!cardToCheck?.card) continue;

    const { exp_month, exp_year } = cardToCheck.card;
    const monthsUntilExpiry =
      (exp_year - currentYear) * 12 + (exp_month - currentMonth);

    if (monthsUntilExpiry > 3) continue; // More than 90 days, skip

    let severity: LeakSeverity;
    let urgency: string;

    if (monthsUntilExpiry <= 0) {
      severity = "critical";
      urgency = "Card has already expired!";
    } else if (monthsUntilExpiry <= 1) {
      severity = "critical";
      urgency = "Card expires within 30 days";
    } else if (monthsUntilExpiry <= 2) {
      severity = "high";
      urgency = "Card expires within 60 days";
    } else {
      severity = "medium";
      urgency = "Card expires within 90 days";
    }

    const monthlyAmount = getSubscriptionMonthlyAmount(sub);

    const customerEmail =
      typeof sub.customer === "string"
        ? null
        : (sub.customer as Stripe.Customer).email;

    leaks.push({
      id: generateLeakId(),
      type: "expiring_card",
      severity,
      title: `${urgency} - ${formatCents(monthlyAmount)}/mo at risk`,
      description: `The card ending in ${cardToCheck.card.last4} (${cardToCheck.card.brand}) expires ${exp_month}/${exp_year}. This subscription of ${formatCents(monthlyAmount)}/mo will fail at the next billing cycle.`,
      customerEmail: customerEmail ? maskEmail(customerEmail) : null,
      customerId,
      subscriptionId: sub.id,
      monthlyImpact: monthlyAmount,
      annualImpact: monthlyAmount * 12,
      fixSuggestion:
        "Contact the customer to update their payment method before it expires. Stripe Dashboard → Customers → Select customer → Send update payment method email.",
      stripeUrl: `https://dashboard.stripe.com/customers/${customerId}`,
      detectedAt: new Date().toISOString(),
      metadata: {
        cardLast4: cardToCheck.card.last4,
        cardBrand: cardToCheck.card.brand,
        expMonth: exp_month,
        expYear: exp_year,
        monthsUntilExpiry,
      },
    });
  }

  return leaks;
}

function getSubscriptionMonthlyAmount(sub: Stripe.Subscription): number {
  let total = 0;
  for (const item of sub.items.data) {
    const price = item.price;
    if (!price.unit_amount) continue;
    const amount = price.unit_amount * (item.quantity || 1);
    switch (price.recurring?.interval) {
      case "month":
        total += amount;
        break;
      case "year":
        total += Math.round(amount / 12);
        break;
      case "week":
        total += Math.round(amount * 4.33);
        break;
      case "day":
        total += Math.round(amount * 30);
        break;
      default:
        total += amount;
    }
  }
  return total;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
