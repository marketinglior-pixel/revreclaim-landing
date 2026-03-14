---
title: "Why Stripe Payments Fail and How to Fix Each Type (Including Smart Retries)"
description: "Complete guide to Stripe payment failures: every decline code explained, how Smart Retries work, how to configure dunning for maximum recovery, and what to do when retries fail."
date: "2026-03-14"
lastModified: "2026-03-14"
author: "RevReclaim Team"
tags: ["payment failed stripe", "stripe smart retries", "Stripe decline codes", "dunning", "failed payment recovery", "subscription billing"]
canonical: "https://revreclaim.com/blog/payment-failed-stripe-smart-retries"
---

When a payment fails in Stripe, the decline code tells you exactly why — and whether you can recover it. Not all failures are equal. An `expired_card` is 80% recoverable. A `stolen_card` is 10%. Knowing the difference between them is the difference between leaving money on the table and building a recovery system that actually works.

This post covers every Stripe decline code you'll encounter, how Stripe Smart Retries decide when to retry, and the exact dunning configuration that maximizes recovery rates.

## Every Stripe Decline Code Explained

When a payment fails, Stripe returns a decline code from the card issuer. Here's the complete reference table with recovery strategies for each:

### High Recovery (60-90%)

| Decline Code | What It Means | Recovery Rate | What To Do |
|-------------|---------------|---------------|------------|
| `expired_card` | Card has passed its expiration date | 70-80% | Email customer with payment update link. Most customers have a new card already. |
| `insufficient_funds` | Not enough money in the account | 60-70% | Retry in 3-5 days. Timing matters — retry after typical paydays (1st, 15th). |
| `incorrect_cvc` | Wrong security code entered | 80-90% | Usually a one-time checkout error. Customer retry fixes it immediately. |
| `authentication_required` | 3D Secure / SCA verification needed | 85-90% | Send customer a payment link that triggers the 3DS flow. |
| `processing_error` | Temporary issue at bank or Stripe | 90%+ | Retry automatically in 1-2 hours. Almost always succeeds on retry. |

### Medium Recovery (30-50%)

| Decline Code | What It Means | Recovery Rate | What To Do |
|-------------|---------------|---------------|------------|
| `card_declined` | Generic decline from issuer (no specific reason) | 40-50% | Retry with Smart Retries. If retries fail, email customer to try a different card. |
| `try_again_later` | Temporary hold on the card | 40-50% | Retry in 24-48 hours. Usually resolves itself. |
| `card_velocity_exceeded` | Too many transactions in a short period | 35-45% | Retry in 24 hours. The customer's spending limit resets daily. |

### Low Recovery (10-30%)

| Decline Code | What It Means | Recovery Rate | What To Do |
|-------------|---------------|---------------|------------|
| `do_not_honor` | Bank refused without explanation | 20-30% | Email customer to contact their bank or try a different card. |
| `lost_card` | Card reported lost to the issuer | 10-20% | Email customer to update payment method with their new card. |
| `stolen_card` | Card reported stolen to the issuer | 10-15% | Email customer. Do not retry — the card is permanently blocked. |
| `pickup_card` | Bank wants the card back (fraud flag) | 5-10% | Do not retry. Contact customer to use a different payment method. |
| `fraudulent` | Bank suspects fraud | 5-10% | Do not retry. If the customer is legitimate, ask them to contact their bank. |

### Key Insight

**Your decline code distribution determines your recovery ceiling.** If 60% of your failures are `expired_card` and `insufficient_funds`, you have a high recovery ceiling (60-70%). If 60% are `do_not_honor` and `stolen_card`, your ceiling is much lower (20-30%).

Check your distribution before choosing recovery strategies. The [failed payments guide](/blog/find-failed-payments-stripe) shows how to pull your decline code breakdown from Stripe.

## How Stripe Smart Retries Work

Stripe Smart Retries is a machine learning system that decides when to retry failed payments. Instead of retrying on a fixed schedule, it analyzes patterns across Stripe's entire network to find the optimal retry time.

### What Smart Retries Actually Do

1. **Analyze the decline code** — Different codes have different optimal retry windows
2. **Check historical patterns** — When did similar customers' payments succeed on retry?
3. **Consider timing** — Time of day, day of week, day of month all affect success rates
4. **Factor in the card network** — Visa, Mastercard, and Amex have different retry behaviors
5. **Choose the optimal retry time** — Stripe picks the moment with the highest probability of success

### Smart Retries vs. Fixed Schedule

