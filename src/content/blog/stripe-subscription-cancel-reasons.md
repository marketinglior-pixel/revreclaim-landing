---
title: "Why Stripe Subscriptions Get Cancelled (And Which Ones You Can Save)"
description: "Stripe subscription cancellations fall into two categories: voluntary and involuntary. Learn the 5 most common cancellation reasons, how to identify saveable churned subscribers, and reduce your subscription churn rate."
date: "2026-03-14"
lastModified: "2026-03-14"
author: "RevReclaim Team"
tags: ["stripe subscription cancel", "subscription churn rate", "involuntary churn", "voluntary churn", "SaaS churn", "Stripe cancellations"]
canonical: "https://revreclaim.com/blog/stripe-subscription-cancel-reasons"
---

Every Stripe subscription cancel event falls into one of two categories: the customer chose to leave, or the billing system forced them out. The first is voluntary churn. The second is involuntary churn. Most SaaS founders treat them the same. They shouldn't — because involuntary churn is almost entirely preventable.

Industry data shows that 20-40% of all SaaS churn is involuntary. That means up to 40% of your cancelled subscriptions didn't want to leave. Their card expired. A payment failed. Nobody followed up. The subscription cancelled automatically.

This post breaks down the 5 most common reasons Stripe subscriptions get cancelled, which ones are saveable, and how to reduce your subscription churn rate by fixing the preventable cancellations first.

## The 5 Reasons Stripe Subscriptions Get Cancelled

### 1. Failed Payment → Automatic Cancellation (Involuntary)

**How common:** 20-40% of all cancellations
**Saveable:** Yes — 60-75% recovery rate with proper dunning

This is the #1 source of preventable churn. A customer's credit card declines — expired card, insufficient funds, bank flag — and Stripe's retry cycle begins. If all retries fail and your dunning settings are configured to cancel after exhausting retries, the subscription is cancelled automatically.

The customer never decided to leave. They might not even know their subscription was cancelled until they try to log in.

**How it happens in Stripe:**

1. Subscription renewal triggers a charge
2. Charge fails (decline code: `expired_card`, `insufficient_funds`, `card_declined`, etc.)
3. Stripe retries based on your Smart Retries or custom schedule (default: 3-4 retries over ~3 weeks)
4. All retries fail
5. Subscription status moves to `canceled` (or `past_due` / `unpaid` depending on your settings)

**What your settings determine:**

In **Settings → Billing → Subscriptions and emails → Manage failed payments**, you control what happens after all retries fail:

- **Cancel the subscription** — The subscription ends. The customer loses access.
- **Mark as unpaid** — The subscription stays active but unpaid. The customer may still have access.
- **Leave as past_due** — The subscription lingers in a broken state. This is what creates [ghost subscriptions](/blog/ghost-subscriptions-saas).

**The fix:** Configure proper dunning. Enable customer failure emails (off by default). Extend retry windows. See our [complete failed payments guide](/blog/find-failed-payments-stripe) for step-by-step setup.

### 2. Customer-Initiated Cancellation (Voluntary)

**How common:** 40-60% of all cancellations
**Saveable:** Partially — 5-15% can be retained with exit offers

The customer deliberately cancels. They click the cancel button in your app, email support, or cancel through Stripe's customer portal.

Common voluntary cancellation reasons:

- **No longer need the product** — They solved the problem, changed roles, or shut down their business
- **Switched to a competitor** — Found a cheaper or better alternative
- **Too expensive** — The product doesn't justify the price at their scale
- **Not using it enough** — Signed up with good intentions, never built the habit
- **Poor experience** — Bugs, slow support, missing features

**What Stripe tells you:** Not much. The `customer.subscription.deleted` webhook fires, but it doesn't include a cancellation reason unless you've built a cancellation flow that captures one.

**The fix:** Add a cancellation survey in your app. Even a single dropdown ("Why are you cancelling?") gives you data to act on. If "too expensive" is the top reason, consider a downgrade path. If "not using it enough," build onboarding improvements.

### 3. Card Expiration Without Update (Involuntary)

**How common:** 10-15% of all cancellations
**Saveable:** Yes — 80-90% prevention rate with pre-dunning

Every credit card has an expiration date. On average, 2-3% of your customers' cards expire every month. That's not a failure — it's math.

