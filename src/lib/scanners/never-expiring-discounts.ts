import Stripe from "stripe";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanNeverExpiringDiscounts(
  subscriptions: Stripe.Subscription[]
): Leak[] {
  const leaks: Leak[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    if (!sub.discounts || sub.discounts.length === 0) continue;

    for (const discountEntry of sub.discounts) {
      // discountEntry can be a string (ID) or expanded Discount object
      if (typeof discountEntry === "string") continue;
      const discount = discountEntry as Stripe.Discount;
      if (!discount.source?.coupon || typeof discount.source.coupon === "string") continue;

      const coupon = discount.source.coupon;

      // Check for "forever" duration coupons with no redeem_by
      if (coupon.duration === "forever" && !coupon.redeem_by) {
        const monthlyAmount = getSubscriptionMonthlyAmount(sub);
        const discountAmount = calculateDiscountAmount(coupon, monthlyAmount);

        if (discountAmount <= 0) continue;

        const discountPercent = coupon.percent_off || 0;
        const severity =
          discountPercent > 30
            ? "high"
            : discountPercent > 10
              ? "medium"
              : "low";

        const customerEmail =
          typeof sub.customer === "string"
            ? null
            : (sub.customer as Stripe.Customer).email;

        leaks.push({
          id: generateLeakId(),
          type: "never_expiring_discount",
          severity,
          title: `Permanent discount "${coupon.name || coupon.id}" with no end date`,
          description: `This ${formatDiscount(coupon)} discount runs forever with no expiration. The customer is saving ${formatCents(discountAmount)}/mo indefinitely.`,
          customerEmail: customerEmail ? maskEmail(customerEmail) : null,
          customerId:
            typeof sub.customer === "string"
              ? sub.customer
              : sub.customer.id,
          subscriptionId: sub.id,
          monthlyImpact: discountAmount,
          annualImpact: discountAmount * 12,
          fixSuggestion:
            "Consider replacing this forever coupon with a time-limited discount. Go to Stripe Dashboard → Subscriptions → Remove current discount → Apply a new coupon with an end date.",
          stripeUrl: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
          detectedAt: new Date().toISOString(),
          metadata: {
            couponId: coupon.id,
            couponName: coupon.name,
            duration: coupon.duration,
            percentOff: coupon.percent_off,
            amountOff: coupon.amount_off,
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
  if (coupon.amount_off) return `$${(coupon.amount_off / 100).toFixed(2)}`;
  return "unknown amount";
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
