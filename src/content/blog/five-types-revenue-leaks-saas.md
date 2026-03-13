---
title: "5 Types of Revenue Leaks Every SaaS Founder Should Audit"
description: "Most SaaS companies lose money in 3+ categories simultaneously. Learn the 5 types of revenue leaks, how much each one costs, and which to fix first."
date: "2026-03-09"
lastModified: "2026-03-09"
author: "RevReclaim Team"
tags: ["revenue leaks", "SaaS billing", "revenue leakage types", "billing audit", "MRR"]
canonical: "https://revreclaim.com/blog/five-types-revenue-leaks-saas"
---

Most founders hear "revenue leak" and think: failed payments. That's one category out of five. The average SaaS company is bleeding money in at least three categories simultaneously — and the non-obvious ones are often the most expensive. RevReclaim's scan data shows the typical $50K MRR company loses $2,000-$3,000/month across all five leak types combined.

Here are the five types of revenue leaks every SaaS founder should audit, ranked by how common they are.

## 1. Payment Recovery Leaks

**Affected accounts:** 94%
**Typical monthly loss:** $500-$2,500
**Root cause:** Failed charges that aren't recovered

This is the leak most founders know about. Credit cards decline. Payments fail. If your recovery system isn't configured properly, that revenue disappears.

The numbers are worse than most founders expect. **4-8% of all subscription charges fail every month.** That's not a bug — it's a structural reality of card-based billing. Cards expire. Banks flag transactions. Spending limits get hit.

The leak isn't the failure itself. The leak is what happens after.

**Where the money goes:**

- **No smart retries enabled.** Stripe's default retry logic recovers some failures, but optimized retry schedules recover 20-35% more.
- **Customer failure emails turned off.** RevReclaim's data shows [41% of Stripe accounts have customer failure emails disabled](/blog/saas-billing-leak-statistics). Customers can't fix a payment they don't know about.
- **No dunning sequence.** A single "your payment failed" email recovers 10-15% of failures. A 3-email dunning sequence recovers 25-40%.
- **Retries give up too early.** Default retry windows are often too short. Extending the retry period from 2 weeks to 4 weeks recovers an additional 8-12% of failed payments.

**Impact at scale:** A $30K MRR company with a 6% failure rate and no dunning optimization is losing $540-$900/month in unrecovered payments. That's $6,480-$10,800/year.

**Fix it:** Read the full [guide to finding and recovering failed payments in Stripe](/blog/find-failed-payments-stripe).

## 2. Discount and Coupon Leaks

**Affected accounts:** 62%
**Typical monthly loss:** $200-$900
**Root cause:** Expired coupons still running, forever discounts, undocumented promotional pricing

This is the leak that surprises founders the most. That launch coupon from 8 months ago? Still active on 15 subscriptions. That "3-month discount" for an early adopter? It was set to "forever" by accident.

Stripe does not automatically remove coupons from existing subscriptions when the coupon's `redeem_by` date passes. The coupon expires for new customers. Existing customers keep the discount indefinitely. This is by design, but most founders don't realize it until they audit.

**Common scenarios:**

- A 50% launch coupon with no expiration date — still being redeemed 14 months later
- A "forever" duration discount intended to last 3 months — applied to 23 enterprise accounts
- Stacked coupons giving individual customers 40-60% off when the intended maximum was 20%
- Test coupons (100% off) that were never deleted and got shared externally

**The worst case from RevReclaim's scans:** A 30% "forever" coupon on 23 subscriptions. Annual cost: $9,936 in unnecessary discounts. The founder thought the coupon had expired.

These are what we call [zombie discounts](/blog/zombie-discounts-stripe) — coupons that should be dead but are still alive, silently reducing your revenue.

**Fix it:** Audit every active coupon in your billing platform today. Check for expiration dates, correct duration settings, and whether the coupon should still exist at all.

## 3. Pricing Misalignment Leaks

**Affected accounts:** 54%
**Typical monthly loss:** $300-$1,200
**Root cause:** Legacy pricing, unbilled overages, quantity mismatches

You raised your prices 6 months ago. From $29/month to $49/month. You announced it. New customers pay $49. But how many existing customers are still on $29?

Most founders guess "maybe 20 or so." The real number is usually 3-5x higher.

**RevReclaim's scan data:** After a price increase, **10-25% of existing customers remain on the old pricing** — sometimes intentionally grandfathered, sometimes accidentally overlooked.

