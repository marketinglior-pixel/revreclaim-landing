import Stripe from "stripe";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanExpiredCoupons(
  subscriptions: Stripe.Subscription[]
): Leak[] {
  const leaks: Leak[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    if (!sub.discounts || sub.discounts.length === 0) continue;

    for (const discountEntry of sub.discounts) {
      // discountEntry can be a string (ID) or expanded Discount object
      if (typeof discountEntry === "string") continue;
      const discount = discountEntry as Stripe.Discount;
      if (!discount.source?.coupon || typeof discount.source.coupon === "string") continue;

      const coupon = discount.source.coupon;

      // Check if coupon has a redeem_by date that's in the past
      if (coupon.redeem_by && coupon.redeem_by < now) {
        // This coupon's redemption window expired, but it's still applied
        const monthlyAmount = getSubscriptionMonthlyAmount(sub);
        const discountAmount = calculateDiscountAmount(coupon, monthlyAmount);

        if (discountAmount <= 0) continue;

        const customerEmail =
          typeof sub.customer === "string"
            ? null
            : (sub.customer as Stripe.Customer).email;

        leaks.push({
          id: generateLeakId(),
          type: "expired_coupon",
          severity: discountAmount > 10000 ? "high" : "medium",
          title: `Expired coupon "${coupon.name || coupon.id}" still active`,
          description: `This coupon expired on ${new Date(coupon.redeem_by * 1000).toLocaleDateString()} but is still discounting this subscription by ${formatDiscount(coupon)}.`,
          customerEmail: customerEmail ? maskEmail(customerEmail) : null,
          customerId:
            typeof sub.customer === "string"
              ? sub.customer
              : sub.customer.id,
          subscriptionId: sub.id,
          monthlyImpact: discountAmount,
          annualImpact: discountAmount * 12,
          recoveryRate: 0.8, // High — removing expired coupon is safe, customers rarely notice
          fixSuggestion:
            "Remove this expired coupon from the subscription in Stripe Dashboard → Subscriptions → Select subscription → Remove discount.",
          stripeUrl: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
          detectedAt: new Date().toISOString(),
          metadata: {
            couponId: coupon.id,
            couponName: coupon.name,
            expiredAt: new Date(coupon.redeem_by * 1000).toISOString(),
          },
        });
      }
    }
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

function calculateDiscountAmount(
  coupon: Stripe.Coupon,
  monthlyAmount: number
): number {
  if (coupon.percent_off) {
    return Math.round(monthlyAmount * (coupon.percent_off / 100));
  }
  if (coupon.amount_off) {
    return coupon.amount_off;
  }
  return 0;
}

function formatDiscount(coupon: Stripe.Coupon): string {
  if (coupon.percent_off) return `${coupon.percent_off}%`;
  if (coupon.amount_off)
    return `$${(coupon.amount_off / 100).toFixed(2)}`;
  return "unknown amount";
}
