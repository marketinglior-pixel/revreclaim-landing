import Stripe from "stripe";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanMissingPaymentMethods(
  subscriptions: Stripe.Subscription[],
  paymentMethods: Map<string, Stripe.PaymentMethod[]>
): Leak[] {
  const leaks: Leak[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    const customerId =
      typeof sub.customer === "string"
        ? sub.customer
        : sub.customer.id;

    // Check if subscription has a default payment method
    const hasSubDefault = !!sub.default_payment_method;

    // Check if customer has any payment methods
    const customerMethods = paymentMethods.get(customerId) || [];
    const hasValidCard = customerMethods.some(
      (m) => m.type === "card" && m.card
    );

    if (hasSubDefault || hasValidCard) continue;

    const monthlyAmount = getSubscriptionMonthlyAmount(sub);
    if (monthlyAmount <= 0) continue;

    const customerEmail =
      typeof sub.customer === "string"
        ? null
        : (sub.customer as Stripe.Customer).email;

    leaks.push({
      id: generateLeakId(),
      type: "missing_payment_method",
      severity: "critical",
      title: `No payment method - ${formatCents(monthlyAmount)}/mo will fail`,
      description: `This active subscription has no valid payment method attached. The next billing attempt will fail, causing involuntary churn.`,
      customerEmail: customerEmail ? maskEmail(customerEmail) : null,
      customerId,
      subscriptionId: sub.id,
      monthlyImpact: monthlyAmount,
      annualImpact: monthlyAmount * 12,
      fixSuggestion:
        "This is urgent. Contact the customer immediately to add a payment method. Go to Stripe Dashboard → Customers → Select customer → Send 'Update payment method' email.",
      detectedAt: new Date().toISOString(),
      metadata: {
        hasSubDefault,
        customerPaymentMethodCount: customerMethods.length,
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
