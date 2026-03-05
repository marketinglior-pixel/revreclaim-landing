import Stripe from "stripe";
import { Leak, LeakSeverity } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanGhostSubscriptions(
  subscriptions: Stripe.Subscription[]
): Leak[] {
  const leaks: Leak[] = [];

  for (const sub of subscriptions) {
    let severity: LeakSeverity;
    let title: string;
    let description: string;
    let fixSuggestion: string;

    const monthlyAmount = getSubscriptionMonthlyAmount(sub);
    if (monthlyAmount <= 0) continue;

    const customerEmail =
      typeof sub.customer === "string"
        ? null
        : (sub.customer as Stripe.Customer).email;

    const customerId =
      typeof sub.customer === "string"
        ? sub.customer
        : sub.customer.id;

    switch (sub.status) {
      case "past_due":
        severity = "critical";
        title = `Past due subscription - ${formatCents(monthlyAmount)}/mo uncollected`;
        description = `This subscription is past due. The customer's payment failed and hasn't been recovered. You're losing ${formatCents(monthlyAmount)}/mo in uncollected revenue.`;
        fixSuggestion =
          "Contact the customer to update their payment method. Go to Stripe Dashboard → Subscriptions → Filter by 'Past due' → Select subscription → Retry payment or send reminder.";
        break;

      case "unpaid":
        severity = "high";
        title = `Unpaid subscription - ${formatCents(monthlyAmount)}/mo at risk`;
        description = `This subscription has exhausted all retry attempts and is marked as unpaid. The invoices remain open but no further automatic retries will occur.`;
        fixSuggestion =
          "Decide whether to cancel this subscription or contact the customer directly. Go to Stripe Dashboard → Subscriptions → Filter by 'Unpaid' → Take action.";
        break;

      case "incomplete":
        severity = "medium";
        title = `Incomplete subscription - ${formatCents(monthlyAmount)}/mo pending`;
        description = `This subscription was created but the first payment was never completed. It will auto-cancel after 23 hours if not resolved.`;
        fixSuggestion =
          "Send the customer the hosted invoice link to complete their first payment. Check Stripe Dashboard → Subscriptions → Filter by 'Incomplete'.";
        break;

      case "incomplete_expired":
        severity = "low";
        title = `Expired incomplete subscription - ${formatCents(monthlyAmount)}/mo lost`;
        description = `This subscription was never activated. The customer started signing up but never completed payment. It has automatically expired.`;
        fixSuggestion =
          "Consider reaching out to the customer to re-engage. Create a new subscription or send them a payment link.";
        break;

      case "paused":
        if (!sub.pause_collection?.resumes_at) {
          severity = "medium";
          title = `Indefinitely paused subscription - ${formatCents(monthlyAmount)}/mo on hold`;
          description = `This subscription is paused with no resume date set. Revenue of ${formatCents(monthlyAmount)}/mo is on hold indefinitely.`;
          fixSuggestion =
            "Review if this pause is still needed. Set a resume date or contact the customer. Go to Stripe Dashboard → Subscriptions → Select subscription → Resume collection.";
        } else {
          continue; // Has a resume date, not a ghost
        }
        break;

      default:
        continue; // Active, trialing, or canceled with valid reason
    }

    leaks.push({
      id: generateLeakId(),
      type: "ghost_subscription",
      severity,
      title,
      description,
      customerEmail: customerEmail ? maskEmail(customerEmail) : null,
      customerId,
      subscriptionId: sub.id,
      monthlyImpact: monthlyAmount,
      annualImpact: monthlyAmount * 12,
      fixSuggestion,
      stripeUrl: `https://dashboard.stripe.com/subscriptions/${sub.id}`,
      detectedAt: new Date().toISOString(),
      metadata: {
        subscriptionStatus: sub.status,
        canceledAt: sub.canceled_at,
        pauseResumesAt: sub.pause_collection?.resumes_at,
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