**The three sub-types:**

### Legacy/Grandfathered Pricing

A company launched at $29/month, raised to $49/month 8 months ago. Out of 180 subscribers, 67 are still paying $29. That's $1,340/month in potential revenue — $16,080/year.

The question isn't whether to grandfather customers. That's a business decision. The question is: **do you know exactly which customers are grandfathered, and have you made a conscious decision about each one?**

In most cases, the answer is no.

### Unbilled Overages

Usage-based components that aren't being tracked or billed correctly. A customer on a plan with "up to 10,000 API calls" is making 45,000 calls/month. The overage billing was never configured.

### Quantity Mismatches

Seat-based pricing where the billing system shows 5 seats but the product database shows 12 active users. This happens when your product's user management isn't integrated with your billing platform — or when the integration breaks silently.

**Fix it:** Export your subscription list. Compare every customer's current plan price against your current published pricing. Flag every mismatch. Make a deliberate decision about each one.

## 4. Subscription Lifecycle Leaks

**Affected accounts:** 78%
**Typical monthly loss:** $400-$2,000
**Root cause:** Stuck subscriptions, stuck trials, duplicate subscriptions

These are subscriptions that exist in your billing system but aren't generating real revenue — or are generating phantom revenue that inflates your MRR.

**The three sub-types:**

### Stuck Subscriptions

A [stuck subscription](/blog/ghost-subscriptions-saas) is a subscription that's technically "active" in Stripe but hasn't had a successful payment in 30+ days. The customer's card keeps failing, the subscription moves to `past_due`, and it sits there indefinitely. Nobody notices.

**78% of SaaS billing accounts have stuck subscriptions.** The average account has 11. That's $620/month in phantom MRR — revenue that shows up in your dashboard but never hits your bank account.

### Expired Trials Stuck in Trialing

Trials that hit their end date but never converted or canceled. They sit in `trialing` status forever. Depending on your billing configuration, they might never trigger a charge — or they might eventually charge and immediately fail.

Either way, they pollute your metrics and create confusion.

### Duplicate Subscriptions

Checkout bugs, webhook failures, or retry logic issues that create two (or more) subscriptions for the same customer. One is active and being paid. The other is a zombie — either failing silently or, worse, double-charging the customer.

RevReclaim finds duplicate subscriptions in roughly 1 out of every 8 accounts scanned. Average cost when double-charging: a chargeback plus a $15 fee plus a customer who no longer trusts you.

**Fix it:** Use the [SaaS Billing Health Checklist](/blog/saas-billing-health-checklist) to audit your subscription lifecycle end to end.

## 5. Dunning and Pre-Dunning Gaps

**Affected accounts:** 88%
**Typical monthly loss:** $200-$800
**Root cause:** Missing proactive systems that prevent leaks before they happen

The first four leak types are about money you're already losing. This fifth type is about money you're going to lose because you haven't built the systems to prevent it.

These are leaks of omission.

**What's usually missing:**

### No Pre-Dunning Emails for Expiring Cards

On average, 2-3% of your customers' credit cards expire every month. That's not a guess — it's math. Cards have expiration dates. They expire.

If you email customers 30 days before their card expires with a link to update their payment method, most will update it. If you don't, that charge will fail next month and you're back to leak type #1.

**Only 12% of SaaS accounts have proactive card expiration alerts enabled.** The other 88% are waiting for the charge to fail before doing anything.

### No Smart Retry Configuration

Stripe's default retry schedule isn't optimized for your specific customer base. Custom retry schedules — retrying at specific times and intervals based on failure reason — recover significantly more revenue than defaults.

### No Proactive Outreach for At-Risk Payments

Cards that are about to expire. Bank accounts with recent failures. Payment methods that haven't been updated in 3+ years. These are signals that a payment is about to fail — and you can act before it does.

**Fix it:** Set up card expiration alerts, optimize your retry schedule, and build a pre-dunning workflow. The [failed payments guide](/blog/find-failed-payments-stripe) covers the technical setup.

## How These Five Leak Types Compound

Here's why this matters more than any single leak type.

A SaaS company at $50K MRR rarely has just one type of leak. RevReclaim's data shows the average company has **3.2 active leak types simultaneously**. And they compound.

**Typical compounding scenario for a $50K MRR company:**

