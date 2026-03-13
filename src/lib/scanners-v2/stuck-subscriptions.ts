import { NormalizedSubscription, PLATFORM_LABELS } from "../platforms/types";
import { Leak, LeakSeverity } from "../types";
import { generateLeakId, maskEmail } from "../utils";

export function scanStuckSubscriptions(
  subscriptions: NormalizedSubscription[]
): Leak[] {
  const leaks: Leak[] = [];

  for (const sub of subscriptions) {
    let severity: LeakSeverity;
    let title: string;
    let description: string;
    let fixSuggestion: string;
    let recoveryRate: number;
    let monthlyImpactOverride: number | null = null;
    let annualImpactOverride: number | null = null;

    if (sub.monthlyAmountCents <= 0) continue;

    const platformLabel = PLATFORM_LABELS[sub.platform];
    const amountStr = formatCents(sub.monthlyAmountCents);

    switch (sub.status) {
      case "past_due":
        severity = "critical";
        title = `Past due subscription - ${amountStr}/mo uncollected`;
        description = `This subscription is past due. The customer's payment failed and hasn't been recovered. You're losing ${amountStr}/mo in uncollected revenue.`;
        fixSuggestion = `Contact the customer to update their payment method. Go to ${platformLabel} Dashboard → Subscriptions → Filter by 'Past due' → Retry payment or send reminder.`;
        recoveryRate = 0.4;
        break;

      case "unpaid":
        severity = "high";
        title = `Unpaid subscription - ${amountStr}/mo at risk`;
        description = `This subscription has exhausted all retry attempts and is marked as unpaid. The invoices remain open but no further automatic retries will occur.`;
        fixSuggestion = `Decide whether to cancel this subscription or contact the customer directly. Go to ${platformLabel} Dashboard → Subscriptions → Take action.`;
        recoveryRate = 0.2;
        break;

      case "incomplete":
        severity = "medium";
        title = `Incomplete subscription - ${amountStr}/mo pending`;
        description = `This subscription was created but the first payment was never completed. It may auto-cancel if not resolved.`;
        fixSuggestion = `Send the customer the hosted invoice link to complete their first payment. Check ${platformLabel} Dashboard → Subscriptions.`;
        recoveryRate = 0;
        monthlyImpactOverride = 0;
        annualImpactOverride = 0;
        break;

      case "incomplete_expired":
        severity = "low";
        title = `Expired incomplete subscription - ${amountStr}/mo lost`;
        description = `This subscription was never activated. The customer started signing up but never completed payment.`;
        fixSuggestion = `Consider reaching out to the customer to re-engage. Create a new subscription or send them a payment link.`;
        recoveryRate = 0;
        monthlyImpactOverride = 0;
        annualImpactOverride = 0;
        break;

      case "paused":
        if (!sub.pauseResumesAt) {
          severity = "medium";
          title = `Indefinitely paused subscription - ${amountStr}/mo on hold`;
          description = `This subscription is paused with no resume date set. Revenue of ${amountStr}/mo is on hold indefinitely.`;
          fixSuggestion = `Review if this pause is still needed. Set a resume date or contact the customer. Go to ${platformLabel} Dashboard → Subscriptions → Resume.`;
          recoveryRate = 0.6;
        } else {
          continue; // Has a resume date, not stuck
        }
        break;

      default:
        continue; // Active, trialing, or canceled
    }

    leaks.push({
      id: generateLeakId(),
      type: "stuck_subscription",
      severity,
      title,
      description,
      customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
      customerId: sub.customerId,
      subscriptionId: sub.id,
      monthlyImpact: monthlyImpactOverride !== null ? monthlyImpactOverride : sub.monthlyAmountCents,
      annualImpact: annualImpactOverride !== null ? annualImpactOverride : sub.monthlyAmountCents * 12,
      recoveryRate,
      isRecurring: true, // Revenue lost every month until resolved
      fixSuggestion,
      platformUrl: sub.platformUrl,
      stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
      detectedAt: new Date().toISOString(),
      metadata: {
        subscriptionStatus: sub.status,
        canceledAt: sub.canceledAt,
        pauseResumesAt: sub.pauseResumesAt,
        platform: sub.platform,
      },
    });
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
