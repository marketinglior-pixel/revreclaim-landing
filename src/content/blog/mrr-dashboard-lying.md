---
title: "Why Your MRR Dashboard Is Lying to You"
description: "Your MRR dashboard counts revenue you'll never collect. Learn 5 ways dashboards inflate MRR, how to calculate your real collected MRR, and how to close the gap."
date: "2026-03-09"
lastModified: "2026-03-09"
author: "RevReclaim Team"
tags: ["MRR", "dashboard accuracy", "revenue leakage", "SaaS metrics", "billing audit"]
canonical: "https://revreclaim.com/blog/mrr-dashboard-lying"
---

Your MRR dashboard says $50,000. The number is accurate. It's also misleading. Because it includes $2,340 that you'll never actually collect -- subscriptions where the card expired, payments that failed and nobody followed up, customers on zombie discounts. The dashboard counts them as active revenue. Your bank account disagrees.

This gap between reported MRR and collected MRR is revenue leakage. It exists in every SaaS billing account. And most founders don't know it's there because the dashboard never flags it.

## The Gap Between Dashboard MRR and Collected MRR

Two numbers matter for your SaaS business:

**Dashboard MRR** = the sum of all active subscription amounts in Stripe, Paddle, or Polar. This is what Baremetrics, ChartMogul, ProfitWell, and your billing provider's built-in dashboard report.

**Collected MRR** = the money that actually hits your bank account each month. Successful charges. Cleared payments. Cash you can spend.

The gap between these two numbers is revenue leakage.

Industry data from MGI Research puts the average leakage rate at 3-5% of revenue. RevReclaim's data from 847+ billing account scans shows an average of 4.7%.

On $50K MRR, a 4.7% gap means $2,350/month that your dashboard counts as revenue but your bank never sees. That's $28,200/year.

On $100K MRR, it's $4,700/month. $56,400/year.

The number is always bigger than founders expect. Because the dashboard is designed to show you what's *supposed* to happen, not what *actually* happened.

## 5 Ways Your Dashboard Inflates MRR

Here's exactly how the gap forms.

### 1. It Counts Past-Due Subscriptions as Active

Stripe keeps a subscription in "active" status until it's explicitly canceled -- even if the customer hasn't paid in 30, 60, or 90 days. A subscription can fail its renewal, enter `past_due` status, and still show up in your MRR calculation.

Your dashboard sees: $99/mo active subscription.
Your bank sees: $0 collected for the last 2 months.

These are [ghost subscriptions](/blog/ghost-subscriptions-saas). They inflate MRR by 1-3% on average. On a $50K MRR account, that's $500-$1,500/month in phantom revenue.

The fix: configure Stripe to auto-cancel subscriptions after a maximum dunning period (we recommend 30 days). Don't let ghosts accumulate.

### 2. It Ignores Discount Impact on Effective Rate

A customer on a $100/mo plan with a 20% forever discount pays $80/mo. Some dashboards and reporting tools pull the subscription amount ($100) rather than the amount after discount ($80).

This isn't a Stripe problem -- Stripe tracks discounts correctly. It's a reporting problem. Many third-party analytics tools and custom dashboards calculate MRR from the plan price, not the invoiced amount.

Check your own dashboard: pull up a discounted customer and verify whether the MRR contribution shows $100 or $80. If it shows $100, your total MRR is overstated by the sum of all active discounts.

For more on [zombie discounts](/blog/zombie-discounts-stripe) that quietly drain revenue, see our detailed guide.

### 3. It Doesn't Flag Legacy Pricing Gaps

A customer paying $49/mo on your old pricing shows $49 in MRR. Your current pricing is $79/mo. The dashboard reports $49 accurately -- but it doesn't show you the $30/mo gap between what you charge and what you could charge.

This isn't technically an error. The dashboard is reporting the correct subscription amount. But it hides a revenue optimization opportunity that compounds every month.

200 customers on old pricing at a $30/mo gap = $6,000/month in unrealized revenue. $72,000/year.

The dashboard will never tell you this. You need to compare active subscription prices against your current published pricing to find the gap. [Run a free scan](/scan) to see your exact legacy pricing gap.

### 4. It Treats Trialing Subscriptions as Future Revenue

Subscriptions in `trialing` status appear in your pipeline. Some dashboards include them in MRR forecasts. Some even count them in current MRR if the trial has a payment method on file.

The problem: not all trials convert. Industry average trial-to-paid conversion sits at 25-60% depending on whether a card is required upfront.

If you have 20 trials at $99/mo, your dashboard might project $1,980/mo in pipeline. Reality: you'll collect $500-$1,200 of that. The rest churns at trial end.

Worse, some subscriptions get stuck in `trialing` status due to webhook failures or manual trial extensions. We've seen subscriptions in trial for 90+ days. They show in your metrics but contribute zero revenue.

### 5. It Counts Subscriptions with No Payment Method

An active subscription with no card on file is MRR on paper and $0 in your bank. This happens more often than you'd think -- payment methods get removed, cards get deleted during failed update attempts, or a checkout flow creates the subscription before confirming the payment method.

