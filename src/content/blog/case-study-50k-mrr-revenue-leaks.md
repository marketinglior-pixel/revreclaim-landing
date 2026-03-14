---
title: "How We Found $2,500/mo Leaking from a $50K MRR SaaS (Case Study)"
description: "A case study showing how RevReclaim found $2,487/mo in Stripe revenue leaks — expired coupons, failed subscription payments, and legacy pricing — across 23 issues. The founder recovered $1,876/mo in under a week."
date: "2026-03-09"
lastModified: "2026-03-14"
author: "RevReclaim Team"
tags: ["case study", "Stripe revenue leaks", "revenue leakage", "SaaS billing audit", "expired coupons"]
canonical: "https://revreclaim.com/blog/case-study-50k-mrr-revenue-leaks"
---

A B2B SaaS founder at $50K MRR ran a RevReclaim scan expecting to find maybe $500/month in billing issues. The scan found $2,487/month. That's 4.97% of MRR — gone. Across 23 individual leaks in 6 different categories. Total annual impact: $29,844. The scan took 87 seconds.

This post walks through exactly what the scan found, what the founder fixed, what they chose to leave alone, and the math behind the recovery.

## The Company Profile

Here's what this account looks like:

- **Product:** B2B project management SaaS
- **MRR:** $50,000
- **Customers:** 312
- **Billing platform:** Stripe
- **Plan structure:** Monthly and annual plans
- **Price history:** 2 increases in the last 18 months ($39 to $49, then $49 to $69)
- **Active coupons:** 3 campaigns — including one from over a year ago
- **Dedicated billing ops person:** None

This profile is common. A growing SaaS that's been focused on product and acquisition, not billing hygiene. Nobody's auditing the billing system because it "just works." Revenue comes in every month, so the assumption is that everything is fine.

It wasn't.

## What the Scan Found

RevReclaim flagged 23 individual billing issues across 6 categories. Here's the breakdown.

### 1. Failed Payments — 7 Invoices, $847/mo

Seven invoices with failed charges. Three of them were enterprise customers with charges over $200 each. One had been failing for 22 days with no recovery attempt.

The root cause: **Smart Retries was turned off.** Stripe's default retry logic was running, but the optimized retry schedule — which [recovers 20-35% more failed payments](/blog/find-failed-payments-stripe) — was disabled. Customer failure notification emails were also off, so customers had no idea their payments were bouncing.

$847/month sitting in a failed state. $10,164/year.

### 2. Expired Coupons — 4 Coupons, $412/mo

A coupon called "launch20" was created 14 months ago for a product launch campaign. The coupon's `redeem_by` date had passed, so no new customers could use it. But Stripe doesn't remove coupons from existing subscriptions when the coupon expires. It only blocks new redemptions.

Eight subscriptions were still running with that 20% discount. The founder had no idea.

Three other coupons had similar issues — expired for new signups but still actively discounting existing subscriptions.

Combined: $412/month in discounts that should have ended months ago. That's $4,944/year in revenue left on the table. This is one of the [most common and least visible billing leaks](/blog/zombie-discounts-stripe) in SaaS.

### 3. Legacy Pricing — 47 Customers, $611/mo

Two price increases in 18 months: $39 to $49, then $49 to $69. The current price is $69/month. But 47 customers were still paying the old prices:

- 29 customers on the $39 plan (gap: $30/customer/month)
- 18 customers on the $49 plan (gap: $20/customer/month)

Average gap: $13 per customer per month. Total: $611/month in [grandfathered pricing leakage](/blog/grandfathered-pricing-saas).

This is the most common "accepted leak" in SaaS. Most founders know it exists. Few know the exact dollar amount.

### 4. Stuck Subscriptions — 3 Subs, $297/mo

Three subscriptions in `past_due` status for 18-45 days. No successful payment in that window. Still technically "active" in Stripe. Still consuming API resources. Still counting toward MRR.

These are [stuck subscriptions](/blog/ghost-subscriptions-saas) — they inflate your MRR and hide your real churn rate. In this case, they added $297/month to reported MRR that didn't actually exist as revenue.

The subscription with the longest past_due period (45 days) was on an annual plan worth $828/year. It had failed silently because the auto-cancellation policy was never configured.

### 5. Expiring Cards — 12 Customers, $189/mo Projected

Twelve customers had credit cards expiring within 60 days. Combined MRR on those cards: $189/month.

This isn't a current leak — it's a future one. Without pre-dunning emails (notifying customers before their card expires), approximately 40% of these will fail when the charge hits. That's $75/month in preventable failures.

Pre-dunning is one of the simplest fixes in billing. Stripe supports it natively. Most accounts don't have it enabled.

### 6. Forever Discount — 1 Coupon, $131/mo

One subscription at $262/month with a 50% "forever" discount. The discount was created during a "beta partner" deal 10 months ago. The partnership terms said the discount would last 3 months. The coupon was set to `forever` in Stripe.

Nobody caught it. $131/month — $1,572/year — leaking from a single coupon configuration error.

### Total: $2,487/mo Across 23 Issues

