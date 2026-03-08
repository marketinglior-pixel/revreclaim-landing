---
title: "The SaaS Billing Health Checklist: 15 Leaks Hiding in Your Stripe Account"
description: "Most SaaS founders lose $2,500/mo to billing blind spots they don't know exist. Use this 15-point checklist to audit your Stripe, Paddle, or Polar account and plug revenue leaks before they compound."
date: "2026-03-08"
author: "RevReclaim Team"
tags: ["billing audit", "Stripe", "revenue leaks", "SaaS billing", "billing health"]
canonical: "https://revreclaim.com/blog/saas-billing-health-checklist"
---

You just crossed $20K MRR. Growth feels good. But here's the uncomfortable truth: **somewhere between 5% and 12% of that revenue is leaking** — silently, every single month.

Failed payments that nobody retried. Expired coupons still giving discounts. Customers on legacy plans paying half of what they should. These aren't edge cases. They're the norm.

We've scanned hundreds of SaaS billing accounts across Stripe, Paddle, and Polar. The average founder is losing **$2,500/month** to billing blind spots they didn't even know existed.

This checklist will help you find them.

## How to Use This Checklist

Go through each item one by one. For every "no" answer, you've found a potential revenue leak. At the end, tally your score to get your **Billing Health Score**.

- **12-15 checks passed:** Your billing is healthy. Nice work.
- **8-11 checks passed:** You have moderate leaks. Worth fixing.
- **Below 8:** You're losing serious money. Act now.

Or skip the manual work — [run a free automated scan](/scan) that checks all 15 in 60 seconds.

---

## Failed Payment Recovery

### 1. You have dunning emails enabled and configured

When a customer's card fails, does your billing platform automatically email them? Stripe's default dunning is basic — three retries over a few weeks, then cancellation. Most founders never customize this.

**What to check:** Go to Stripe Dashboard → Settings → Subscriptions and emails → Manage failed payments. Is Smart Retries enabled? Are customer emails turned on?

**The leak:** Without proper dunning, a single failed $99/mo subscription means $1,188/year lost — from just one customer.

### 2. You're monitoring failed payment rates weekly

If you don't check, you don't know. Failed payments typically run between 4-8% of charges for SaaS businesses. If yours is above 8%, something is wrong.

**What to check:** Stripe Dashboard → Payments → filter by "Failed". What's your rate over the last 30 days?

**The leak:** A 10% failure rate on $30K MRR means $3,000/month in charges that didn't go through. Even recovering half of those is $1,500/month back in your pocket.

### 3. You follow up on "past due" subscriptions within 48 hours

Stripe marks subscriptions as "past_due" when a payment fails but the subscription hasn't been canceled yet. This is your recovery window.

**What to check:** Stripe Dashboard → Subscriptions → filter by "Past due". How many are sitting there right now?

**The leak:** Every day a past-due subscription sits untouched, the chance of recovery drops. After 30 days, recovery rates fall below 15%.

---

## Ghost Subscriptions

### 4. You have zero active subscriptions with no successful payment in 60+ days

These are "ghost subscriptions" — technically active in your system, but the customer hasn't actually paid in months. They inflate your MRR and hide the real number.

**What to check:** Export your subscription list. Filter for subscriptions where the last successful payment was more than 60 days ago. Any results?

**The leak:** If you have 5 ghost subscriptions at $49/mo each, your reported MRR is $245/mo higher than reality. That's $2,940/year in phantom revenue affecting your decisions.

### 5. You audit canceled-but-active subscriptions monthly

Sometimes a customer cancels through your app, but the Stripe subscription doesn't properly terminate. Or a webhook fails. The customer thinks they've canceled, you think they're still paying — but the charge keeps failing silently.

**What to check:** Cross-reference your app's user status with Stripe's subscription status. Any mismatches?

**The leak:** These mismatches create support headaches, chargebacks, and lost trust. One chargeback costs you the transaction amount plus a $15 dispute fee.

---

## Pricing and Plan Integrity

### 6. No customers are on discontinued or legacy pricing tiers

You raised prices 6 months ago, but 30% of your customers are still on the old plan. That's fine if intentional — but do you even know which customers are grandfathered?

**What to check:** List all active Price IDs in Stripe. Are any attached to Products that you've since updated or archived?

**The leak:** If you raised prices from $29 to $49/mo and 50 customers are still on $29, that's $1,000/month you're leaving on the table — $12,000/year.

### 7. All active coupons have an expiration date

Open-ended coupons are a ticking time bomb. A 20% discount you ran during Black Friday 2024 might still be applied to new sign-ups if you forgot to set an expiration.

**What to check:** Stripe Dashboard → Products → Coupons. Look for any coupon where "Redemption deadline" is empty or "Duration" is set to "forever".

**The leak:** An expired promotion still giving 20% off on a $99/mo plan costs you $237.60 per customer per year. Multiply by every customer who found that coupon code.

