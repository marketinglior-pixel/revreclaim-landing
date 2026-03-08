---
title: "We Scanned 50 SaaS Billing Accounts — Here's What We Found"
description: "Data from 50 real SaaS billing scans reveals the most common revenue leaks, average losses by company size, and the fastest fixes. See how your billing stack compares."
date: "2026-02-28"
lastModified: "2026-03-08"
author: "RevReclaim Team"
tags: ["billing data", "SaaS metrics", "revenue leakage", "billing health", "case study"]
canonical: "https://revreclaim.com/blog/saas-billing-leak-statistics"
---

RevReclaim scanned 50 SaaS billing accounts across Stripe, Paddle, and Polar, ranging from $3K to $200K MRR. The average SaaS billing account leaks 8.4% of revenue to billing blind spots — failed payments without proper dunning, ghost subscriptions inflating MRR, expired coupons still giving discounts, and customers stuck on legacy pricing. For a $30K MRR business, that equals $2,520 per month in lost revenue.

## How Much Revenue Does the Average SaaS Company Leak?

**The average SaaS billing account is leaking 8.4% of revenue.**

That's not a typo. For every $100 in MRR, $8.40 is being lost to billing blind spots — failed payments that weren't recovered, ghost subscriptions inflating metrics, expired coupons still giving discounts, and customers on legacy pricing.

For a $30K MRR business, that's **$2,520 per month** walking out the door.

## What Are the Most Common Types of SaaS Billing Leaks?

RevReclaim categorizes billing leaks into five types. Here's how they break down across all 50 accounts:

| Leak Type | % of Accounts Affected | Avg Monthly Loss | % of Total Leakage |
|-----------|----------------------|------------------|-------------------|
| Failed payment gaps | 94% | $890 | 35% |
| Ghost subscriptions | 78% | $620 | 24% |
| Expired/misconfigured coupons | 62% | $430 | 17% |
| Legacy pricing issues | 54% | $380 | 15% |
| Payment method decay | 88% | $230 | 9% |

Let's break each one down.

### 1. Failed Payment Gaps (94% of accounts, $890/mo avg)

Nearly every account RevReclaim scanned had a failed payment recovery gap. This is the difference between how many payments failed and how many were actually recovered through retries and dunning.

**The shocking stat:** 41% of accounts had customer failure emails turned off. That means when a card declined, the customer had no idea. Stripe retried a few times, gave up, and the revenue was lost.

Accounts with customer emails enabled recovered **2.3x more** failed payments than those without.

**Median failure rate:** 5.8% of charges
**Best performer:** 1.2% failure rate (proper dunning + proactive card updates)
**Worst performer:** 14.7% failure rate (no dunning configuration at all)

### 2. Ghost Subscriptions (78% of accounts, $620/mo avg)

RevReclaim defines a ghost subscription as any "active" subscription with no successful payment in 45+ days.

**Average ghost subscription count:** 11 per account
**Average MRR inflation:** $620/month

The worst case RevReclaim found: a $45K MRR company with **47 ghost subscriptions** totaling $4,200/month in phantom MRR. Their real MRR was $40,800 — nearly 10% lower than reported.

When the founder was asked about it, they said: "I knew some payments were failing, but I had no idea it was that many."

**The ghost subscription lifecycle:**
1. Card fails on renewal (Day 0)
2. Stripe retries 3 times over 2 weeks (Day 1-14)
3. All retries fail, subscription moves to "past_due" (Day 14)
4. Nobody notices. Subscription sits in past_due indefinitely (Day 14+)
5. Customer assumes they've been canceled. Stops using the product (Day 30+)
6. Subscription is still "active" in your MRR calculation (Day 60, 90, 120...)

### 3. Expired or Misconfigured Coupons (62% of accounts, $430/mo avg)

This one surprises founders the most. Coupons they ran months ago are still being applied to new or existing subscriptions.

**Common scenarios RevReclaim found:**
- A "LAUNCH50" coupon from 12 months ago with no expiration — still being redeemed
- A "forever" duration discount that was meant to be 3 months
- Stacked coupons giving some customers 40-60% off when the intended max was 20%
- Test coupons ("TEST100" = 100% off) that were never deleted and somehow got shared

**Most expensive coupon leak RevReclaim found:** A 30% "forever" coupon applied to 23 enterprise subscriptions. The founder had intended it as a 3-month launch discount. Annual impact: **$9,936** in unnecessary discounts.

### 4. Legacy Pricing Issues (54% of accounts, $380/mo avg)

More than half the accounts RevReclaim scanned had customers on pricing tiers that no longer exist. The company raised prices at some point, but existing customers were grandfathered — sometimes intentionally, sometimes by accident.

**The question isn't whether to grandfather** — that's a business decision. The question is: **do you know exactly which customers are grandfathered and how much it's costing you?**

In most cases, the answer was no.

**Typical scenario:** Company launched at $29/mo, raised to $49/mo 8 months ago. Out of 180 subscribers, 67 are still on $29 — costing $1,340/month in potential revenue. The founder assumed "maybe 20 or so" were still on the old price.

### 5. Payment Method Decay (88% of accounts, $230/mo avg)

Credit cards expire. On average, 2-3% of your customers' cards will expire in any given month. If you don't proactively prompt them to update before the next charge, that charge will fail.

**Accounts with proactive card expiration alerts:** 12% of scanned accounts
**Average cards expiring in the next 30 days:** 8 per account
**Estimated at-risk revenue:** $632/month per account

The fix here is straightforward but almost nobody does it: email customers 30 days before their card expires with a direct link to update their payment method.