| Category | Count | Monthly Loss |
|---|---|---|
| Failed Payments | 7 invoices | $847 |
| Expired Coupons | 4 coupons (8 subs) | $412 |
| Legacy Pricing | 47 customers | $611 |
| Stuck Subscriptions | 3 subscriptions | $297 |
| Expiring Cards | 12 customers | $189 (projected) |
| Forever Discount | 1 coupon | $131 |
| **Total** | **23 issues** | **$2,487/mo** |

Annual impact: $29,844. That's the salary of a part-time employee. Disappearing into billing system cracks.

## What They Fixed (and What They Didn't)

Not every leak needs the same response. Some are same-day fixes. Some require customer conversations. Some are deliberate business decisions.

### Immediate Fixes (Same Day)

**Time invested:** ~2 hours.

- **Enabled [Smart Retries and dunning emails](/blog/payment-failed-stripe-smart-retries).** Stripe's optimized retry schedule was turned on. Customer failure notification emails were enabled. This alone puts the 7 failed invoices ($847/mo) on a recovery path.
- **Canceled 3 stuck subscriptions.** The past_due subscriptions were canceled after confirming the customers hadn't logged in during the past_due period. MRR dropped by $297 on paper — but that revenue was never real.
- **Removed the expired "launch20" coupon from 8 subscriptions.** Each customer was sent a brief email explaining the promotional period had ended. No complaints. $412/mo recovered.

**Same-day recovery: $1,556/mo.**

### Week 1 Fixes

- **Sent pre-dunning emails to 12 expiring card customers.** Used Stripe's built-in card expiration notification. 9 of 12 updated their card within 5 days. Projected recovery: $189/mo preserved.
- **Contacted the beta partner about the forever discount.** The partner agreed to move from 50% off to 20% off — still a meaningful partnership discount, but $131/mo less leakage. The partner understood. They'd forgotten about it too.

**Week 1 additional recovery: $320/mo.**

### Kept As-Is (Intentional Decision)

**Legacy pricing: $611/mo — accepted.**

The founder decided to grandfather all 47 existing customers at their current rates. The reasoning:

1. These are long-term customers. Forcing a price increase risks churn.
2. The average gap is $13/customer/month. Not enough to justify the conversation risk per customer.
3. New signups already pay $69. The gap shrinks naturally as old customers churn and new ones join.

This is a legitimate business decision. The point isn't that every leak must be fixed. The point is knowing the exact dollar amount so the decision is intentional, not accidental.

**Total recovered: $1,876/mo ($22,512/year).**
**Accepted gap: $611/mo** (intentional grandfathering).

## The Math

Here's the ROI calculation:

| Item | Value |
|---|---|
| RevReclaim scan cost | Free (one-time scan) |
| Time to run scan | 87 seconds |
| Time to fix immediate issues | ~2 hours |
| Revenue recovered per month | $1,876 |
| Annual impact | $22,512 |
| If they'd paid for Pro ($29/mo) | ROI = 64x in the first month |

Two hours of work. $22,512/year recovered.

The [revenue leakage calculator](/calculator) can estimate your own account's exposure based on your MRR and customer count. Most accounts in this range have similar numbers.

## Lessons from This Scan

### Billing leaks accumulate

This account didn't have one big problem. It had 23 small problems across 6 categories running simultaneously. Each one was small enough to miss. Together, they added up to 4.97% of MRR.

This is the pattern RevReclaim sees in nearly every scan. Leaks don't announce themselves. They stack quietly over months. The [5 types of revenue leaks](/blog/five-types-revenue-leaks-saas) compound when nobody's watching.

### The biggest leak wasn't the obvious one

Most founders would check failed payments first. That's the visible problem. But expired coupons ($412/mo) and the forever discount ($131/mo) were invisible — they weren't generating any alerts, any error logs, or any dashboard warnings.

The billing system was working exactly as configured. The configuration was just wrong.

### Fixing 70% of leaks takes less than 2 hours

Same-day fixes recovered $1,556/month. That's 62% of the total leak amount. Enabling Smart Retries, canceling ghosts, removing expired coupons — none of these required difficult conversations or product changes.

The remaining 30% (legacy pricing) wasn't a technical fix. It was a business decision. RevReclaim identified the exact dollar amount; the founder decided what to do with that information.

### Quarterly scans prevent accumulation

If this account had been scanned 6 months ago, the expired coupons would have been caught earlier. The stuck subscriptions wouldn't have accumulated. The forever discount would have been flagged months before $1,572 had leaked.

The [billing health checklist](/blog/saas-billing-health-checklist) recommends quarterly audits at minimum. RevReclaim Pro runs automated scans weekly or monthly so leaks get caught within one billing cycle, not after six.

## Your Account Probably Looks Like This

94% of SaaS billing accounts have at least one active revenue leak. The median account at $50K MRR loses $1,500-$3,000/month across multiple categories.

You can [calculate your estimated revenue leakage](/calculator) based on your MRR. Or skip the estimate and get exact numbers.

[Run a free scan](/scan) — it takes 90 seconds and uses read-only access. You'll see every leak, every dollar amount, and exactly where to fix each one.

Most founders are surprised by what they find.

---

*This case study is based on a composite of real scan results from accounts in the $40K-$60K MRR range. Details have been anonymized. Individual results vary based on billing configuration, customer count, and pricing history.*