When an expired card is charged, the payment fails. If the customer doesn't update their card before retries exhaust, the subscription cancels.

**What makes this different from #1:** This cancellation is 100% predictable. You know the exact date every card will expire. You can email the customer 30 days before it happens.

**How to prevent it:**

```javascript
// Find subscriptions with cards expiring in the next 30 days
const customers = await stripe.customers.list({ limit: 100 });

for (const customer of customers.data) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card',
  });

  for (const pm of paymentMethods.data) {
    const expMonth = pm.card.exp_month;
    const expYear = pm.card.exp_year;
    const now = new Date();
    const expDate = new Date(expYear, expMonth - 1); // Month is 0-indexed

    const daysUntilExpiry = (expDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
      console.log(`Card expiring soon: ${customer.email} - ${expMonth}/${expYear}`);
      // Send pre-dunning email with payment update link
    }
  }
}
```

**RevReclaim detects expiring cards automatically** and calculates the probability-weighted revenue at risk. [Run a free scan](/scan) to see how many of your customers have cards expiring in the next 90 days.

### 4. Subscription Stuck in Past Due → Eventually Cancelled (Involuntary)

**How common:** 5-10% of all cancellations
**Saveable:** Yes — but requires manual intervention

Some subscriptions don't cancel immediately after failed payments. They enter `past_due` status and sit there. For weeks. Sometimes months.

This happens when your Stripe settings are configured to leave failed subscriptions in `past_due` instead of cancelling them. The subscription is technically active, but no revenue is being collected.

Eventually, one of three things happens:

1. **You notice and manually cancel** — Revenue was lost for the entire `past_due` period
2. **The customer notices and updates their card** — Best case, but passive
3. **Nobody notices and it sits forever** — The worst case. It inflates your MRR, consumes resources, and never generates revenue

These are [ghost subscriptions](/blog/ghost-subscriptions-saas). RevReclaim finds them in 78% of billing accounts.

**The fix:** Set a hard deadline. If a subscription is `past_due` for more than 14-21 days, either cancel it or escalate to a personal outreach campaign. Don't let subscriptions rot in `past_due` indefinitely.

### 5. Trial Expiration Without Conversion (Expected)

**How common:** 15-25% of all cancellations
**Saveable:** Partially — 10-20% can convert with follow-up sequences

Free trial → no card entered → trial expires → subscription cancels (or moves to `incomplete_expired`).

This is normal. Not every trial converts. Industry average trial-to-paid conversion rate is 15-25% for opt-in trials (no card required) and 40-60% for opt-out trials (card required).

**When it's a problem:** When your trial-to-paid rate is significantly below benchmarks, or when trials are expiring without any follow-up communication.

**The fix:** Build a trial nurture sequence. Email on day 1, mid-trial, 2 days before expiry, and day of expiry. Each email should demonstrate value delivered during the trial, not just remind them to upgrade.

## Subscription Churn Rate Benchmarks

Before you fix anything, know your baseline. Here's what "normal" looks like:

| Metric | Good | Average | Needs Work |
|--------|------|---------|------------|
| Monthly subscription churn rate | < 3% | 3-7% | > 7% |
| Annual subscription churn rate | < 30% | 30-50% | > 50% |
| Involuntary churn (% of total) | < 20% | 20-30% | > 30% |
| Failed payment recovery rate | > 50% | 30-50% | < 30% |
| Trial-to-paid conversion | > 25% | 15-25% | < 15% |

**How to calculate your subscription churn rate:**

```
Monthly churn rate = (Cancelled subscriptions in month / Active subscriptions at start of month) × 100
```

**How to split voluntary vs. involuntary:**

```javascript
// Count cancellations by type in the last 30 days
const events = await stripe.events.list({
  type: 'customer.subscription.deleted',
  created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
  limit: 100,
});

let voluntary = 0;
let involuntary = 0;

for (const event of events.data) {
  const subscription = event.data.object;

  // If the cancellation reason is related to payment failure
  if (subscription.cancellation_details?.reason === 'payment_failed') {
    involuntary++;
  } else {
    voluntary++;
  }
}

console.log(`Voluntary: ${voluntary}, Involuntary: ${involuntary}`);
console.log(`Involuntary %: ${((involuntary / (voluntary + involuntary)) * 100).toFixed(1)}%`);
```