| Feature | Smart Retries | Fixed Schedule |
|---------|--------------|----------------|
| Retry timing | ML-optimized per transaction | Same intervals for everyone |
| Success rate | 10-15% higher than fixed schedule | Baseline |
| Configuration | Enable in dashboard | Set manual intervals |
| Network data | Uses data from millions of businesses | Uses only your data |
| Cost | Free (included in Stripe) | Free |

**Bottom line:** Smart Retries should always be enabled. There is no downside. It's free, it uses more data than you have, and it consistently outperforms fixed schedules.

### How to Enable Smart Retries

1. Go to **Settings → Billing → Subscriptions and emails**
2. Under **Manage failed payments**, find **Use Smart Retries**
3. Toggle it on
4. Set the retry period (recommended: 4 weeks)

That's it. Stripe handles the rest.

### What Smart Retries Can't Fix

Smart Retries optimize timing. They can't fix underlying problems:

- **Expired cards** — No amount of retrying will make an expired card work. The customer needs to update it.
- **Stolen/lost cards** — Permanently blocked. Retrying is useless.
- **Insufficient funds (chronic)** — If the customer consistently has insufficient funds, retries will keep failing.

For these cases, you need dunning emails — direct communication with the customer.

## The Complete Dunning Configuration Guide

Dunning is the process of communicating with customers about failed payments. Stripe's built-in dunning is basic but functional. Here's how to configure it for maximum recovery.

### Step 1: Enable Customer Emails

**Settings → Billing → Subscriptions and emails → Customer emails**

Enable these email types:
- **Payment failed** — Sent when a charge is declined
- **Upcoming renewal** — Sent before the next charge (gives customers time to update expired cards)
- **Final payment attempt** — Sent before the last retry

**Impact:** Enabling customer failure emails alone recovers 20-30% more failed payments. This is the single highest-ROI billing configuration change for most SaaS companies.

**RevReclaim's scan data:** [41% of Stripe accounts have customer failure emails disabled](/blog/saas-billing-leak-statistics). If yours is one of them, enable it today.

### Step 2: Configure Retry Windows

**Settings → Billing → Subscriptions and emails → Manage failed payments**

Recommended settings:

- **Smart Retries:** Enabled
- **Retry period:** 4 weeks (28 days)
- **After all retries fail:** Cancel the subscription

Why 4 weeks? It gives the customer a full billing cycle to update their payment method. Shorter windows (1-2 weeks) miss customers who don't check email frequently. Longer windows (6+ weeks) create [ghost subscriptions](/blog/ghost-subscriptions-saas) that inflate your MRR.

### Step 3: Set Up Webhook Alerts for Your Team

Don't rely solely on Stripe's automated emails. Set up internal alerts so your team knows about high-value failures in real-time.

```javascript
// Webhook handler for failed payments
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const amount = invoice.amount_due / 100;
    const attempt = invoice.attempt_count;

    // Alert for high-value failures
    if (amount >= 100) {
      await sendSlackAlert({
        message: `Payment failed: $${amount} (attempt ${attempt})`,
        customer: invoice.customer_email,
        declineCode: invoice.last_payment_error?.decline_code,
        invoiceUrl: invoice.hosted_invoice_url,
      });
    }

    // Final attempt — personal outreach needed
    if (attempt >= 3 && amount >= 50) {
      await sendPersonalOutreachEmail({
        to: invoice.customer_email,
        amount,
        updateUrl: invoice.hosted_invoice_url,
      });
    }
  }

  res.json({ received: true });
});
```

### Step 4: Build a Dunning Email Sequence

Stripe's built-in emails are functional but generic. For maximum recovery, supplement them with your own sequence:

| Day | Email | Purpose |
|-----|-------|---------|
| Day 0 | Payment failed notification | Inform customer, include update link |
| Day 3 | Friendly reminder | "Quick heads-up — your payment still hasn't gone through" |
| Day 7 | Urgency email | "Your subscription will be cancelled if payment isn't updated" |
| Day 14 | Final warning | "Last chance to keep your account active" |
| Day 21 | Cancellation notice | "Your subscription has been cancelled. Here's how to reactivate" |

**Key principles:**
- Include a one-click payment update link in every email
- Keep emails short and personal (from a person, not "the billing team")
- State the consequence clearly — "your account will lose access on [date]"
- Make it easy to fix — the customer should be one click away from resolution

## What to Do When Smart Retries and Dunning Both Fail

