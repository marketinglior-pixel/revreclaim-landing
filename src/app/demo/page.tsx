"use client";

import { ScanReport } from "@/lib/types";
import type { LeakEnrichment } from "@/lib/enrichment/types";
import { computeBillingHealth } from "@/lib/billing-health";
import ReportHeader from "@/components/report/ReportHeader";
import ReportSummary from "@/components/report/ReportSummary";
import BillingHealthInsights from "@/components/report/BillingHealthInsights";
import LeakCategoryChart from "@/components/report/LeakCategoryChart";
import LeakTable from "@/components/report/LeakTable";
import ReportCTA from "@/components/report/ReportCTA";
import RecoveryBanner from "@/components/report/RecoveryBanner";
import QuickWins from "@/components/report/QuickWins";
import AgentSimulation from "@/components/report/AgentSimulation";

// ──────────────────────────────────────────────────────────────
// DEMO SCENARIO: ScaleFlow — A B2B SaaS doing $187K MRR
// They ran RevReclaim and found $5,728/mo ($68,736/yr) in leaks
// across 27 issues. Health score: 56 ("Needs Attention").
// ──────────────────────────────────────────────────────────────

const DEMO_REPORT: ScanReport = {
  id: "demo-scaleflow-2026",
  scannedAt: new Date().toISOString(),
  summary: {
    mrrAtRisk: 311500,        // $3,115/mo (weighted by recovery rates)
    rawMrrAtRisk: 572800,     // $5,728/mo (unweighted max)
    leaksFound: 27,
    recoveryPotential: 2322960, // $23,230/yr (weighted)
    totalSubscriptions: 312,
    totalCustomers: 287,
    totalMRR: 18700000,      // $187,000/mo (active only)
    trialingMRR: 0,
    healthScore: 56,
  },
  categories: [
    {
      type: "expired_coupon",
      label: "Expired Coupons",
      count: 3,
      totalMonthlyImpact: 75000, // $750/mo
      percentage: 15.5,
    },
    {
      type: "legacy_pricing",
      label: "Legacy Pricing",
      count: 2,
      totalMonthlyImpact: 32000, // $320/mo
      percentage: 6.6,
    },
    {
      type: "never_expiring_discount",
      label: "Never-Expiring Discounts",
      count: 1,
      totalMonthlyImpact: 5000, // $50/mo
      percentage: 1.0,
    },
    {
      type: "ghost_subscription",
      label: "Stuck Subscriptions",
      count: 4,
      totalMonthlyImpact: 89700, // $897/mo
      percentage: 18.6,
    },
    {
      type: "expiring_card",
      label: "Expiring Cards",
      count: 5,
      totalMonthlyImpact: 54200, // $542/mo
      percentage: 11.2,
    },
    {
      type: "failed_payment",
      label: "Uncollected Revenue",
      count: 6,
      totalMonthlyImpact: 214900, // $2,149/mo
      percentage: 44.5,
    },
    {
      type: "missing_payment_method",
      label: "Missing Payment Methods",
      count: 2,
      totalMonthlyImpact: 12200, // $122/mo
      percentage: 2.1,
    },
    {
      type: "unbilled_overage",
      label: "Unbilled Overages",
      count: 1,
      totalMonthlyImpact: 45000, // $450/mo
      percentage: 7.7,
    },
    {
      type: "trial_expired",
      label: "Expired Trials",
      count: 1,
      totalMonthlyImpact: 19900, // $199/mo
      percentage: 3.4,
    },
    {
      type: "duplicate_subscription",
      label: "Duplicate Subscriptions",
      count: 1,
      totalMonthlyImpact: 24900, // $249/mo
      percentage: 4.3,
    },
  ],
  leaks: [
    // ── CRITICAL: Failed Payments ──
    {
      id: "leak-001",
      type: "failed_payment",
      severity: "critical",
      title: "Enterprise plan payment failed — 18 days overdue",
      description:
        "Invoice #INV-38291 for the Enterprise plan ($899/mo) has been in 'past_due' status for 18 days. Three automatic retry attempts have failed. The card on file (Visa ending 4242) was declined with 'insufficient_funds'. This customer has been with you for 14 months and represents significant ARR.",
      customerEmail: "f***@techcorp.io",
      customerId: "cus_R8kT9mNp2xQ",
      subscriptionId: "sub_1NvB7kL9mQ",
      monthlyImpact: 89900, // $899/mo
      annualImpact: 89900,
      recoveryRate: 0.6,
      fixSuggestion:
        "Contact the customer immediately via email and phone. Offer to update their payment method. Consider a 3-day grace period before pausing the account. This is your highest-value at-risk customer.",
      stripeUrl: "https://dashboard.stripe.com/invoices/in_1NvB7kL9mQ",
      detectedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-002",
      type: "failed_payment",
      severity: "critical",
      title: "Pro plan invoice unpaid for 12 days",
      description:
        "Invoice #INV-37845 ($499/mo Pro plan) failed 12 days ago. Card ending 8371 (Mastercard) returned 'card_declined'. Customer has 43 active team members. High churn risk if not resolved quickly.",
      customerEmail: "a***@acmecorp.com",
      customerId: "cus_K4nM8pLq3wR",
      subscriptionId: "sub_2MwC8jK0nR",
      monthlyImpact: 49900,
      annualImpact: 49900,
      recoveryRate: 0.6,
      fixSuggestion:
        "Send a personalized email from the founder. Include a direct payment link. This customer has high team usage — they're unlikely to intentionally churn.",
      stripeUrl: "https://dashboard.stripe.com/invoices/in_2MwC8jK0nR",
      detectedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-003",
      type: "failed_payment",
      severity: "critical",
      title: "Growth plan payment declined twice",
      description:
        "Invoice #INV-38102 ($349/mo Growth) failed on initial attempt and first retry. Card ending 5519 (Visa) — 'expired_card'. Next retry in 2 days, but card expiration won't change.",
      customerEmail: "j***@startupxyz.io",
      customerId: "cus_P2qR6mNk9xS",
      subscriptionId: "sub_3NxD9kL1mS",
      monthlyImpact: 34900,
      annualImpact: 34900,
      recoveryRate: 0.6,
      fixSuggestion:
        "This customer's card is expired — automatic retries will continue to fail. Send an immediate card update request email with a Stripe-hosted payment link.",
      stripeUrl: "https://dashboard.stripe.com/invoices/in_3NxD9kL1mS",
      detectedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-004",
      type: "failed_payment",
      severity: "high",
      title: "Team plan — bank transfer payment delayed",
      description:
        "Invoice #INV-38204 ($199/mo Team) is 8 days overdue. Payment method is ACH bank transfer. Bank returned 'insufficient_funds'. Customer has been active for 6 months.",
      customerEmail: "m***@dataflow.com",
      customerId: "cus_L5nN7pMq4xT",
      subscriptionId: "sub_4OyE0lM2nT",
      monthlyImpact: 19900,
      annualImpact: 19900,
      recoveryRate: 0.6,
      fixSuggestion:
        "Send a payment reminder. For ACH failures, suggest switching to card payment for more reliable billing. Offer to help update payment method.",
      stripeUrl: "https://dashboard.stripe.com/invoices/in_4OyE0lM2nT",
      detectedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-005",
      type: "failed_payment",
      severity: "medium",
      title: "Starter plan payment pending retry",
      description:
        "Invoice #INV-38310 ($99/mo Starter) failed initial charge 3 days ago. Card ending 1234 (Amex) — 'do_not_honor'. First automatic retry scheduled for tomorrow.",
      customerEmail: "s***@smallco.io",
      customerId: "cus_M6oO8qNr5yU",
      subscriptionId: "sub_5PzF1mN3oU",
      monthlyImpact: 9900,
      annualImpact: 9900,
      recoveryRate: 0.6,
      fixSuggestion:
        "Monitor the automatic retry. If it fails again, send a friendly payment update reminder. 'Do not honor' often resolves on retry with the same card.",
      stripeUrl: "https://dashboard.stripe.com/invoices/in_5PzF1mN3oU",
      detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-006",
      type: "failed_payment",
      severity: "medium",
      title: "Starter plan — card authentication required",
      description:
        "Invoice #INV-38356 ($99/mo Starter) requires 3D Secure authentication. Payment is in 'requires_action' state for 5 days. Customer hasn't completed authentication.",
      customerEmail: "r***@apihub.dev",
      customerId: "cus_N7pP9rOs6zV",
      subscriptionId: "sub_6QaG2nO4pV",
      monthlyImpact: 9900,
      annualImpact: 9900,
      recoveryRate: 0.6,
      fixSuggestion:
        "Send the customer a direct link to complete 3D Secure authentication. Include clear instructions. European customers often hit this with SCA requirements.",
      stripeUrl: "https://dashboard.stripe.com/invoices/in_6QaG2nO4pV",
      detectedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      metadata: {},
    },

    // ── CRITICAL: Ghost Subscriptions ──
    {
      id: "leak-007",
      type: "ghost_subscription",
      severity: "critical",
      title: "Enterprise sub in 'past_due' for 45 days — likely churned",
      description:
        "Subscription sub_8ScI4pQ6rX has been in 'past_due' status for 45 days with no successful payment. All 4 retry attempts failed. Customer hasn't logged in for 38 days. This is effectively a ghost subscription consuming resources.",
      customerEmail: "d***@bigcorp.com",
      customerId: "cus_O8qQ0sQr7aW",
      subscriptionId: "sub_8ScI4pQ6rX",
      monthlyImpact: 34900,
      annualImpact: 418800,
      recoveryRate: 0.4,
      fixSuggestion:
        "This subscription should be canceled or paused. The customer has effectively churned. Cancel the subscription and send a win-back campaign in 30 days.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_8ScI4pQ6rX",
      detectedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-008",
      type: "ghost_subscription",
      severity: "high",
      title: "Pro sub 'past_due' 22 days — no login in 3 weeks",
      description:
        "Subscription for Pro plan ($249/mo) stuck in 'past_due' for 22 days. Customer's last API call was 19 days ago. Payment method expired. Subscription is consuming a Pro seat license.",
      customerEmail: "k***@medtech.io",
      customerId: "cus_P9rR1tRs8bX",
      subscriptionId: "sub_9TdJ5qR7sY",
      monthlyImpact: 24900,
      annualImpact: 298800,
      recoveryRate: 0.4,
      fixSuggestion:
        "Reach out to the customer personally. If no response in 7 days, pause the subscription to stop resource allocation. Keep the account data for 90 days in case they return.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_9TdJ5qR7sY",
      detectedAt: new Date(Date.now() - 22 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-009",
      type: "ghost_subscription",
      severity: "high",
      title: "Growth plan ghost — 30 days past due",
      description:
        "Subscription sub_0UeK6rS8tZ ($199/mo Growth) has been past due for 30 days. Customer email bounces. No login activity in 28 days. All automatic retries exhausted.",
      customerEmail: "t***@defunct-startup.com",
      customerId: "cus_Q0sS2uSt9cY",
      subscriptionId: "sub_0UeK6rS8tZ",
      monthlyImpact: 19900,
      annualImpact: 238800,
      recoveryRate: 0.4,
      fixSuggestion:
        "Email is bouncing — this company may have shut down. Cancel the subscription immediately. Mark as 'churned - company closed' for your records.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_0UeK6rS8tZ",
      detectedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-010",
      type: "ghost_subscription",
      severity: "medium",
      title: "Starter plan — 14 days past due, low usage",
      description:
        "Subscription sub_1VfL7sT9uA ($99/mo Starter) past due for 14 days. Customer had very low API usage (3 calls last month). Likely forgotten subscription.",
      customerEmail: "p***@freelancer.com",
      customerId: "cus_R1tT3vTu0dZ",
      subscriptionId: "sub_1VfL7sT9uA",
      monthlyImpact: 9900,
      annualImpact: 118800,
      recoveryRate: 0.4,
      fixSuggestion:
        "Send a friendly 'are you still using us?' email. If no response, cancel and offer a free month to come back.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_1VfL7sT9uA",
      detectedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      metadata: {},
    },

    // ── HIGH: Expired Coupons ──
    {
      id: "leak-011",
      type: "expired_coupon",
      severity: "high",
      title: "50% launch discount expired 4 months ago — still active",
      description:
        "Customer is paying $199/mo instead of $399/mo with coupon 'LAUNCH50' that expired on Nov 1, 2025. The coupon was set to expire after the promo period, but Stripe continued applying it to this subscription because it was applied before expiration.",
      customerEmail: "c***@cloudapp.io",
      customerId: "cus_S2uU4wUv1eA",
      subscriptionId: "sub_2WgM8tU0vB",
      monthlyImpact: 20000,
      annualImpact: 240000,
      recoveryRate: 0.8,
      fixSuggestion:
        "Remove the expired coupon from the subscription. Send the customer a heads-up email: 'Your promotional rate has ended. Your plan will renew at the standard rate of $399/mo.' Offer a 20% loyalty discount if needed for retention.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_2WgM8tU0vB",
      detectedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-012",
      type: "expired_coupon",
      severity: "high",
      title: "Beta tester 40% discount — expired 6 months ago",
      description:
        "Coupon 'BETA40' expired June 2025 but is still active on this $499/mo Enterprise subscription. Customer is paying $299/mo. This was meant as a 6-month beta incentive.",
      customerEmail: "n***@saasplatform.com",
      customerId: "cus_T3vV5xVw2fB",
      subscriptionId: "sub_3XhN9uV1wC",
      monthlyImpact: 20000,
      annualImpact: 240000,
      recoveryRate: 0.8,
      fixSuggestion:
        "Contact the customer before removing the discount. Thank them for being a beta tester. Offer a 15% 'Early Adopter' discount as a bridge to full pricing.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_3XhN9uV1wC",
      detectedAt: new Date(Date.now() - 180 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-013",
      type: "expired_coupon",
      severity: "high",
      title: "Conference promo 30% off — expired 2 months ago",
      description:
        "Coupon 'SAASCONF30' from a conference promo expired Jan 2026. Customer paying $139/mo instead of $199/mo on Growth plan.",
      customerEmail: "b***@marketingco.io",
      customerId: "cus_U4wW6yWx3gC",
      subscriptionId: "sub_4YiO0vW2xD",
      monthlyImpact: 6000,
      annualImpact: 72000,
      recoveryRate: 0.8,
      fixSuggestion:
        "Remove the expired promo code. Notify the customer their conference discount has ended. Standard pricing resumes next billing cycle.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_4YiO0vW2xD",
      detectedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-014",
      type: "expired_coupon",
      severity: "medium",
      title: "Referral 25% discount — should have been one-time",
      description:
        "Coupon 'REFER25' was meant for first 3 months only but was applied as 'forever' duration on this $199/mo subscription. Customer has been getting 25% off for 9 months.",
      customerEmail: "l***@devtools.co",
      customerId: "cus_V5xX7zXy4hD",
      subscriptionId: "sub_5ZjP1wX3yE",
      monthlyImpact: 5000,
      annualImpact: 60000,
      recoveryRate: 0.8,
      fixSuggestion:
        "This is a coupon configuration error. Remove the coupon from this subscription. Going forward, set referral coupons to 'repeating' duration with a 3-month limit.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_5ZjP1wX3yE",
      detectedAt: new Date(Date.now() - 270 * 86400000).toISOString(),
      metadata: {},
    },

    // ── HIGH: Expiring Cards ──
    {
      id: "leak-015",
      type: "expiring_card",
      severity: "high",
      title: "Enterprise customer card expires this month",
      description:
        "Card ending 7891 (Visa) on the $899/mo Enterprise subscription expires 03/2026. Next billing date is March 15. If the card isn't updated, the payment will fail.",
      customerEmail: "e***@enterprise.com",
      customerId: "cus_W6yY8aYz5iE",
      subscriptionId: "sub_6AkQ2xY4zF",
      monthlyImpact: 14200,
      annualImpact: 170400,
      recoveryRate: 0.5,
      fixSuggestion:
        "Send an urgent card update reminder. Stripe may auto-update via card network updater, but don't rely on it for this high-value account. Personal outreach recommended.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_W6yY8aYz5iE",
      detectedAt: new Date().toISOString(),
      metadata: {},
    },
    {
      id: "leak-016",
      type: "expiring_card",
      severity: "high",
      title: "Pro plan card expires next month",
      description:
        "Card ending 3456 (Mastercard) on $349/mo Pro plan expires 04/2026. Customer has been with you for 11 months. High lifetime value at risk.",
      customerEmail: "h***@analytics.io",
      customerId: "cus_X7zZ9bZa6jF",
      subscriptionId: "sub_7BlR3yZ5aG",
      monthlyImpact: 11200,
      annualImpact: 134400,
      recoveryRate: 0.5,
      fixSuggestion:
        "Send a proactive card update email. Mention the exact last 4 digits so they know which card to update. Include a direct link to update payment method.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_X7zZ9bZa6jF",
      detectedAt: new Date().toISOString(),
      metadata: {},
    },
    {
      id: "leak-017",
      type: "expiring_card",
      severity: "medium",
      title: "Growth plan card expiring in 2 months",
      description:
        "Card ending 6789 (Visa) on $199/mo Growth plan expires 05/2026. Early warning — plenty of time to get the customer to update.",
      customerEmail: "w***@webdev.co",
      customerId: "cus_Y8aA0cAb7kG",
      subscriptionId: "sub_8CmS4zA6bH",
      monthlyImpact: 9900,
      annualImpact: 118800,
      recoveryRate: 0.5,
      fixSuggestion:
        "Queue a card expiration reminder email for 30 days before expiry. Stripe's Smart Retries may handle this automatically, but proactive communication reduces churn.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_Y8aA0cAb7kG",
      detectedAt: new Date().toISOString(),
      metadata: {},
    },
    {
      id: "leak-018",
      type: "expiring_card",
      severity: "medium",
      title: "Two Starter plan cards expiring soon",
      description:
        "Cards on 2 Starter subscriptions ($99/mo each) expire within the next 2 months. Combined risk of $198/mo if both fail.",
      customerEmail: "g***@indie.dev",
      customerId: "cus_Z9bB1dBc8lH",
      subscriptionId: "sub_9DnT5aB7cI",
      monthlyImpact: 9900,
      annualImpact: 118800,
      recoveryRate: 0.5,
      fixSuggestion:
        "Send batch card update reminders. Consider enabling Stripe's automatic card updater if not already enabled.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_Z9bB1dBc8lH",
      detectedAt: new Date().toISOString(),
      metadata: {},
    },
    {
      id: "leak-019",
      type: "expiring_card",
      severity: "low",
      title: "Starter plan card expires in 3 months",
      description:
        "Card ending 2345 on $99/mo subscription expires 06/2026. Low urgency — Stripe auto-updater will likely handle this.",
      customerEmail: "t***@startup.co",
      customerId: "cus_A0cC2eCd9mI",
      subscriptionId: "sub_0EoU6bC8dJ",
      monthlyImpact: 9000,
      annualImpact: 108000,
      recoveryRate: 0.5,
      fixSuggestion:
        "No immediate action needed. Monitor and send a reminder 30 days before expiry.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_A0cC2eCd9mI",
      detectedAt: new Date().toISOString(),
      metadata: {},
    },

    // ── HIGH: Legacy Pricing ──
    {
      id: "leak-020",
      type: "legacy_pricing",
      severity: "high",
      title: "Customer on 2024 pricing — 38% below current rate",
      description:
        "This customer signed up 14 months ago at $149/mo (2024 Growth pricing). Current Growth plan is $199/mo. They're paying 25% less than new customers. You raised prices 8 months ago but this subscription was never migrated.",
      customerEmail: "r***@bigco.com",
      customerId: "cus_B1dD3fDe0nJ",
      subscriptionId: "sub_1FpV7cD9eK",
      monthlyImpact: 20000,
      annualImpact: 240000,
      recoveryRate: 0.3,
      fixSuggestion:
        "Schedule a pricing migration. Best approach: Email the customer about the price change, give 30 days notice, offer to lock in a 10% 'loyalty discount' on the new price ($179/mo). Most customers accept when framed positively.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_1FpV7cD9eK",
      detectedAt: new Date(Date.now() - 240 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-021",
      type: "legacy_pricing",
      severity: "medium",
      title: "Old Team plan pricing — $50/mo below current",
      description:
        "Customer on legacy Team plan at $149/mo. Current Team pricing is $199/mo. Subscribed 18 months ago. Active user with high engagement.",
      customerEmail: "v***@agency.co",
      customerId: "cus_C2eE4gEf1oK",
      subscriptionId: "sub_2GqW8dE0fL",
      monthlyImpact: 12000,
      annualImpact: 144000,
      recoveryRate: 0.3,
      fixSuggestion:
        "Migrate to current pricing with advance notice. Grandfather for one more billing cycle, then transition. Highlight any new features added since they signed up to justify the increase.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_2GqW8dE0fL",
      detectedAt: new Date(Date.now() - 540 * 86400000).toISOString(),
      metadata: {},
    },

    // ── MEDIUM: Missing Payment Methods ──
    {
      id: "leak-022",
      type: "missing_payment_method",
      severity: "medium",
      title: "Active subscription with no payment method",
      description:
        "Customer cus_D3fF5hFg2pL has an active Pro subscription ($99/mo) but no valid payment method on file. This subscription was likely created via API or trial conversion without collecting payment. Next billing will fail.",
      customerEmail: "j***@newcustomer.io",
      customerId: "cus_D3fF5hFg2pL",
      subscriptionId: "sub_3HrX9eF1gM",
      monthlyImpact: 9900,
      annualImpact: 118800,
      recoveryRate: 0.3,
      fixSuggestion:
        "Send an immediate email asking the customer to add a payment method. Include a Stripe Checkout link for easy card entry. This must be resolved before the next billing date.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_D3fF5hFg2pL",
      detectedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "leak-023",
      type: "missing_payment_method",
      severity: "low",
      title: "Trial conversion missing card — billing in 5 days",
      description:
        "Customer signed up for trial 9 days ago. Trial ends in 5 days but no card on file. If they don't add a payment method, the $49/mo Starter subscription will fail to convert.",
      customerEmail: "m***@trialuser.com",
      customerId: "cus_E4gG6iGh3qM",
      subscriptionId: "sub_4IsY0fG2hN",
      monthlyImpact: 2300,
      annualImpact: 27600,
      recoveryRate: 0.3,
      fixSuggestion:
        "Send a trial ending reminder with a clear CTA to add payment. Consider an in-app notification too. Trial-to-paid conversion is a critical moment.",
      stripeUrl: "https://dashboard.stripe.com/customers/cus_E4gG6iGh3qM",
      detectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      metadata: {},
    },

    // ── HIGH: Unbilled Overages ──
    {
      id: "leak-025",
      type: "unbilled_overage",
      severity: "high",
      title: "Quantity mismatch: 8 seats but billing for 1",
      description:
        "This Enterprise subscription shows 8 seats (quantity) but is billing only $199/mo instead of the expected $1,592/mo (8 × $199). The per-seat pricing isn't being applied correctly — likely a Stripe coupon or manual override zeroing out the additional seats.",
      customerEmail: "ops***@scaleco.io",
      customerId: "cus_G6iI8kIj5sO",
      subscriptionId: "sub_6KuA2hI4jP",
      monthlyImpact: 45000,
      annualImpact: 540000,
      recoveryRate: 0.7,
      fixSuggestion:
        "Review this subscription's quantity and pricing in Stripe Dashboard. The customer has 8 seats — verify the billing reflects per-seat pricing. Check for any 100% coupons or manual overrides.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_6KuA2hI4jP",
      detectedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      metadata: {},
    },

    // ── HIGH: Expired Trials ──
    {
      id: "leak-026",
      type: "trial_expired",
      severity: "high",
      title: "Trial subscription active for 67 days",
      description:
        "This subscription has been in 'trialing' status for 67 days. Your trial period is 14 days. The customer is using the Growth plan ($199/mo) for free. The trial-to-paid webhook likely failed, and the subscription was never converted.",
      customerEmail: "d***@freetrial.com",
      customerId: "cus_H7jJ9lJk6tP",
      subscriptionId: "sub_7LvB3iJ5kQ",
      monthlyImpact: 19900,
      annualImpact: 238800,
      recoveryRate: 0.5,
      fixSuggestion:
        "Check this subscription in Stripe Dashboard. If the trial should have ended, either convert the customer to a paid plan or cancel the subscription. Review your trial_end webhook handling.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_7LvB3iJ5kQ",
      detectedAt: new Date(Date.now() - 67 * 86400000).toISOString(),
      metadata: {},
    },

    // ── CRITICAL: Duplicate Subscriptions ──
    {
      id: "leak-027",
      type: "duplicate_subscription",
      severity: "critical",
      title: "Customer has 2 active subscriptions for the same product",
      description:
        "This customer upgraded from Growth ($199/mo) to Pro ($249/mo) 3 days ago, but the old Growth subscription was never canceled. They're now paying for both — $448/mo total. When they notice the double charge, expect a chargeback.",
      customerEmail: "c***@growthco.com",
      customerId: "cus_I8kK0mKl7uQ",
      subscriptionId: "sub_8MwC4jK6lR",
      monthlyImpact: 24900,
      annualImpact: 298800,
      recoveryRate: 0.9,
      fixSuggestion:
        "Cancel the old Growth subscription immediately. Proactively refund the overlap charges ($199 for the current period). Send the customer a note explaining the fix. Review your upgrade flow to auto-cancel old subscriptions.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_8MwC4jK6lR",
      detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      metadata: {},
    },

    // ── MEDIUM: Never-Expiring Discount ──
    {
      id: "leak-024",
      type: "never_expiring_discount",
      severity: "medium",
      title: "Forever 50% discount on Pro plan — likely a mistake",
      description:
        "Customer has a 'forever' duration coupon giving 50% off the $99/mo Pro plan. They're paying $49.50/mo. The coupon 'FRIEND50' was likely meant to be a limited-time referral offer but was misconfigured with no expiration.",
      customerEmail: "z***@friendco.io",
      customerId: "cus_F5hH7jHi4rN",
      subscriptionId: "sub_5JtZ1gH3iO",
      monthlyImpact: 5000,
      annualImpact: 60000,
      recoveryRate: 0.4,
      fixSuggestion:
        "Review whether this coupon should have had a time limit. If it was an error, contact the customer, explain the situation, and offer a 20% ongoing discount as a compromise. Update the coupon configuration to prevent this for future customers.",
      stripeUrl: "https://dashboard.stripe.com/subscriptions/sub_5JtZ1gH3iO",
      detectedAt: new Date(Date.now() - 300 * 86400000).toISOString(),
      metadata: {},
    },
  ],
};

// ── Demo CRM Enrichment ──────────────────────────────────────
// Add enrichment data to a subset of leaks to showcase CRM intelligence

function addDemoEnrichment() {
  const enrichmentMap: Record<string, LeakEnrichment> = {
    // Failed payment — customer is active in CRM → recovery rate boosted
    "leak-001": {
      originalSeverity: "critical",
      originalRecoveryRate: 0.6,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason:
        "Customer recently active in CRM. High recovery potential — likely a temporary payment issue.",
      signals: {
        found: true,
        daysSinceLastActivity: 3,
        lifecycleStage: "customer",
        leadStatus: null,
        dealCount: 2,
        tenureDays: 420,
        engagementLevel: "active",
        hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/101",
      },
      provider: "hubspot",
    },
    // Failed payment — customer is inactive → red flag
    "leak-004": {
      originalSeverity: "high",
      originalRecoveryRate: 0.6,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason:
        "Customer inactive in CRM for 52 days. Payment failure may signal churn rather than a temporary card issue.",
      signals: {
        found: true,
        daysSinceLastActivity: 52,
        lifecycleStage: "customer",
        leadStatus: null,
        dealCount: 0,
        tenureDays: 180,
        engagementLevel: "inactive",
        hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/104",
      },
      provider: "hubspot",
    },
    // Ghost subscription — inactive 90+ days → severity escalated to critical
    "leak-007": {
      originalSeverity: "critical",
      originalRecoveryRate: 0.4,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason:
        "Ghost sub confirmed — zero CRM activity in 92 days. Very unlikely to recover.",
      signals: {
        found: true,
        daysSinceLastActivity: 92,
        lifecycleStage: "customer",
        leadStatus: null,
        dealCount: 0,
        tenureDays: 365,
        engagementLevel: "inactive",
        hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/107",
      },
      provider: "hubspot",
    },
    // Ghost subscription — actually active in CRM → good sign
    "leak-008": {
      originalSeverity: "high",
      originalRecoveryRate: 0.4,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason:
        "Customer still actively engaged in CRM despite billing issue. Worth personal outreach.",
      signals: {
        found: true,
        daysSinceLastActivity: 5,
        lifecycleStage: "customer",
        leadStatus: null,
        dealCount: 1,
        tenureDays: 310,
        engagementLevel: "active",
        hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/108",
      },
      provider: "hubspot",
    },
    // Legacy pricing — high-value active customer
    "leak-020": {
      originalSeverity: "high",
      originalRecoveryRate: 0.3,
      severityAdjusted: false,
      recoveryRateAdjusted: true,
      adjustmentReason:
        "High-value customer (2 deals, actively engaged). Good candidate for pricing conversation.",
      signals: {
        found: true,
        daysSinceLastActivity: 2,
        lifecycleStage: "customer",
        leadStatus: null,
        dealCount: 2,
        tenureDays: 420,
        engagementLevel: "active",
        hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/120",
      },
      provider: "hubspot",
    },
    // Expiring card — inactive customer → severity escalated
    "leak-015": {
      originalSeverity: "high",
      originalRecoveryRate: 0.5,
      severityAdjusted: true,
      recoveryRateAdjusted: true,
      adjustmentReason:
        "Expiring card + no CRM activity for 38 days. High churn risk — customer may not update payment method.",
      signals: {
        found: true,
        daysSinceLastActivity: 38,
        lifecycleStage: "customer",
        leadStatus: null,
        dealCount: 0,
        tenureDays: 240,
        engagementLevel: "cooling",
        hubspotUrl: "https://app.hubspot.com/contacts/12345/contact/115",
      },
      provider: "hubspot",
    },
  };

  for (const leak of DEMO_REPORT.leaks) {
    const enrichment = enrichmentMap[leak.id];
    if (enrichment) {
      leak.enrichment = enrichment;
      // Apply recovery rate adjustments for demo consistency
      if (enrichment.signals.engagementLevel === "active") {
        leak.recoveryRate = Math.min(0.95, leak.recoveryRate + 0.1);
      } else if (enrichment.signals.engagementLevel === "inactive") {
        leak.recoveryRate = Math.max(0.05, leak.recoveryRate - 0.2);
      } else if (enrichment.signals.engagementLevel === "cooling") {
        leak.recoveryRate = Math.max(0.05, leak.recoveryRate - 0.15);
      }
    }
  }
}

addDemoEnrichment();

// Mark the demo report as enriched
DEMO_REPORT.enrichedWith = "hubspot";

// Compute billing health from demo data (after enrichment, so 7th dimension shows)
const DEMO_BILLING_HEALTH = computeBillingHealth(
  DEMO_REPORT.summary,
  DEMO_REPORT.categories,
  DEMO_REPORT.leaks
);

export default function DemoReportPage() {
  return (
    <div className="min-h-screen bg-surface-dim">
      <ReportHeader
        scannedAt={DEMO_REPORT.scannedAt}
        isLoggedIn={true}
        report={DEMO_REPORT}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Recovery Banner */}
        <RecoveryBanner
          recoveryPotential={DEMO_REPORT.summary.recoveryPotential}
          rawRecoveryPotential={DEMO_REPORT.summary.rawMrrAtRisk * 12}
        />

        {/* Summary Cards + Health Score */}
        <ReportSummary summary={DEMO_REPORT.summary} leaks={DEMO_REPORT.leaks} />

        {/* Billing Health Breakdown */}
        <BillingHealthInsights billingHealth={DEMO_BILLING_HEALTH} />

        {/* Category Breakdown Chart */}
        <LeakCategoryChart categories={DEMO_REPORT.categories} />

        {/* Quick Wins — start here summary */}
        <QuickWins leaks={DEMO_REPORT.leaks} />

        {/* All Leaks Table */}
        <div id="leak-table">
          <LeakTable leaks={DEMO_REPORT.leaks} />
        </div>

        {/* Recovery Agent Simulation */}
        <AgentSimulation leaks={DEMO_REPORT.leaks} />

        {/* CTA */}
        <ReportCTA mrrAtRisk={DEMO_REPORT.summary.mrrAtRisk} />
      </main>
    </div>
  );
}
