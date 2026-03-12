import {
  NormalizedSubscription,
  NormalizedPaymentMethod,
  PLATFORM_LABELS,
} from "../platforms/types";
import { Leak, LeakSeverity } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanExpiringCards(
  subscriptions: NormalizedSubscription[],
  paymentMethods: Map<string, NormalizedPaymentMethod[]>
): Leak[] {
  const leaks: Leak[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;

    const methods = paymentMethods.get(sub.customerId) || [];

    // Check the default payment method first, then fall back to any card
    let cardToCheck: NormalizedPaymentMethod | undefined;

    if (
      sub.defaultPaymentMethod?.type === "card" &&
      sub.defaultPaymentMethod.cardExpMonth &&
      sub.defaultPaymentMethod.cardExpYear
    ) {
      cardToCheck = sub.defaultPaymentMethod;
    } else {
      cardToCheck = methods.find(
        (m) => m.type === "card" && m.cardExpMonth && m.cardExpYear
      );
    }

    if (!cardToCheck?.cardExpMonth || !cardToCheck?.cardExpYear) continue;

    const monthsUntilExpiry =
      (cardToCheck.cardExpYear - currentYear) * 12 +
      (cardToCheck.cardExpMonth - currentMonth);

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

    const platformLabel = PLATFORM_LABELS[sub.platform];

    leaks.push({
      id: generateLeakId(),
      type: "expiring_card",
      severity,
      title: `${urgency} - ${formatCents(sub.monthlyAmountCents)}/mo at risk`,
      description: `The card ending in ${cardToCheck.cardLast4} (${cardToCheck.cardBrand}) expires ${cardToCheck.cardExpMonth}/${cardToCheck.cardExpYear}. This subscription of ${formatCents(sub.monthlyAmountCents)}/mo will fail at the next billing cycle.`,
      customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
      customerId: sub.customerId,
      subscriptionId: sub.id,
      monthlyImpact: sub.monthlyAmountCents,
      annualImpact: sub.monthlyAmountCents * 12,
      recoveryRate: 0.5,
      fixSuggestion: `Contact the customer to update their payment method before it expires. ${platformLabel} Dashboard → Customers → Send update payment method email.`,
      platformUrl: sub.platformUrl,
      stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
      detectedAt: new Date().toISOString(),
      metadata: {
        cardLast4: cardToCheck.cardLast4,
        cardBrand: cardToCheck.cardBrand,
        expMonth: cardToCheck.cardExpMonth,
        expYear: cardToCheck.cardExpYear,
        monthsUntilExpiry,
        platform: sub.platform,
      },
    });
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