## What Is the Average SaaS Billing Health Score?

RevReclaim assigns every account a Billing Health Score from 0-100. Here's how the 50 accounts distributed:

| Score Range | Grade | Count | % of Accounts |
|-------------|-------|-------|---------------|
| 90-100 | A | 3 | 6% |
| 75-89 | B | 11 | 22% |
| 50-74 | C | 19 | 38% |
| 25-49 | D | 12 | 24% |
| 0-24 | F | 5 | 10% |

**Average score: 56 out of 100.**

Only 6% of accounts scored an A. The median SaaS billing setup has significant room for improvement.

## Which SaaS Company Size Leaks the Most Revenue?

Larger companies leak more in absolute terms, but smaller companies leak a higher percentage of revenue:

| MRR Range | Avg Monthly Leak | Leak as % of MRR | Avg Health Score |
|-----------|-----------------|-------------------|-----------------|
| $3K-$10K | $480 | 6.8% | 52 |
| $10K-$30K | $1,850 | 9.3% | 54 |
| $30K-$75K | $3,400 | 6.5% | 58 |
| $75K-$200K | $8,200 | 6.1% | 62 |

**The $10K-$30K range leaks the most as a percentage of revenue.** This makes sense — these businesses are big enough to have complex billing but usually don't have dedicated billing ops. The founder is wearing 10 hats, and billing configuration isn't one of them.

## Which Billing Platform Has the Most Revenue Leakage?

| Platform | Avg Health Score | Avg Monthly Leak | Primary Leak Type |
|----------|-----------------|-----------------|-------------------|
| Stripe | 51 | $2,840 | Failed payment gaps |
| Paddle | 67 | $1,120 | Coupon misconfiguration |
| Polar | 55 | $1,680 | Ghost subscriptions |

Stripe has the lowest average health score — not because the platform is bad, but because it requires the most configuration. The 8 Stripe accounts that scored 85+ had meticulously configured dunning, enabled customer emails, and actively managed their subscription lifecycle. They outperformed Paddle accounts on recovery.

But the average Stripe account? Barely touched the default settings.

## What Are the Fastest Ways to Fix SaaS Billing Leaks?

Based on the 50 scans, here are the three changes that have the biggest impact:

### Fix 1: Enable Customer Failure Emails (5 minutes)

If you're on Stripe and haven't done this, stop reading and go do it now:

Stripe Dashboard → Settings → Billing → Subscriptions and emails → Send emails about failed payments → **Enable**

Expected recovery improvement: **20-35% more failed payments recovered.**

### Fix 2: Audit and Expire Old Coupons (15 minutes)

Go through every active coupon in your billing platform. For each one:
- Does it have an expiration date? If not, add one.
- Is the duration set correctly? ("Forever" should rarely be forever.)
- Is the discount percentage correct?
- Should this coupon still be active at all?

Expected savings: **$200-$800/month** for most accounts.

### Fix 3: Clean Up Ghost Subscriptions (30 minutes)

Export your subscription list. Find any "active" or "past_due" subscriptions with no successful payment in 45+ days. For each one:
- Send a personal recovery email
- Wait 7 days
- Cancel unrecovered subscriptions

This fixes your MRR accuracy and prevents chargebacks.

Expected impact: **Accurate MRR + $300-$1,000/month in recovered or properly canceled subscriptions.**

## What Do Top-Performing SaaS Companies Do Differently for Billing?

The three accounts that scored 90+ had these traits in common:

1. **Customer failure emails enabled** from day one
2. **Dunning optimized** — custom retry schedule, not Stripe defaults
3. **Monthly billing audit** — a recurring calendar event to check failed payments, ghost subscriptions, and coupon health
4. **Proactive card expiration alerts** — emails sent 30 days before card expiry
5. **Clear cancellation flow** — voluntary cancellations are clean, preventing ghost subscriptions
6. **Regular price migration** — when prices increase, old-plan customers are gradually migrated with notice

## How Can SaaS Founders Check Their Billing Health?

These numbers are averages. Your billing account might be healthier — or it might be worse.

The only way to know is to look.

RevReclaim scans your Stripe, Paddle, or Polar account in 60 seconds. You get your Billing Health Score, a breakdown of every leak found, and a prioritized list of fixes.

It's free. Read-only access. Your data stays yours.

[Run your free billing scan →](/scan)

---

## Frequently Asked Questions

### What percentage of SaaS revenue is lost to billing leaks?
The average SaaS billing account leaks 8.4% of revenue according to RevReclaim's analysis of 50 billing accounts. Companies in the $10K-$30K MRR range lose the most as a percentage (9.3%), while larger companies at $75K-$200K MRR lose 6.1% on average.

### What is the most common type of SaaS billing leak?
Failed payment gaps are the most common billing leak, affecting 94% of SaaS accounts and accounting for 35% of total leakage ($890/month average). The second most common is ghost subscriptions (78% of accounts, 24% of leakage), followed by expired or misconfigured coupons (62% of accounts, 17% of leakage).

### What is a good billing health score?
A billing health score of 90-100 (Grade A) indicates well-optimized billing. Only 6% of the 50 accounts RevReclaim scanned achieved this score. The average score is 56/100 (Grade C), and 34% of accounts scored below 50 (Grade D or F), indicating critical revenue leakage.

### What is the single fastest fix for SaaS billing leaks?
Enabling customer failure emails in Stripe is the fastest and highest-impact fix. It takes under 5 minutes and recovers 20-35% more failed payments. In RevReclaim's scan data, 41% of Stripe accounts had this setting turned off, meaning customers were never notified when their card was declined.
