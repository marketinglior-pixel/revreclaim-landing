import { NormalizedSubscription, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanExpiredCoupons(
  subscriptions: NormalizedSubscription[]
): Leak[] {
  const leaks: Leak[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    if (sub.discounts.length === 0) continue;

    for (const discount of sub.discounts) {
      // Check if the discount itself has ended on this subscription.
      // Note: redeemBy = coupon no longer available for NEW subscriptions (irrelevant here).
      // endsAt = when the discount stops applying to THIS subscription.
      const expiredAt = discount.endsAt;
      if (!expiredAt || expiredAt >= now) continue;

      const discountAmount = calculateDiscountAmount(
        discount.percentOff,
        discount.amountOffCents,
        sub.monthlyAmountCents
      );
      if (discountAmount <= 0) continue;

      const platformLabel = PLATFORM_LABELS[sub.platform];

      leaks.push({
        id: generateLeakId(),
        type: "expired_coupon",
        severity: discountAmount > 10000 ? "high" : "medium",
        title: `Expired coupon "${discount.couponName || discount.couponId}" still active`,
        description: `This coupon expired on ${new Date(expiredAt * 1000).toLocaleDateString()} but is still discounting this subscription by ${formatDiscount(discount.percentOff, discount.amountOffCents)}.`,
        customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        monthlyImpact: discountAmount,
        annualImpact: discountAmount * 12,
        recoveryRate: 0.8,
        isRecurring: true, // Discount applies every billing cycle until removed
        fixSuggestion: `Remove this expired coupon from the subscription in ${platformLabel} Dashboard → Subscriptions → Select subscription → Remove discount.`,
        platformUrl: sub.platformUrl,
        stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
        detectedAt: new Date().toISOString(),
        metadata: {
          couponId: discount.couponId,
          couponName: discount.couponName,
          expiredAt: new Date(expiredAt * 1000).toISOString(),
          platform: sub.platform,
        },
      });
    }
  }

  return leaks;
}

function calculateDiscountAmount(
  percentOff: number | null,
  amountOffCents: number | null,
  monthlyAmount: number
): number {
  if (percentOff) {
    return Math.round(monthlyAmount * (percentOff / 100));
  }
  if (amountOffCents) {
    return amountOffCents;
  }
  return 0;
}

function formatDiscount(
  percentOff: number | null,
  amountOffCents: number | null
): string {
  if (percentOff) return `${percentOff}%`;
  if (amountOffCents) return `$${(amountOffCents / 100).toFixed(2)}`;
  return "unknown amount";
}
