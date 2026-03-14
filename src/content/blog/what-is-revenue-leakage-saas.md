---
title: "What is Revenue Leakage in SaaS? The Complete Guide"
description: "SaaS companies lose 3-5% of ARR to revenue leakage. Learn what causes it, the 10 most common sources, how to detect it, and how to plug the leaks in your billing system."
date: "2026-03-14"
author: "RevReclaim Team"
tags: ["revenue leakage", "what is revenue leakage", "revenue leakage SaaS", "revenue leakage definition", "billing leaks", "SaaS billing"]
canonical: "https://revreclaim.com/blog/what-is-revenue-leakage-saas"
---

You're probably leaking money right now.

Not in some dramatic, company-ending way. It's more like a slow drip. A few failed payments here. An old coupon that never expired there. A customer on a pricing plan you retired two years ago.

Most SaaS companies lose 3-5% of their ARR to revenue leakage. On $500K ARR, that's $15,000-$25,000 a year. Just... gone. And the frustrating part? You won't see it in your dashboard. There's no alert for "money you should have collected but didn't."

## What is Revenue Leakage?

Revenue leakage is money your SaaS business earned on paper but never actually collected. It's the gap between what customers owe you and what lands in your bank account.

Think of it like a bucket with small holes. Water goes in at the top (new customers, upgrades, renewals). But some of it leaks out through cracks you can't easily see.

It's not fraud. It's not even a bug, usually. It's the accumulation of small billing issues that nobody notices because they happen one at a time.

A declined credit card here. An expired trial that kept running there. A discount that was supposed to last 3 months but never turned off. Each one is $20, $50, maybe $200. Easy to ignore. But they add up.

## The 10 Most Common Sources of Revenue Leakage in SaaS

Here's what we see again and again when we scan SaaS billing accounts. Some of these are obvious. Some will surprise you.

### 1. Failed Payments (The Big One)

A customer's card gets declined. Stripe retries a few times. If it still fails, the subscription cancels. The customer didn't want to leave. They just forgot to update their card.

This is called involuntary churn, and it accounts for 20-40% of all SaaS churn. Let that sink in. Up to 40% of the people leaving your product didn't choose to leave.

Stripe's built-in retry logic recovers about 38% of failed payments. That means 62% fall through the cracks. For a deeper dive, read our guide on [why Stripe payments fail and how to fix each type](/blog/payment-failed-stripe-smart-retries).

### 2. Expired Credit Cards

Related to failed payments, but worth calling out separately. Credit cards expire. People forget. If you're not proactively notifying customers before their card expires, you're waiting for a failure to happen.

About 50% of subscriber churn comes from payment failures tied to expired cards. And if you don't recover within 30 days, there's less than a 15% chance you ever will.

### 3. Never-Expiring Discounts

You ran a promotion. 50% off for the first 3 months. Great. But did you set the coupon to actually expire? In Stripe, it's surprisingly easy to create a coupon with no end date. That customer is paying half price... forever.

We call these [zombie discounts](/blog/zombie-discounts-stripe), and they're one of the most expensive leak types we find.

### 4. Expired Coupons Still Applied

The opposite problem. The coupon technically expired, but it's still attached to active subscriptions. This happens more than you'd think, especially with legacy billing setups. Stripe does not automatically remove coupons from existing subscriptions when the coupon's `redeem_by` date passes.

### 5. Ghost Subscriptions

A customer cancelled, but their subscription is still active in your billing system. Or the reverse: they're still being charged, but their account shows as inactive. Either way, something is wrong. Learn more about [stuck subscriptions and how to detect them](/blog/ghost-subscriptions-saas).

The average company wastes $135,000 per year on zombie subscriptions (that stat is from the buyer side, but the same logic applies to the seller side).

### 6. Legacy Pricing

You raised your prices 6 months ago. New customers pay $49/mo. But you still have 200 customers on the old $29/mo plan. That's $4,000/mo you're leaving on the table. Maybe that's intentional (grandfathering). Maybe you just forgot to migrate them.

Either way, you should know exactly how much it's costing you. We wrote a full guide on [auditing grandfathered pricing](/blog/grandfathered-pricing-saas).

### 7. Missing Payment Methods

A customer has an active subscription but no valid payment method on file. The next billing cycle will fail. Guaranteed. But right now, there's no alert. No flag. Nothing.

### 8. Expired Trials Still Running

Free trial ended 3 weeks ago. Customer never converted. But they're still using the product because nobody turned off access. You're giving away your product for free and calling it a "trial."

### 9. Unbilled Overages

