import type { LeakType } from "../types";

export interface PlaybookStep {
  title: string;
  why: string;
  howRevReclaim: string;
  expectedOutcome: string;
}

export interface Playbook {
  id: string;
  title: string;
  subtitle: string;
  leakTypes: LeakType[];
  estimatedTime: string;
  expectedRecoveryRate: string;
  steps: PlaybookStep[];
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: "recover-failed-charges",
    title: "Recover Failed Charges",
    subtitle: "Turn failed payments into collected revenue",
    leakTypes: ["failed_payment", "expiring_card", "missing_payment_method"],
    estimatedTime: "15-30 minutes",
    expectedRecoveryRate: "40-60%",
    steps: [
      {
        title: "Triage by severity and amount",
        why: "A $899/mo enterprise failure needs a personal call. A $49/mo starter can get an automated email. Don't waste high-touch effort on low-value recoveries.",
        howRevReclaim:
          "Your scan report already sorts leaks by severity. Start with CRITICAL, work down.",
        expectedOutcome:
          "Clear priority list: which customers to call, which to email.",
      },
      {
        title: "Send dunning emails for automated recoveries",
        why: "70% of failed payments recover with a simple reminder email. Most founders never send one.",
        howRevReclaim:
          "Approve the 'Send Payment Reminder' action in your Recovery Actions queue. RevReclaim sends a branded email with a direct payment link.",
        expectedOutcome:
          "Expect 30-50% of recipients to update their card within 48 hours.",
      },
      {
        title: "Personal outreach for high-value accounts",
        why: "An enterprise customer who failed payment is worth a 5-minute call. Don't lose $10K+ ARR to an automated email.",
        howRevReclaim:
          "CRM enrichment (Pro plan) shows you which customers are still active. Prioritize those.",
        expectedOutcome:
          "Recovery rate jumps to 60-80% for personally contacted high-value accounts.",
      },
      {
        title: "Set up card expiration alerts",
        why: "Preventing the next failure is cheaper than recovering from it.",
        howRevReclaim:
          "Enable auto-scan (Watch plan) to get weekly alerts on cards expiring within 30 days.",
        expectedOutcome:
          "Reduce involuntary churn by 30-50% over 3 months.",
      },
    ],
  },
  {
    id: "clean-zombie-subscriptions",
    title: "Clean Up Zombie Subscriptions",
    subtitle: "Stop bleeding revenue on stuck and expired subscriptions",
    leakTypes: ["stuck_subscription", "trial_expired"],
    estimatedTime: "20-45 minutes",
    expectedRecoveryRate: "20-40%",
    steps: [
      {
        title: "Identify truly dead subscriptions",
        why: "A subscription stuck in 'past due' for 45 days with no login is dead. Stop counting it as potential revenue.",
        howRevReclaim:
          "CRM enrichment shows last activity date. If inactive 30+ days AND past_due 30+ days, it's gone.",
        expectedOutcome:
          "Honest MRR number. No phantom revenue inflating your dashboard.",
      },
      {
        title: "Cancel the dead ones",
        why: "Dead subscriptions consume support bandwidth, skew analytics, and sometimes trigger chargebacks.",
        howRevReclaim:
          "Approve 'Cancel Stuck Subscription' actions for confirmed dead accounts.",
        expectedOutcome:
          "Cleaner subscription list. Accurate churn metrics.",
      },
      {
        title: "Save the saveable ones",
        why: "Subscriptions past_due 7-21 days with recent activity are recoverable. These customers just have a card issue.",
        howRevReclaim:
          "Filter your leaks by stuck_subscription + CRM 'active'. These are your save targets.",
        expectedOutcome:
          "Recover 20-40% of stuck-but-active subscriptions with outreach.",
      },
      {
        title: "Fix trial conversion pipeline",
        why: "If trials are stuck in 'trialing' for 45+ days, your webhook or conversion flow is broken. This is a systemic issue.",
        howRevReclaim:
          "trial_expired leaks show exactly which subscriptions didn't convert. Check your billing platform's trial_end event handling.",
        expectedOutcome:
          "Fix the root cause to prevent future trial leaks.",
      },
    ],
  },
  {
    id: "fix-pricing-discounts",
    title: "Fix Pricing & Discounts",
    subtitle: "Reclaim revenue from coupon and pricing misconfigurations",
    leakTypes: [
      "legacy_pricing",
      "expired_coupon",
      "never_expiring_discount",
      "duplicate_subscription",
      "unbilled_overage",
    ],
    estimatedTime: "30-60 minutes",
    expectedRecoveryRate: "50-80%",
    steps: [
      {
        title: "Remove expired coupons immediately",
        why: "Every month an expired coupon stays active, you lose that discount amount. A $200/mo expired coupon = $2,400/yr gone.",
        howRevReclaim:
          "Approve 'Remove Expired Coupon' actions. RevReclaim removes the coupon via the billing platform API.",
        expectedOutcome:
          "Full-price billing starts on the next cycle. Send the customer a heads-up email.",
      },
      {
        title: "Audit 'forever' discounts",
        why: "Never-expiring discounts are usually misconfigured referral or promo codes. They compound forever.",
        howRevReclaim:
          "never_expiring_discount leaks show you every 'forever' coupon with its dollar impact.",
        expectedOutcome:
          "Replace 'forever' with time-limited discounts. Offer a loyalty discount as a bridge.",
      },
      {
        title: "Plan legacy pricing migration",
        why: "Customers on old pricing leave money on the table every month. But migrate wrong and they churn.",
        howRevReclaim:
          "legacy_pricing leaks show the gap between old and current pricing per customer. CRM enrichment helps you prioritize.",
        expectedOutcome:
          "Recover 30-50% of the pricing gap with proper migration + 30-day notice.",
      },
      {
        title: "Fix duplicate subscriptions and billing mismatches",
        why: "Double-billed customers will chargeback. Unbilled overages are literally free service.",
        howRevReclaim:
          "duplicate_subscription and unbilled_overage leaks identify exact customers and amounts.",
        expectedOutcome:
          "Cancel duplicates (refund the overlap). Fix quantity mismatches for immediate revenue recovery.",
      },
    ],
  },
];

/** Find which playbooks are relevant for a given set of leak types */
export function getRelevantPlaybooks(leakTypes: LeakType[]): Playbook[] {
  const typeSet = new Set(leakTypes);
  return PLAYBOOKS.filter((pb) => pb.leakTypes.some((lt) => typeSet.has(lt)));
}
