---
title: "How to Calculate SaaS Revenue Leakage (With Real Data)"
description: "Learn the exact formula to calculate revenue leakage in your SaaS billing. Break down 8 leak types with real numbers, industry benchmarks, and a free calculator."
date: "2026-03-09"
lastModified: "2026-03-09"
author: "RevReclaim Team"
tags: ["revenue leakage", "SaaS metrics", "MRR", "billing audit", "revenue recovery"]
canonical: "https://revreclaim.com/blog/how-to-calculate-revenue-leakage"
---

Revenue leakage is money you earned but aren't collecting. Not churn — those customers left intentionally. Not bad debt — those customers can't pay. Leakage is money sitting in your billing system that belongs to you but never arrives. Configuration errors, expired discounts, failed payments, outdated pricing. Silent. Compounding. Fixable.

The average SaaS company leaks 4.7% of MRR. On $50K MRR, that's $2,350/month — $28,200/year — disappearing because nobody looked at the individual subscription records.

This post gives you the exact formula, the breakdown by leak type, and a way to calculate your own number in under 60 seconds.

## The Revenue Leakage Formula

Here's the formula RevReclaim uses to calculate total leakage as a percentage of MRR:

```
Leakage Rate = (Failed Payments + Expired Coupon Discounts + Legacy Pricing Gap
+ Ghost Subscription Cost + Expiring Card Risk + Forever Discounts
+ Missing Payment Method MRR + Unbilled Overages) / MRR x 100
```

Each component is a dollar amount per month. Add them up, divide by your MRR, multiply by 100. That's your leakage rate.

### Industry Benchmarks

MGI Research puts the industry average at 1-5% of revenue. That range is wide because it depends on billing complexity, pricing changes, coupon usage, and payment method diversity.

RevReclaim's data from 847+ scanned accounts narrows it down: **the average is 4.7% of MRR**. The median is 3.2%. The worst we've seen was 14.8% — a company with 3 years of accumulated coupons and two price increases that were never migrated.

### A Concrete Example: $50K MRR

Here's what a real leakage calculation looks like for a SaaS company at $50,000 MRR with 400 customers:

| Leak Type | Calculation | Monthly Amount |
|-----------|-------------|----------------|
| Failed Payments | 12 open invoices, avg $125 | $1,500 |
| Expired Coupons | 8 subs with expired 20% off on $99 plan | $158 |
| Legacy Pricing | 45 customers at $49 vs current $79 | $1,350 |
| Ghost Subscriptions | 6 past_due subs, avg $89/mo | $534 |
| Expiring Cards | 22 cards expiring in 90 days x 35% fail rate x $105 avg | $808 |
| Forever Discounts | 3 subs with permanent 25% off on $149 plan | $112 |
| Missing Payment Methods | 2 active subs, avg $119/mo | $238 |
| Unbilled Overages | 5 customers using 8 seats but paying for 5 at $15/seat | $225 |
| **Total Leakage** | | **$4,925/mo** |
| **Leakage Rate** | $4,925 / $50,000 | **9.85%** |

That's $59,100 per year. Not from losing customers. From billing configuration that nobody audits.

## Calculating Each Component

Here's how to calculate each of the 8 leak types individually. You can do this manually with your billing data, or let the [revenue leakage calculator](/calculator) estimate it based on industry averages.

### 1. Failed Payments

**Formula:** Sum of all open invoices with at least one failed payment attempt.

Pull your open invoices from Stripe, Paddle, or Polar. Filter for invoices that have been attempted but not paid. Sum the `amount_remaining` field.

This is the most straightforward leak to calculate — it's money that was invoiced but not collected. Industry average: 4-8% of charges fail each month. Recovery rate with proper dunning: 20-40%.

**Your number:** Total open invoice amount with failed attempts = Failed Payment Leakage.

For a deeper dive on finding and fixing these, see our [Failed Payments guide](/blog/find-failed-payments-stripe).

### 2. Expired Coupon Discounts

**Formula:** Sum of discount amounts on subscriptions where the applied coupon's `redeem_by` date has passed.

Stripe lets you set a coupon expiry date, but that only controls when new customers can redeem it. Existing subscriptions keep the discount forever — even years after the coupon "expired."

Pull all active subscriptions with a discount. Check if the coupon's `redeem_by` date is in the past. For each match, calculate the monthly discount amount.

**Your number:** Count of affected subscriptions x monthly discount per subscription = Expired Coupon Leakage.

### 3. Legacy Pricing Gap