If you have usage-based pricing (or any overage charges), are you actually billing for them? Metering gaps are one of the most common sources of leakage in SaaS, and they're almost invisible because you're losing revenue you never tracked in the first place.

### 10. Duplicate Subscriptions

Same customer, two active subscriptions. It happens during migrations, plan changes, or when checkout flows have bugs. The customer might not even know (and when they find out, they're not happy).

## How to Detect Revenue Leakage

Here's the honest answer: manual detection is almost impossible.

You'd need to cross-reference every subscription against every payment, check every coupon, validate every trial status, and compare current pricing against historical plans. For hundreds or thousands of customers. Every month.

Nobody does that. So the leaks continue.

There are three approaches, from basic to thorough:

### Option 1: Manual Spot Checks (Free, But Limited)

Go into your Stripe dashboard. Filter subscriptions by status. Look for anything weird. Past-due invoices, active subscriptions with no recent payment, coupons that have been running for years.

You'll catch some obvious issues. You'll miss the subtle ones. We have a full [billing health checklist](/blog/saas-billing-health-checklist) if you want to try the manual route.

### Option 2: Analytics Tools (Partial Coverage)

Tools like [Baremetrics, ChartMogul, or ProfitWell](/blog/baremetrics-vs-chartmogul-vs-profitwell) give you visibility into MRR, churn, and payment failures. They're great for understanding trends. But they don't scan for specific leak types. They'll tell you churn went up. They won't tell you it's because 47 customers have expired cards.

### Option 3: Dedicated Leakage Detection (Full Coverage)

This is what we built RevReclaim to do. Connect your Stripe account, and it scans for all 10 leak types in under 60 seconds. You get a report showing exactly where money is leaking, how much you're losing, and what to do about it.

Not trying to oversell it. Sometimes the scan comes back clean and you're doing fine. But most SaaS companies we scan have at least 3-4 active leak types they didn't know about.

## How to Calculate Revenue Leakage

Simple version:

**Expected MRR** (if every subscription paid in full, on time, at current pricing) minus **Actual MRR** (what you actually collected) equals **Revenue Leakage**.

The tricky part is calculating Expected MRR accurately. You need to account for:

- Active subscriptions at their correct price point
- Minus intentional discounts (ones you actually want to keep)
- Minus expected churn (voluntary, where customers chose to leave)

Everything else is leakage.

A good benchmark: if your leakage is above 3% of MRR, you have work to do. Below 1%? You're in good shape. Most SaaS companies land somewhere between 3-5%, which means there's real money to recover.

For the full calculation with real numbers, check our [revenue leakage calculator](/calculator) or read [how to calculate revenue leakage with real data](/blog/how-to-calculate-revenue-leakage).

## How to Fix Revenue Leakage (The Priority Order)

Not everything needs to be fixed at once. Here's the order that typically recovers the most money fastest:

**Week 1: Failed Payments + Expired Cards.** Set up proper dunning sequences. Pre-dunning emails before cards expire. Smart retry logic beyond Stripe's defaults. This alone can recover 20-40% of involuntary churn. Read our [step-by-step Stripe recovery guide](/blog/find-failed-payments-stripe).

**Week 2: Coupon and Discount Audit.** Find every active coupon. Check expiration dates. Identify customers on discounts that should have ended. Decide whether to keep or remove each one.

**Week 3: Ghost Subscriptions + Duplicates.** Clean up your subscription data. Cancel true ghosts. Merge duplicates. Notify affected customers.

**Week 4: Pricing Alignment + Trials.** Decide on your grandfathering policy. Set up proper trial expiration flows. Fix metering gaps for usage-based billing.

## What Revenue Leakage Isn't

A few things that get confused with revenue leakage but are actually different:

- **Voluntary churn** is not leakage. If a customer decides to cancel, that's churn. Leakage is money lost from customers who should still be paying. We wrote about [churn vs revenue leakage](/blog/saas-churn-vs-revenue-leakage) in more detail.
- **Refunds** are not leakage. You chose to return that money.
- **Pricing that's too low** is not leakage. That's a pricing strategy problem, not a billing problem.

Revenue leakage is specifically: money you're owed, from active or recently active customers, that you're not collecting due to billing, system, or process issues.

## The Bottom Line

Revenue leakage is one of those problems that feels small on any given day but compounds into real money over a year. The good news? Unlike growing revenue (which is hard), plugging leaks is relatively straightforward once you can see them.

The first step is always the same: find out where you're leaking.

[Scan your Stripe account for free with RevReclaim](/scan). Takes 60 seconds, no credit card required.