### 8. No customer is receiving a larger discount than intended

Stacked coupons, manually applied discounts, and promotional pricing can compound in unexpected ways. A customer might be getting 40% off when you intended 20%.

**What to check:** Export subscriptions with discounts. Sort by discount percentage. Anything above your maximum intended discount?

**The leak:** Even 5 customers with an accidental extra 20% discount on a $99 plan costs you $1,188/year.

---

## Payment Method Health

### 9. Less than 5% of active subscriptions have expired payment methods

Credit cards expire. If a customer's card expires in March and their next charge is in April, that charge will fail unless they've updated their card.

**What to check:** Stripe Dashboard → Customers. Export and check the card expiration dates against upcoming renewal dates.

**The leak:** Each expired card is a failed payment waiting to happen. If 20 customers have cards expiring next month and your average plan is $79/mo, that's $1,580 at risk.

### 10. You send proactive card expiration reminders

Don't wait for the charge to fail. Email customers 30 days before their card expires so they can update it proactively.

**What to check:** Do you have any automated email or in-app notification for upcoming card expirations? Most founders don't.

**The leak:** Proactive reminders recover 60-70% of expiring cards before they fail. Without them, you rely on dunning after the fact — which only recovers 30-40%.

---

## Subscription Lifecycle

### 11. You're tracking involuntary churn separately from voluntary churn

Involuntary churn (failed payments) and voluntary churn (customer cancels) require completely different strategies. If you're lumping them together, you're flying blind.

**What to check:** Can you pull a report showing churn broken down by reason? Do you know what percentage of your churn is payment failures vs. deliberate cancellations?

**The leak:** Involuntary churn is typically 20-40% of total churn for SaaS businesses. It's also the easiest to fix. If you don't measure it, you can't improve it.

### 12. Trial-to-paid conversion is tracked and above 15%

If you offer a free trial, what percentage convert to paid? The SaaS average is 15-25%. Below 15% and you likely have a billing configuration issue (not just a product issue).

**What to check:** Count the number of trial subscriptions that became paid in the last 90 days vs. total trials started.

**The leak:** If 100 trials start per month and you convert at 10% instead of 20%, that's 10 lost customers/month. At $49/mo, that's $490/month in missed revenue — $5,880/year.

### 13. No subscriptions are stuck in "incomplete" or "incomplete_expired" status

Stripe creates subscriptions in "incomplete" status when the initial payment requires further action (like 3D Secure). If the customer never completes it, it stays stuck.

**What to check:** Stripe Dashboard → Subscriptions → filter by "Incomplete". How many are sitting there?

**The leak:** Each incomplete subscription is a customer who wanted to pay but couldn't complete the process. These are the easiest recoveries — a simple email can bring them back.

---

## Data Integrity

### 14. Your MRR calculation matches Stripe's actual collected revenue

Many founders calculate MRR by summing up active subscription prices. But this ignores failed payments, discounts, and prorations. Your real MRR is only what you actually collect.

**What to check:** Compare your calculated MRR (sum of subscription prices) vs. actual revenue received in the last 30 days. Is there a gap?

**The leak:** A 10% gap between reported and actual MRR on a $50K business means $5,000/month in revenue you think you have but don't. This affects fundraising, hiring, and every financial decision you make.

### 15. Webhook failures are monitored and alerts are configured

Stripe webhooks are how your app knows about payment events. If a webhook fails and isn't retried, your app and Stripe get out of sync — leading to customers who paid but don't have access, or customers with access who haven't paid.

**What to check:** Stripe Dashboard → Developers → Webhooks. Check the failure rate. Is it above 1%?

**The leak:** Webhook sync issues cause support tickets, incorrect access, and revenue discrepancies that compound over time.

---

## Your Billing Health Score

Count your "yes" answers:

| Score | Grade | What It Means |
|-------|-------|---------------|
| 13-15 | A | Your billing is tight. Minor optimizations possible. |
| 10-12 | B | A few leaks to patch. Probably losing $500-1,500/mo. |
| 7-9 | C | Significant leaks. Likely losing $1,500-3,000/mo. |
| 4-6 | D | Major revenue leakage. Losing $3,000-5,000/mo. |
| 0-3 | F | Critical. You need a billing audit immediately. |

## The Faster Way

Going through 15 checks manually takes hours. Exporting data, cross-referencing subscriptions, checking coupon expirations — it's tedious but important work.

Or you can let RevReclaim do it in 60 seconds.

**RevReclaim scans your Stripe, Paddle, or Polar account** and checks all 15 of these items automatically. You get a billing health score, a breakdown of every leak found, and actionable steps to fix each one.

It's free. It takes 90 seconds. And it uses read-only access — your data never leaves your account.

[Run your free billing health scan now →](/scan)

---

*Have questions about your billing health? [Contact us](/contact) — we're happy to help SaaS founders plug their revenue leaks.*
