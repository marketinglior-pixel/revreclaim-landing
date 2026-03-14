import { NormalizedSubscription, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanNeverExpiringDiscounts(
  subscriptions: NormalizedSubscription[]
): Leak[] {
  const leaks: Leak[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    if (sub.discounts.length === 0) continue;

    for (const discount of sub.discounts) {
      // Check for "forever" duration with no end date on this subscription.
      // Note: redeemBy = coupon unavailable for NEW subs (irrelevant here).
      // Only endsAt matters — it means the discount will stop applying.
      if (discount.duration !== "forever") continue;
      if (discount.endsAt) continue;

      const discountAmount = calculateDiscountAmount(
        discount.percentOff,
        discount.amountOffCents,
        sub.monthlyAmountCents
      );
      if (discountAmount <= 0) continue;

      const discountPercent = discount.percentOff || 0;
      const amountOff = discount.amountOffCents || 0;
      const severity =
        discountPercent > 30 ? "high"
          : discountPercent > 10 ? "medium"
          : amountOff > 5000 ? "high"    // $50+ fixed discount
          : amountOff > 2000 ? "medium"  // $20+ fixed discount
          : "low";

      const platformLabel = PLATFORM_LABELS[sub.platform];

      leaks.push({
        id: generateLeakId(),
        type: "never_expiring_discount",
        severity,
        title: `Permanent discount "${discount.couponName || discount.couponId}" with no end date`,
        description: `This ${formatDiscount(discount.percentOff, discount.amountOffCents)} discount runs forever with no expiration. The customer is saving ${formatCents(discountAmount)}/mo indefinitely.`,
        customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        monthlyImpact: discountAmount,
        annualImpact: discountAmount * 12,
        recoveryRate: 0.4,
        isRecurring: true, // Discount continues indefinitely
        fixSuggestion: `Consider replacing this forever coupon with a time-limited discount. Go to ${platformLabel} Dashboard → Subscriptions → Remove current discount → Apply a new coupon with an end date.`,
        platformUrl: sub.platformUrl,
        stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
        detectedAt: new Date().toISOString(),
        metadata: {
          couponId: discount.couponId,
          couponName: discount.couponName,
          duration: discount.duration,
          percentOff: discount.percentOff,
          amountOff: discount.amountOffCents,
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

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
