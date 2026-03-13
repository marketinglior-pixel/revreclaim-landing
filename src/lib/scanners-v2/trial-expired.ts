import { NormalizedSubscription, PLATFORM_LABELS } from "../platforms/types";
import { Leak } from "../types";
import { generateLeakId, maskEmail } from "../utils";
import { RISK_MULTIPLIERS } from "./risk-multipliers";

/**
 * Trial Expired Still Active Scanner
 *
 * Detects subscriptions where the trial period has ended but the subscription
 * is still in "trialing" status — meaning the customer hasn't been converted
 * to a paid plan and isn't being charged.
 *
 * This can happen when:
 * - Trial-to-paid conversion fails silently (missing payment method)
 * - Webhook handling doesn't process trial_end events
 * - Manual intervention was needed but never happened
 */
export function scanTrialExpired(
  subscriptions: NormalizedSubscription[]
): Leak[] {
  const leaks: Leak[] = [];
  const now = Math.floor(Date.now() / 1000);

  // Also check for subscriptions that are "active" but have a $0 amount
  // with a trial end date in the past (trial never converted to paid)

  for (const sub of subscriptions) {
    // Check 1: Subscriptions in "trialing" status where trial should have ended
    // The platform should have moved them to "active" or "past_due"
    // If they're still "trialing" past the trial end, something is wrong
    if (sub.status === "trialing") {
      // We don't have trialEnd directly in normalized data, but we can
      // infer from creation date + common trial lengths.
      // A subscription in "trialing" status for 45+ days is suspicious.
      const daysSinceCreation = Math.floor((now - sub.createdAt) / 86400);

      if (daysSinceCreation > 45) {
        const platformLabel = PLATFORM_LABELS[sub.platform];
        const riskAdjusted = Math.round(sub.monthlyAmountCents * RISK_MULTIPLIERS.trial_expired);

        leaks.push({
          id: generateLeakId(),
          type: "trial_expired",
          severity: sub.monthlyAmountCents > 5000 ? "high" : "medium",
          title: `Trial subscription active for ${daysSinceCreation} days - ${formatCents(riskAdjusted)}/mo potential`,
          description: `This subscription has been in "trialing" status for ${daysSinceCreation} days. Most trials are 7-30 days. The ${formatCents(sub.monthlyAmountCents)}/mo plan has a ${Math.round(RISK_MULTIPLIERS.trial_expired * 100)}% chance of converting at this stage.`,
          customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          monthlyImpact: riskAdjusted,
          annualImpact: riskAdjusted, // One-time: either converts or doesn't
          recoveryRate: 0.5,
          isRecurring: false,
          fixSuggestion: `Check this subscription in ${platformLabel} Dashboard. If the trial should have ended, either convert the customer to a paid plan or cancel the subscription.`,
          platformUrl: sub.platformUrl,
          stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
          detectedAt: new Date().toISOString(),
          metadata: {
            daysSinceCreation,
            monthlyAmountCents: sub.monthlyAmountCents,
            createdAt: new Date(sub.createdAt * 1000).toISOString(),
            hasPaymentMethod: sub.defaultPaymentMethod !== null,
            platform: sub.platform,
            rawMonthlyAmountCents: sub.monthlyAmountCents,
            riskMultiplier: RISK_MULTIPLIERS.trial_expired,
          },
        });
      }
    }

    // Check 2: Active subscriptions with $0 monthly amount
    // (could be a trial that "converted" but at $0)
    if (
      sub.status === "active" &&
      sub.monthlyAmountCents === 0 &&
      sub.items.length > 0
    ) {
      // Check if the subscription has items with non-zero prices
      // (meaning it should be charging but isn't)
      const expectedMonthly = sub.items.reduce((sum, item) => {
        return sum + item.unitAmountCents * item.quantity;
      }, 0);

      if (expectedMonthly > 0) {
        const platformLabel = PLATFORM_LABELS[sub.platform];
        const riskAdjusted = Math.round(expectedMonthly * RISK_MULTIPLIERS.trial_expired);

        leaks.push({
          id: generateLeakId(),
          type: "trial_expired",
          severity: expectedMonthly > 10000 ? "critical" : expectedMonthly > 3000 ? "high" : "medium",
          title: `Active subscription billing $0 despite having priced items`,
          description: `This subscription is active but billing $0/mo. The subscription items total ${formatCents(expectedMonthly)}/mo. A coupon, trial, or configuration issue may be preventing charges.`,
          customerEmail: sub.customerEmail ? maskEmail(sub.customerEmail) : null,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          monthlyImpact: riskAdjusted,
          annualImpact: riskAdjusted, // One-time: billing configuration fix
          recoveryRate: 0.5,
          isRecurring: false,
          fixSuggestion: `Review this subscription in ${platformLabel} Dashboard. Check for 100% discounts, trial configurations, or pricing overrides that are zeroing out the amount.`,
          platformUrl: sub.platformUrl,
          stripeUrl: sub.platform === "stripe" ? sub.platformUrl : undefined,
          detectedAt: new Date().toISOString(),
          metadata: {
            expectedMonthlyCents: expectedMonthly,
            actualMonthlyCents: 0,
            itemCount: sub.items.length,
            platform: sub.platform,
            rawMonthlyAmountCents: expectedMonthly,
            riskMultiplier: RISK_MULTIPLIERS.trial_expired,
          },
        });
      }
    }
  }

  return leaks;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
