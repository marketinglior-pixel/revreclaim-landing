---
title: "Stuck Subscriptions: When Customers Stop Paying But Don't Cancel"
description: "Stuck subscriptions silently inflate your MRR and contribute to involuntary churn. Learn how to detect ghost subscribers in Stripe, Paddle, and Polar — and how to recover the revenue or clean up your metrics."
date: "2026-03-06"
lastModified: "2026-03-14"
author: "RevReclaim Team"
tags: ["stuck subscriptions", "ghost subscriptions", "MRR", "involuntary churn", "Stripe revenue leaks"]
canonical: "https://revreclaim.com/blog/ghost-subscriptions-saas"
---

A stuck subscription is a SaaS subscription that remains technically active in Stripe, Paddle, or Polar but has not had a successful payment in 30 or more days. Stuck subscriptions inflate MRR by an average of 3-7% and affect 78% of SaaS billing accounts. RevReclaim detects stuck subscriptions automatically during its 60-second billing scan.

## What Is a Stuck Subscription?

A stuck subscription is a subscription that's technically active in your billing system but hasn't had a successful payment in 30, 60, or even 90+ days. The customer's card keeps failing, or their payment method expired, or a webhook broke — and the subscription just... sits there.

The customer isn't using your product. They're not paying. But they still count toward your MRR.

They are called stuck subscriptions because they haunt your metrics.

## Why Are Stuck Subscriptions Dangerous for SaaS?

### They Inflate Your MRR

This is the most obvious problem. If 10 customers at $99/mo haven't paid in 60 days but still show as "active," your MRR is overstated by $990/month. That's $11,880/year in phantom revenue.

When you're making decisions about hiring, marketing spend, or runway based on MRR — those decisions are based on a number that's wrong.

### They Hide Your Real Churn Rate

If you have 200 active subscriptions but 15 are ghosts, your real customer count is 185. When one of those ghosts finally gets canceled (or you clean them up), it looks like churn — even though the customer actually left months ago.

This creates spiky, unpredictable churn numbers that make it impossible to identify real trends. For more on why subscriptions get cancelled and which ones you can save, see [why Stripe subscriptions get cancelled](/blog/stripe-subscription-cancel-reasons).

### They Waste Your Resources

Ghost subscribers still take up seats in your system. They might still receive emails, still be counted in your user analytics, and still consume support resources if they occasionally log in.

### They Create Chargeback Risk

Here's the worst case: a ghost subscriber's card suddenly works again (maybe they got a new card with the same number), Stripe charges them, and they don't recognize the charge. Dispute. Chargeback. You lose the money plus a $15 fee.

## How Do You Find Stuck Subscriptions in Stripe?

### In Stripe

1. Go to **Subscriptions** in your Stripe Dashboard
2. Filter by status: **Active** and **Past Due**
3. Export the list to CSV
4. Look at the "Current Period Start" and last successful charge date
5. Any subscription where the gap between "current period start" and last successful payment is more than one billing cycle is a ghost

**Pro tip:** Use the Stripe API to automate this:

```
stripe subscriptions list --status=past_due --created[lt]=1709251200
```

This lists all past_due subscriptions created before a specific date.

### In Paddle

Paddle handles dunning differently — it will automatically cancel subscriptions after failed payments (typically 30 days). But check your dunning settings:

1. Go to **Paddle Dashboard → Subscriptions**
2. Filter by **Past Due**
3. Check how long each subscription has been in this state

Paddle's automatic cancellation means fewer long-term ghosts, but the past_due window still inflates your metrics.

### In Polar

Polar is newer and has simpler subscription management, but the same principle applies:

1. Check your subscriber list for failed payment flags
2. Look for subscriptions with recent failed charges but no successful ones
3. Cross-reference your active subscriber count with actual payments received

## How Much Revenue Do SaaS Companies Lose to Stuck Subscriptions?

After scanning hundreds of SaaS billing accounts, here is what RevReclaim typically finds:

| Business Size | Avg Stuck Subscriptions | Monthly MRR Inflation |
|---------------|------------------------|----------------------|
| $5K-$15K MRR | 3-8 subscriptions | $200-$600 |
| $15K-$50K MRR | 8-20 subscriptions | $600-$2,000 |
| $50K-$150K MRR | 15-40 subscriptions | $1,500-$5,000 |
| $150K+ MRR | 30-80+ subscriptions | $3,000-$10,000+ |

The pattern is consistent: **roughly 3-7% of "active" subscriptions are ghosts** at any given time.

## How Do You Fix Stuck Subscriptions?

### Step 1: Identify and Tag

Export your subscription data and identify every subscription with no successful payment in 45+ days. Tag them in your system.

### Step 2: Attempt Recovery (Don't Just Cancel)

Before canceling, try to win these customers back:

- **Send a personal email** — "Hey, we noticed your payment didn't go through. Want to update your card?" Many customers didn't realize their card expired.
- **Offer a billing page link** — Make it one click to update their payment method.
- **Set a deadline** — "If we don't hear back in 7 days, we'll pause your subscription to avoid any unexpected charges."

Recovery emails for stuck subscriptions have a surprisingly high success rate — **15-25% of ghosts will update their payment info** when contacted directly.

### Step 3: Cancel the Unrecoverable

After your recovery attempt, cancel any subscriptions that didn't respond. This hurts your MRR number in the short term, but it gives you accurate data to work with.

Better to know you have $17K real MRR than to think you have $18K.

### Step 4: Prevent Future Ghosts

- **Enable card update emails** — Stripe can automatically email customers when their card is about to expire.
- **Set dunning limits** — Don't let subscriptions stay in "past_due" forever. Set a maximum retry period (we recommend 30 days), then auto-cancel.
- **Monitor weekly** — Check your stuck subscription count every week. It should stay below 3% of total subscriptions.

## How Can RevReclaim Detect Stuck Subscriptions Automatically?

Going through all of this manually takes hours. And you need to do it regularly — ghosts accumulate every month.

RevReclaim scans your billing account and identifies stuck subscriptions automatically. You get:

- **Exact count** of stuck subscriptions with dollar amounts
- **Recovery priority list** — which ghosts are most likely to recover
- **MRR correction** — what your real MRR is vs. what Stripe reports
- **Action steps** — exactly what to do about each one

The scan takes 60 seconds and uses read-only access. Billing data stays on the customer's billing platform.

[Find your stuck subscriptions now →](/scan)

---

## Frequently Asked Questions

### What is a stuck subscription in SaaS?
A stuck subscription is a subscription that remains technically active in a billing system like Stripe, Paddle, or Polar but has not had a successful payment in 30 or more days. Stuck subscriptions inflate MRR, hide real churn rates, and create chargeback risk. RevReclaim identifies stuck subscriptions automatically with exact dollar amounts.

### How many stuck subscriptions does the average SaaS company have?
RevReclaim's scan data shows that SaaS companies in the $5K-$15K MRR range have 3-8 stuck subscriptions on average, inflating MRR by $200-$600 per month. Companies at $50K-$150K MRR have 15-40 stuck subscriptions, inflating MRR by $1,500-$5,000 per month.

### Can stuck subscriptions be recovered?
Yes. Recovery emails sent to ghost subscribers have a 15-25% success rate. RevReclaim provides a recovery priority list showing which stuck subscriptions are most likely to be recovered, along with exact dollar amounts and recommended actions.

### How do stuck subscriptions affect MRR accuracy?
Stuck subscriptions inflate reported MRR by counting subscriptions that have not generated actual revenue. For example, 10 stuck subscriptions at $99/month overstates MRR by $990/month or $11,880/year. RevReclaim calculates the exact MRR correction needed.