| Leak Type | Monthly Loss |
|-----------|-------------|
| Payment recovery gaps | $900 |
| Zombie discounts (2 active coupons) | $450 |
| 18 customers on legacy pricing | $360 |
| 9 stuck subscriptions | $550 |
| No pre-dunning (8 cards expiring) | $320 |
| **Total** | **$2,580/month** |

That's **$30,960/year** in leaked revenue. For a company doing $600K ARR, that's over 5% of total revenue walking out the door through billing blind spots.

And the leak grows proportionally as you grow. Double your MRR, and you roughly double the leak — unless you fix the underlying systems.

## Which Leak Type Should You Fix First?

Prioritize by **ease of fix multiplied by dollar impact**.

| Priority | Leak Type | Time to Fix | Expected Recovery | Why First |
|----------|-----------|-------------|-------------------|-----------|
| 1 | Payment recovery | 15 min | $500-$2,500/mo | Highest dollar impact, easiest fix (enable emails + smart retries) |
| 2 | Dunning gaps | 30 min | $200-$800/mo | Prevents future leaks across all categories |
| 3 | Discount leaks | 15 min | $200-$900/mo | Quick audit, immediate savings |
| 4 | Lifecycle leaks | 1-2 hours | $400-$2,000/mo | Requires subscription-by-subscription review |
| 5 | Pricing misalignment | 2-4 hours | $300-$1,200/mo | Requires business decisions about grandfathering |

**Start with payment recovery.** Enable customer failure emails in Stripe (5 minutes). Configure Smart Retries (10 minutes). Those two actions alone recover 20-35% more failed payments immediately.

Then audit your coupons. Then clean up stuck subscriptions. Then tackle pricing.

Don't try to fix all five at once. Fix the highest-impact leak first, measure the result, then move to the next one.

## Find All Five Leak Types in 60 Seconds

You can audit each of these manually. It takes 4-6 hours and you need to do it monthly.

Or you can [run a free scan](/scan). RevReclaim checks all five leak types across your Stripe, Paddle, or Polar account in 60 seconds. You get:

- **Exact dollar amounts** for each leak type
- **A Billing Health Score** from 0-100
- **A prioritized fix list** — what to fix first, with step-by-step instructions

Read-only access. Your billing data stays on your billing platform.

Want to estimate your losses before scanning? Use the [revenue leakage calculator](/calculator).

Want to audit manually instead? Follow the [step-by-step Stripe audit guide](/blog/audit-stripe-account-revenue-leaks).

---

## Frequently Asked Questions

### What percentage of SaaS revenue is typically lost to billing leaks?

The average SaaS billing account leaks 8.4% of revenue across all five leak types combined, according to RevReclaim's analysis of 50 billing accounts. Companies in the $10K-$30K MRR range lose the most as a percentage (9.3%), while larger companies at $75K-$200K MRR lose 6.1%. The total leak includes failed payments, stuck subscriptions, coupon errors, pricing misalignment, and dunning gaps. See the full [billing leak statistics breakdown](/blog/saas-billing-leak-statistics).

### Are revenue leaks the same as churn?

No. Churn is when a customer decides to leave. Revenue leaks are money you lose from customers who intend to stay but aren't being billed correctly — or from billing system misconfigurations that reduce what you collect. A customer with a failed payment isn't churning. A customer on an expired coupon isn't churning. They're active customers generating less revenue than they should. Fixing revenue leaks increases net revenue retention without requiring new customer acquisition.

### Can billing platforms like Stripe detect revenue leaks automatically?

Stripe, Paddle, and Polar report basic metrics like failed payment counts and subscription statuses. But they don't cross-reference coupon expiration dates against active subscriptions, identify stuck subscriptions, flag pricing misalignments, or calculate your total leakage across all five categories. RevReclaim connects to your billing platform via read-only API access and runs a comprehensive scan across all five leak types in 60 seconds. [Run a free scan](/scan) to see your results.

### How often should I audit my SaaS billing for revenue leaks?

Monthly. Revenue leaks accumulate every billing cycle — new cards expire, new coupons are created, new subscriptions enter edge-case states. The three SaaS accounts that scored 90+ in RevReclaim's analysis all had a recurring monthly calendar event to check billing health. Use the [SaaS Billing Health Checklist](/blog/saas-billing-health-checklist) as your monthly audit template.
