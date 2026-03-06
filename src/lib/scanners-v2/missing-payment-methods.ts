import {
  NormalizedSubscription,
  NormalizedPaymentMethod,
  PLATFORM_LABELS,
} from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanMissingPaymentMethods(
  subscriptions: NormalizedSubscription[],
  paymentMethods: Map<string, NormalizedPaymentMethod[]>
): Leak[] {
  const leaks: Leak[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    // Check if subscription has a default payment method
    const hasSubDefault = !!sub.defaultPaymentMethod;

    // Check if customer has any valid payment methods
    const customerMethods = paymentMethods.get(sub.customerId) || [];
    const hasValidCard = customerMethods.some(
      (m) => m.type === "card" && (m.cardLast4 || m.cardBrand)
    );

    if (hasSubDefault || hasValidCard) continue;

    if (sub.monthlyAmountCents <= 0) continue;

    const platformLabel = PLATFORM_LABELS[sub.platform];

    leaks.push({
      id: generateLeakId(),
      type: "missing_payment_method",
      severity: "critical",
      title: `No payment method - ${formatCents(sub.monthlyAmountCents)}/mo will fail`,
      description: `This active subscription has no valid payment method attached. The next billing attempt will fail, causing involuntary churn.`,
      customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
      customerId: sub.customerId,
      subscriptionId: sub.id,
      monthlyImpact: sub.monthlyAmountCents,
      annualImpact: sub.monthlyAmountCents * 12,
      fixSuggestion: `This is urgent. Contact the customer immediately to add a payment method. Go to ${platformLabel} Dashboard → Customers → Send 'Update payment method' email.`,
      platformUrl: sub.platformUrl,
      stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
      detectedAt: new Date().toISOString(),
      metadata: {
        hasSubDefault,
        customerPaymentMethodCount: customerMethods.length,
        platform: sub.platform,
      },
    });
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