These subscriptions will fail on their next billing cycle. Guaranteed. But until then, your dashboard counts them as active MRR.

```javascript
// Find active subscriptions with no payment method
const subs = await stripe.subscriptions.list({
  status: 'active',
  limit: 100,
});

const noPaymentMethod = subs.data.filter(
  sub => !sub.default_payment_method && !sub.default_source
);

console.log(`${noPaymentMethod.length} active subs with no payment method`);
console.log(`$${noPaymentMethod.reduce((sum, sub) =>
  sum + sub.items.data[0].price.unit_amount, 0) / 100}/mo at risk`);
```

**Typical finding:** 1-3% of active subscriptions have no payment method. On $50K MRR, that's $500-$1,500 in MRR that will definitely fail next cycle.

## How to Calculate Your Real MRR

Here's the formula:

```
Real MRR = Dashboard MRR
           - Failed Payment MRR (past_due subscriptions)
           - Ghost Subscription MRR (unpaid 30+ days)
           - No Payment Method MRR (will fail next cycle)
           - Discount Overstatement (if dashboard ignores discounts)
```

**Example on a $50K MRR account:**

| Category | Amount |
|----------|--------|
| Dashboard MRR | $50,000 |
| Failed payments (past_due) | -$1,200 |
| Ghost subscriptions (30+ days unpaid) | -$600 |
| No payment method | -$300 |
| Discount overstatement | -$250 |
| **Real Collected MRR** | **$47,650** |

That's a 4.7% gap. $2,350/month. $28,200/year.

Use our [revenue leakage calculator](/calculator) to run these numbers on your own MRR. It takes 30 seconds and shows you the estimated gap based on industry benchmarks.

For exact numbers specific to your billing account, [run a free scan](/scan). RevReclaim pulls your actual subscription data and calculates the precise gap -- not estimates.

## What to Do About It

### Run a Billing Audit Quarterly

At minimum, audit your billing data every 90 days. Revenue leaks compound -- a $200/mo ghost subscription costs $2,400/year if nobody catches it.

Our complete [Stripe billing audit guide](/blog/audit-stripe-account-revenue-leaks) walks through 10 checks you should run, with code examples for each one.

### Enable Dunning Automation

Stripe's Smart Retries recover 20-30% more [failed payments](/blog/find-failed-payments-stripe) than manual retry attempts. Turn it on in Settings > Billing > Subscriptions and emails.

Add customer failure emails too. Many customers don't know their card failed. A simple "your payment didn't go through" email recovers 10-15% of failures on its own.

### Monitor Collection Rate, Not Just MRR

Add one metric to your monthly review: **Collection Rate**.

```
Collection Rate = Successful Charges / Expected Charges x 100
```

Track this monthly. A healthy SaaS business collects 95-97% of expected revenue. Below 93% means you have a billing problem that needs attention.

Don't wait for MRR to drop. A declining collection rate is the early warning signal -- it shows leakage building before it shows up as churn.

### Get the Exact Gap in 60 Seconds

RevReclaim scans your billing account and shows the precise gap between dashboard MRR and collected MRR. Every ghost subscription, every failed payment, every zombie discount -- itemized with dollar amounts and fix recommendations.

Read-only access. No stored keys. Takes 60 seconds.

[Run a free scan to see your real MRR -->](/scan)

Use our [revenue leakage calculator](/calculator) to estimate the gap before scanning.

---

## Frequently Asked Questions

### Do Baremetrics and ChartMogul show real collected MRR?

Both tools pull data from your billing provider's API, so their accuracy depends on how they handle edge cases. Baremetrics and ChartMogul generally exclude `canceled` subscriptions from MRR but may still count `past_due` subscriptions as active. Neither tool flags [ghost subscriptions](/blog/ghost-subscriptions-saas), expired coupons still discounting, or legacy pricing gaps. They report what your billing system tells them -- they don't audit it. For a complete picture of the gap between reported and collected MRR, you need a billing-specific audit tool like RevReclaim.

### How much of a gap between dashboard MRR and collected MRR is normal?

Industry research from MGI Research puts average revenue leakage at 1-5% across SaaS businesses. RevReclaim's data from 847+ scanned accounts shows an average of 4.7%. A gap under 2% is excellent billing hygiene. Between 2-5% is typical for most SaaS companies. Above 5% indicates significant billing issues that need immediate attention. The [5 types of revenue leaks](/blog/five-types-revenue-leaks-saas) article breaks down where the gap comes from and what to fix first.

### Should I report dashboard MRR or collected MRR to investors?

Report dashboard MRR as your headline number -- that's the industry standard and what investors expect. But also track and disclose your collection rate. Sophisticated investors will ask about net revenue retention, churn rate, and payment failure rates. If your collection rate is below 95%, flag it proactively and explain your plan to close the gap. Reporting clean MRR when you know 5% is phantom revenue is a risk -- if an investor runs due diligence on your Stripe account, the gap will surface. Better to show that you know about it and are actively managing it. [How to calculate revenue leakage](/blog/how-to-calculate-revenue-leakage) provides the exact formulas investors care about.