If your involuntary churn is above 30% of total churn, your billing configuration is the problem — not your product.

## How to Reduce Your Subscription Churn Rate

Prioritize by impact and effort:

### Step 1: Fix Involuntary Churn First (Biggest ROI)

Enable customer failure emails in Stripe. This single setting recovers 20-30% more failed payments. It takes 5 minutes.

1. Go to **Settings → Billing → Subscriptions and emails**
2. Enable **Send emails when payments fail**
3. Enable **Smart Retries** if not already on

This alone can drop your involuntary churn by 30-50%.

### Step 2: Add Pre-Dunning for Expiring Cards

Email customers 30 days before their card expires. Include a direct link to update their payment method. This prevents the failed payment from ever happening.

[RevReclaim identifies every subscription with an expiring card](/scan) and calculates the revenue at risk.

### Step 3: Clean Up Ghost Subscriptions

Audit every subscription in `past_due` status. Decide: save it or cancel it. Don't let them accumulate. See our [ghost subscriptions guide](/blog/ghost-subscriptions-saas) for the full cleanup process.

### Step 4: Add a Cancellation Survey

You can't fix voluntary churn without understanding why customers leave. Add a cancellation flow that captures the reason. Even a simple dropdown improves your data quality dramatically.

### Step 5: Offer Downgrades Instead of Cancellations

If "too expensive" is a common cancellation reason, add a lower-priced tier. A customer paying $29/mo is better than a customer paying $0/mo.

## Find Your Preventable Cancellations

Most Stripe subscription cancellations are silent. The `customer.subscription.deleted` event fires, your MRR drops, and nobody investigates why.

RevReclaim scans your billing account for the preventable cancellation signals: failed payments without recovery, expiring cards without notification, ghost subscriptions stuck in `past_due`, and missing payment methods that guarantee future failures.

[Run a free scan](/scan) to see how many of your cancelled subscriptions were preventable — and how much revenue you can recover by fixing the billing configuration issues behind them.

For a complete billing audit beyond cancellations, follow the [step-by-step Stripe audit guide](/blog/audit-stripe-account-revenue-leaks).

---

## Frequently Asked Questions

### What percentage of Stripe subscription cancellations are involuntary?

Industry data shows 20-40% of all SaaS subscription cancellations are involuntary — caused by failed payments, expired cards, or billing system issues rather than a customer decision. RevReclaim's scan data shows the average SaaS company has a 28% involuntary churn rate. This means roughly 1 in 4 of your cancelled subscriptions didn't want to leave. Fixing billing configuration (enabling dunning emails, smart retries, and pre-dunning alerts) can reduce involuntary churn by 30-50%.

### What is a good subscription churn rate for SaaS?

A good monthly subscription churn rate is under 3%, which translates to roughly 30% annual churn. The SaaS industry average is 3-7% monthly. B2B SaaS companies targeting SMBs typically see 3-5% monthly churn, while enterprise-focused companies see 1-2%. If your churn rate is above 7% monthly, prioritize fixing involuntary churn first — it's the fastest path to improvement because it requires billing configuration changes, not product changes.

### How do I find out why customers are cancelling their Stripe subscriptions?

Stripe provides basic cancellation data through the `customer.subscription.deleted` webhook event and the `cancellation_details` field on the subscription object. For involuntary cancellations, check the `reason` field — `payment_failed` indicates a billing failure. For voluntary cancellations, you'll need to add a cancellation survey in your app that records the reason before triggering the Stripe cancellation. Without a survey, you're guessing. RevReclaim identifies involuntary cancellation patterns automatically by scanning your [failed payment history](/blog/find-failed-payments-stripe) and subscription lifecycle data.

### Can I recover a cancelled Stripe subscription?

It depends on the cancellation type. For involuntary cancellations (failed payments), you can create a new subscription once the customer updates their payment method — recovery rates are 60-75% with proper follow-up. For voluntary cancellations, win-back campaigns convert 5-15% of churned customers within 90 days. Stripe does not have a built-in "un-cancel" feature, so recovery always means creating a new subscription. The best approach is prevention: fix the billing issues that cause involuntary cancellations before they happen.