Even with perfect configuration, some payments won't be recovered. Here's the decision framework for what comes next:

### For High-Value Subscriptions ($100+/mo)

1. **Personal email from the founder or account manager.** Not a template. A real email: "Hi [name], your $[amount] payment for [product] didn't go through. Is everything okay?"
2. **Phone call if no response in 3 days.** Yes, a phone call. For a $200/mo customer, a 5-minute call that prevents cancellation is worth $2,400/year.
3. **Offer alternative payment methods.** Some customers can't use credit cards (corporate policies, spending limits). Offer invoicing, ACH, or wire transfer for high-value accounts.

### For Medium-Value Subscriptions ($30-$100/mo)

1. **Send a personal-feeling automated email.** Use their name, mention their specific plan, include the exact amount.
2. **Wait 5 days.** Then send one follow-up.
3. **If still unpaid after 14 days,** let it cancel. The cost of continued outreach exceeds the revenue.

### For Low-Value Subscriptions (under $30/mo)

1. **Rely on automated dunning** (Smart Retries + Stripe emails + your email sequence).
2. **No manual follow-up.** The math doesn't support it.
3. **After cancellation,** add to a win-back sequence 30-60 days later.

## How Much Money Are Failed Payments Costing You?

Here's the formula:

```
Monthly cost = Failed charges × Average charge amount × (1 - Recovery rate)
```

**Example at $50K MRR:**
- 45 failed charges/month
- Average charge: $111
- Current recovery rate: 25% (Smart Retries only, no dunning emails)
- Monthly cost: 45 × $111 × 0.75 = **$3,746/month**
- Annual cost: **$44,955**

**With optimized dunning (60% recovery):**
- Monthly cost: 45 × $111 × 0.40 = **$1,998/month**
- Annual savings: **$20,976**

The difference between a basic setup and an optimized one is $20,976/year. The configuration takes less than an hour.

## Find Your Failed Payment Cost

RevReclaim scans your Stripe account and calculates the exact cost of failed payments — not estimates, not industry averages, your actual numbers. The scan shows:

- Every failed payment with its decline code and recovery probability
- Your current recovery rate vs. what's achievable with better configuration
- The dollar amount you're losing each month
- Which specific customers to contact first (sorted by amount × recovery probability)

[Run a free scan](/scan). It takes 60 seconds with read-only access.

For the full list of billing issues beyond failed payments, see [5 types of revenue leaks every SaaS founder should audit](/blog/five-types-revenue-leaks-saas).

---

## Frequently Asked Questions

### What are Stripe Smart Retries?

Stripe Smart Retries is a machine learning system that automatically retries failed payments at the optimal time. Instead of retrying on a fixed schedule, it analyzes the decline code, card network, time of day, and patterns from millions of businesses across Stripe's network to pick the moment with the highest probability of success. Smart Retries is free, built into Stripe, and recovers 10-15% more failed payments than fixed retry schedules. Enable it in Settings → Billing → Subscriptions and emails.

### What is the most common reason Stripe payments fail?

The most common Stripe payment failure is `card_declined` (generic decline from the card issuer), followed by `insufficient_funds` and `expired_card`. Together, these three codes account for approximately 70-80% of all Stripe payment failures. The good news: all three have moderate to high recovery rates (40-80%) with proper dunning. The biggest factor in recovery is whether customer failure emails are enabled — [41% of Stripe accounts have them disabled](/blog/saas-billing-leak-statistics), which means customers don't know their payment failed.

### How many times should Stripe retry a failed payment?

Stripe recommends 3-4 retries over a 3-4 week period, and this is the default with Smart Retries enabled. Extending the retry window to 4 weeks (28 days) gives customers a full billing cycle to update their payment method. Going beyond 4 weeks is not recommended — it creates [ghost subscriptions](/blog/ghost-subscriptions-saas) that inflate your MRR without generating revenue. The retry count matters less than the retry timing — Smart Retries optimizes timing automatically based on network-wide data.

### Should I cancel subscriptions after all payment retries fail?

Yes. Set Stripe to cancel the subscription after all retries are exhausted (Settings → Billing → Manage failed payments → "Cancel the subscription"). The alternative — leaving subscriptions in `past_due` or `unpaid` status — creates ghost subscriptions that inflate your reported MRR, consume server resources, and require manual cleanup. Cancelled subscriptions can still be recovered through win-back campaigns. Ghost subscriptions just rot silently. See our [ghost subscriptions guide](/blog/ghost-subscriptions-saas) for the full argument.
