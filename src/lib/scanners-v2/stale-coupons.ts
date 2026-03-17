import { NormalizedSubscription, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";
import { RISK_MULTIPLIERS } from "./risk-multipliers";

/**
 * Promotional keywords that suggest a coupon was meant to be temporary.
 * Case-insensitive matching.
 */
const PROMO_KEYWORDS = [
  "bf", "black friday", "launch", "beta", "promo", "early",
  "welcome", "founder", "holiday", "cyber", "summer", "winter",
  "spring", "fall", "intro", "trial", "onboarding", "appsumo",
  "ph", "product hunt", "special", "limited",
];

const SIX_MONTHS_SECONDS = 86400 * 180;

/**
 * Detect coupons that are still technically valid but likely no longer needed.
 *
 * Different from existing scanners:
 * - expired_coupon: catches coupons where endsAt < now (already expired)
 * - never_expiring_discount: catches ALL duration="forever" (too broad)
 * - stale_coupon: catches coupons that SHOULD be reviewed — promotional
 *   discounts still running long after the promotion ended
 *
 * Criteria (any match triggers):
 * 1. duration "forever" + percentOff >= 30 + sub created >6 months ago
 * 2. couponName matches promo keywords (case-insensitive)
 * 3. percentOff >= 40 on any active sub (aggressive discount)
 */
export function scanStaleCoupons(
  subscriptions: NormalizedSubscription[]
): Leak[] {
  const leaks: Leak[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    if (sub.discounts.length === 0) continue;

    for (const discount of sub.discounts) {
      // Skip if this discount already expired (caught by expired_coupon scanner)
      if (discount.endsAt && discount.endsAt < now) continue;

      // Skip non-forever discounts that have a defined end — they'll expire naturally
      if (discount.duration !== "forever" && discount.endsAt) continue;

      const discountAmount = calculateDiscountAmount(
        discount.percentOff,
        discount.amountOffCents,
        sub.monthlyAmountCents
      );
      if (discountAmount <= 0) continue;

      const isStale = checkIfStale(discount, sub, now);
      if (!isStale) continue;

      const riskAdjusted = Math.round(discountAmount * RISK_MULTIPLIERS.stale_coupon);
      const platformLabel = PLATFORM_LABELS[sub.platform];
      const reason = getStaleReason(discount, sub, now);

      leaks.push({
        id: generateLeakId(),
        type: "stale_coupon",
        severity: riskAdjusted > 10000 ? "high" : "medium",
        title: `Coupon "${discount.couponName || discount.couponId}" may no longer be needed`,
        description: `${reason} This discount is costing ${formatDiscount(discount.percentOff, discount.amountOffCents)} per month. Review whether it's still intentional.`,
        customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
        customerId: sub.customerId,
        subscriptionId: sub.id,
        monthlyImpact: riskAdjusted,
        annualImpact: riskAdjusted * 12,
        recoveryRate: 0.5, // lower than expired — may be intentional
        isRecurring: true,
        fixSuggestion: `Review this coupon in ${platformLabel} Dashboard. If it was a promotional discount that's no longer needed, remove it from the subscription.`,
        platformUrl: sub.platformUrl,
        stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
        detectedAt: new Date().toISOString(),
        metadata: {
          couponId: discount.couponId,
          couponName: discount.couponName,
          duration: discount.duration,
          percentOff: discount.percentOff,
          amountOffCents: discount.amountOffCents,
          rawMonthlyAmountCents: discountAmount,
          riskMultiplier: RISK_MULTIPLIERS.stale_coupon,
          staleReason: reason,
          subscriptionAgeMonths: Math.round((now - sub.createdAt) / (86400 * 30)),
          platform: sub.platform,
        },
      });
    }
  }

  return leaks;
}

function checkIfStale(
  discount: NormalizedSubscription["discounts"][0],
  sub: NormalizedSubscription,
  now: number
): boolean {
  const subAge = now - sub.createdAt;
  const couponName = (discount.couponName || "").toLowerCase();

  // Criterion 1: forever discount + high percentage + old subscription
  if (
    discount.duration === "forever" &&
    discount.percentOff !== null &&
    discount.percentOff >= 30 &&
    subAge > SIX_MONTHS_SECONDS
  ) {
    return true;
  }

  // Criterion 2: coupon name matches promotional keywords
  if (couponName && PROMO_KEYWORDS.some((kw) => couponName.includes(kw))) {
    // Only flag if sub is old enough that the promo should be over
    if (subAge > SIX_MONTHS_SECONDS) {
      return true;
    }
  }

  // Criterion 3: very aggressive discount (>40%) on any active sub
  if (discount.percentOff !== null && discount.percentOff >= 40) {
    return true;
  }

  return false;
}

function getStaleReason(
  discount: NormalizedSubscription["discounts"][0],
  sub: NormalizedSubscription,
  now: number
): string {
  const subAgeMonths = Math.round((now - sub.createdAt) / (86400 * 30));
  const couponName = (discount.couponName || "").toLowerCase();

  if (couponName && PROMO_KEYWORDS.some((kw) => couponName.includes(kw))) {
    return `Coupon "${discount.couponName}" looks like a promotional discount that's been running for ${subAgeMonths} months.`;
  }

  if (discount.percentOff !== null && discount.percentOff >= 40) {
    return `A ${discount.percentOff}% discount has been active for ${subAgeMonths} months.`;
  }

  return `This ${discount.percentOff}% forever discount has been running for ${subAgeMonths} months on this subscription.`;
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
