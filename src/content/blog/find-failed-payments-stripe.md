---
title: "How to Find Failed Payments in Your Stripe Dashboard (Step-by-Step)"
description: "A step-by-step guide to finding, analyzing, and recovering failed payments in Stripe. Learn how to reduce involuntary churn and recover thousands in lost SaaS revenue."
date: "2026-03-04"
lastModified: "2026-03-08"
author: "RevReclaim Team"
tags: ["Stripe", "failed payments", "dunning", "involuntary churn", "payment recovery"]
canonical: "https://revreclaim.com/blog/find-failed-payments-stripe"
---

A failed payment in Stripe occurs when a customer's card is declined during a subscription renewal or one-time charge. The average SaaS business has a 4-8% failed payment rate, meaning $1,200-$2,400 per month goes uncollected on $30K MRR. Most failed payments are recoverable through proper dunning configuration and customer notification. RevReclaim scans failed payments, categorizes them by decline reason, and provides a prioritized recovery list.

## How Do You Find Failed Payments in Stripe?

### In the Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Payments** in the left sidebar
3. Click the **Status** filter dropdown
4. Select **Failed**
5. Set the date range to **Last 30 days**

You'll see a list of every failed charge in the last month. Each entry shows the amount, customer, failure reason, and date.

### Via the Stripe API

For a more detailed view, use the API:

```
curl https://api.stripe.com/v1/charges \
  -u sk_live_your_key: \
  -d "status=failed" \
  -d "created[gte]=1709251200" \
  -d "limit=100"
```

Or in your code:

```javascript
const failedCharges = await stripe.charges.list({
  status: 'failed',
  created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
  limit: 100,
});
```

## Why Do Payments Fail in Stripe?

Not all failures are the same. Stripe provides specific decline codes that tell you why a payment failed. Here are the most common ones and what they mean:

### Card-Related Failures (Most Common)

| Decline Code | What It Means | Recovery Chance |
|-------------|---------------|-----------------|
| `card_declined` | Generic decline from the card issuer | Medium (40-50%) |
| `insufficient_funds` | Customer doesn't have enough money | High (60-70%) |
| `expired_card` | Card has expired | High (70-80%) |
| `incorrect_cvc` | Wrong security code entered | High (80-90%) |

### Account-Related Failures

| Decline Code | What It Means | Recovery Chance |
|-------------|---------------|-----------------|
| `authentication_required` | 3D Secure / SCA needed | Very High (85%+) |
| `do_not_honor` | Bank refused without explanation | Low (20-30%) |
| `lost_card` / `stolen_card` | Card was reported lost or stolen | Low (10-20%) |
| `processing_error` | Temporary issue at bank or Stripe | Very High (90%+) |

### Why This Matters

If most of your failures are `expired_card` or `insufficient_funds`, you have a high recovery opportunity. If they're `lost_card` or `do_not_honor`, recovery is harder.

**To check your decline code breakdown:**
1. Go to Stripe Dashboard → **Payments** → Filter **Failed**
2. Click into individual payments to see the decline code
3. Or use the Stripe API to export all decline codes and group them

## How Should You Configure Stripe Dunning Settings?

Dunning is the process of automatically retrying failed payments and notifying customers. Stripe has built-in dunning, but the default settings are not optimized.

### Find Your Current Settings

1. Go to **Settings** → **Billing** → **Subscriptions and emails**
2. Look at the **Manage failed payments** section
3. Check three things:
   - **Smart Retries** — Is it enabled? (It should be)
   - **Customer emails** — Are they turned on for failed payments?
   - **Subscription status after all retries fail** — What happens?

### Recommended Dunning Configuration

Here's what works best for most SaaS businesses:

- **Smart Retries:** Enabled (Stripe's ML-based retry timing)
- **Retry schedule:** Up to 4 retries over 3-4 weeks
- **Customer email on failure:** Enabled
- **After all retries fail:** Mark subscription as "Canceled" (not "Unpaid")
- **Send final email:** Enabled

### The Problem With Defaults

Stripe's default configuration will retry 3-4 times and then either cancel the subscription or leave it in an "unpaid" state. The customer never gets an email. They have no idea their card failed.

**Enabling customer emails alone can recover 20-30% more failed payments** — because the customer finds out there's a problem and updates their card.

## How Much Revenue Do Failed Payments Cost?

Now let's quantify the damage. Here's a simple formula:

**Monthly Revenue Lost to Failed Payments =**
(Number of failed charges) × (Average charge amount) × (1 - Recovery rate)

For example:
- 45 failed charges in the last month
- Average charge: $79
- Current recovery rate: 30% (Stripe retries only, no emails)

**Monthly loss = 45 × $79 × 0.70 = $2,488.50**

That's nearly $30,000/year.

### What "Recovery Rate" Should You Target?

| Recovery Method | Typical Rate |
|----------------|-------------|
| Stripe auto-retry only (no emails) | 15-25% |
| Stripe auto-retry + customer emails | 35-45% |
| Auto-retry + emails + manual follow-up | 50-65% |
| Auto-retry + emails + smart dunning tool | 60-75% |

Most founders are stuck at 15-25% because they never turned on customer emails.

## How Do You Set Up Failed Payment Alerts in Stripe?

Don't wait for month-end reviews. Set up alerts so you know about failed payments in real-time.

### Option 1: Stripe Webhook

Listen for the `charge.failed` webhook event. When it fires, send yourself a Slack notification or email:

```javascript
// Webhook handler for failed charges
if (event.type === 'charge.failed') {
  const charge = event.data.object;
  console.log(`Failed: $${charge.amount / 100} from ${charge.customer}`);
  // Send alert to your team
}
```

### Option 2: Stripe Dashboard Alerts

1. Go to **Settings** → **Team and security**
2. Under **Notifications**, enable email alerts for failed payments
3. Set the threshold (e.g., alert when more than 5 payments fail in a day)

### Option 3: Weekly Metric Review

At minimum, add this to your weekly founder review:

- Total failed payments this week (count and dollar amount)
- Failed payment rate (failed / total attempted)
- Recovery rate (retried successfully / total failed)
- Net revenue lost

## How Do You Recover High-Value Failed Payments?

Not all failed payments are equal. A $499/mo enterprise customer is worth more recovery effort than a $9/mo individual plan.

### Priority Recovery Process

1. **Sort failed payments by amount** (highest first)
2. **For charges over $100:**
   - Send a personal email (not automated)
   - Mention the specific amount and what it's for
   - Include a direct link to update their payment method
   - Follow up in 3 days if no response
3. **For charges $50-$100:**
   - Send a well-crafted automated email
   - Include a one-click payment update link
4. **For charges under $50:**
   - Rely on Stripe's automated retries and dunning emails
   - Review in aggregate monthly

### Email Template for High-Value Recovery

Here's what actually works:

> Subject: Quick heads-up about your [Product] subscription
>
> Hey [Name],
>
> Just wanted to let you know — your payment of $[amount] for [Product] didn't go through on [date]. It looks like [reason — e.g., "your card on file has expired"].
>
> You can update your payment info here: [one-click link]
>
> Takes about 30 seconds. If you have any questions, just reply to this email.
>
> Best,
> [Your name]

Keep it short, personal, and make the fix easy.

## How Can RevReclaim Automate Failed Payment Recovery?

Manual review works — but it takes hours of manual work. Exporting data, analyzing decline codes, cross-referencing recovery rates, following up on individual customers.

RevReclaim does all of this automatically:

- **Scans your failed payments** and categorizes them by decline reason
- **Calculates your exact revenue loss** from failed charges
- **Identifies high-recovery opportunities** (expired cards, insufficient funds)
- **Gives you a prioritized action list** — which customers to contact first
- **Tracks your recovery rate** over time

RevReclaim completes the scan in 60 seconds using read-only access.

[See how much you're losing to failed payments →](/scan)

---

## Frequently Asked Questions

### What is the average failed payment rate for SaaS businesses?
The average SaaS business has a 4-8% failed payment rate. On $30K MRR, that means $1,200-$2,400 per month in charges that did not go through. RevReclaim scans billing accounts to calculate the exact failed payment rate and revenue impact.

### What are the most common Stripe decline codes?
The most common Stripe decline codes are card_declined (generic decline, 40-50% recovery), insufficient_funds (60-70% recovery), expired_card (70-80% recovery), and authentication_required (85%+ recovery). RevReclaim categorizes failed payments by decline code and recovery probability.

### How much can dunning recover from failed payments?
Stripe auto-retry alone recovers 15-25% of failed payments. Adding customer failure emails increases recovery to 35-45%. Combining auto-retry, customer emails, and manual follow-up recovers 50-65%. RevReclaim identifies the highest-recovery opportunities in each billing account.

### Should you enable customer failure emails in Stripe?
Yes. Enabling customer failure emails in Stripe recovers 20-30% more failed payments by notifying customers when their card is declined. This setting is off by default in Stripe and takes under 5 minutes to enable. It is the single highest-impact billing configuration change most SaaS founders can make.