**Formula:** (Current price - Customer's price) x number of customers on old pricing.

Every time you raise prices, existing customers stay on the old rate unless you migrate them. This is intentional grandfathering for some. For others, it's an oversight that grows every year.

Pull your current published prices. Compare against what each active subscription is actually paying. The difference, summed across all under-priced subscriptions, is your legacy pricing gap.

**Your number:** Sum of (current_price - actual_price) for every subscription paying below current rates = Legacy Pricing Leakage.

### 4. Ghost Subscription Cost

**Formula:** MRR of all subscriptions in `past_due` or `unpaid` status for 14+ days.

Ghost subscriptions inflate your reported MRR and consume resources without generating revenue. The cost is both the phantom MRR (which distorts your metrics) and the real resource cost of serving non-paying users.

Read our full breakdown in the [Ghost Subscriptions post](/blog/ghost-subscriptions-saas).

**Your number:** Sum of monthly amounts for all past_due/unpaid subscriptions older than 14 days = Ghost Subscription Leakage.

### 5. Expiring Card Risk

**Formula:** Cards expiring within 90 days x historical fail rate x average subscription amount.

This is probability-weighted because the leak hasn't happened yet — but it will. Cards that expire without being updated become failed payments. Your historical data tells you the conversion rate.

Pull all active subscriptions where the card expiration date is within 90 days. Multiply by your historical fail rate for expired cards (industry average: 30-40%). Multiply by the average subscription amount.

**Your number:** Expiring card count x fail rate x avg subscription amount = Expiring Card Risk.

### 6. Forever Discounts

**Formula:** Sum of all discount amounts on subscriptions with `duration: "forever"` coupons.

A 20% forever discount on a $100/mo plan costs $240/year. Every year. These are often created for early adopters, beta testers, or sales negotiations — then forgotten.

Not all forever discounts are leaks. Some are intentional. The question is: do you know about them, and did you decide to keep them?

See our detailed analysis in [Zombie Discounts](/blog/zombie-discounts-stripe).

**Your number:** Sum of monthly discount amounts for all forever-duration coupons = Forever Discount Leakage.

### 7. Missing Payment Methods

**Formula:** MRR of active subscriptions with no default payment method attached.

These subscriptions will fail on their next billing cycle. It's not a leak today — it's a guaranteed leak next month. Causes include payment method removals, migration errors, and checkout bugs.

**Your number:** Sum of monthly amounts for subscriptions with no payment method = Missing Payment Method Risk.

### 8. Unbilled Overages

**Formula:** (Actual usage - Billed usage) x per-unit price, for each customer exceeding their plan.

This requires comparing your internal usage data against what Stripe is billing. Common with seat-based pricing (customer added 3 seats but billing wasn't updated) and metered billing (usage reported incorrectly or not at all).

**Your number:** Sum of (actual_units - billed_units) x unit_price for all over-limit customers = Unbilled Overage Leakage.

## Use Our Free Calculator

Don't want to pull all this data manually? The [revenue leakage calculator](/calculator) estimates your total leakage based on two inputs:

- **Your MRR** (monthly recurring revenue)
- **Your customer count** (active subscriptions)

The calculator applies industry-average rates for each of the 8 leak types and produces:

- **Dollar estimates for each category** — how much you're likely losing to failed payments, expired coupons, legacy pricing, and the rest
- **A total leakage estimate** — your expected monthly and annual loss
- **A leakage rate** — your estimated percentage of MRR at risk
- **Priority ranking** — which leak types are likely costing you the most

It takes 15 seconds. No login required.

[Calculate your revenue leakage now](/calculator)

## Calculator vs. Real Scan

The calculator gives you estimates. A real scan gives you exact dollar amounts with every leak identified.

Here's the difference:

| | Calculator | RevReclaim Scan |
|---|-----------|----------------|
| **Input** | MRR + customer count | Read-only billing API key |
| **Data source** | Industry averages | Your actual billing data |
| **Output** | Estimated ranges | Exact dollar amounts |
| **Customer-level detail** | No | Yes — every affected customer |
| **Fix actions** | General recommendations | Direct links to fix each issue |
| **Time** | 15 seconds | 60 seconds |
| **Cost** | Free | Free |

The calculator is useful for understanding the problem. It answers: "How much am I probably losing?"

The scan is useful for fixing the problem. It answers: "Which specific customers are costing me money, and what do I do about each one?"

If the calculator shows you're likely losing $2,000+/month, the scan shows you exactly where.

For a complete walkthrough of the scan process, see [How to Audit Your Stripe Account](/blog/audit-stripe-account-revenue-leaks).

## What to Do Next

**Step 1:** Run the [revenue leakage calculator](/calculator) to get your estimated range. Takes 15 seconds.

**Step 2:** If the number is meaningful (and for most SaaS companies above $10K MRR, it will be), [run a free scan](/scan) to get exact amounts with every leak identified and fix actions.

**Step 3:** Fix the highest-impact leaks first. Our [Billing Health Checklist](/blog/saas-billing-health-checklist) gives you the prioritized order.

Every month you wait, the leaks compound. A $2,000/month leak is $24,000/year. Two months of inaction is another $4,000 gone.

[Run the calculator](/calculator) or [skip to the real numbers](/scan).

---

## Frequently Asked Questions

### What's a normal revenue leakage rate for SaaS?
MGI Research puts the industry range at 1-5% of revenue. RevReclaim's data from 847+ billing scans shows an average of 4.7% of MRR. Companies with simple pricing (one plan, no coupons) tend to be at the low end. Companies with multiple tiers, frequent promotions, and price changes over time tend to be at the high end. Anything above 5% means there's significant money on the table.

### Is revenue leakage the same as revenue churn?
No. Revenue churn is MRR lost from customers who intentionally downgrade or cancel. Revenue leakage is MRR lost from billing configuration issues — failed payments, expired coupons still running, customers on outdated pricing, ghost subscriptions. Churn is a customer decision. Leakage is a system problem. You track churn to improve retention. You track leakage to fix billing. Both reduce your effective MRR, but the solutions are completely different. For more on the specific types, see [5 Types of Revenue Leaks](/blog/five-types-revenue-leaks-saas).

### How do I track revenue leakage over time?
Run a leakage calculation monthly. Track the total dollar amount and leakage rate as a percentage of MRR. The goal is to keep it below 2%. RevReclaim's monitoring plans run automated scans on a weekly or daily schedule and alert you when new leaks appear, so your leakage rate trends down instead of compounding up.

### What causes revenue leakage in subscription billing?
Eight primary causes: failed payments that aren't recovered, expired coupons still discounting active subscriptions, customers on legacy pricing after a price increase, ghost subscriptions stuck in past_due status, expiring credit cards, forever-duration discounts, subscriptions with missing payment methods, and unbilled usage overages. Most SaaS companies have at least 3 of these 8 active at any given time. A [free audit](/scan) identifies which ones apply to your account.