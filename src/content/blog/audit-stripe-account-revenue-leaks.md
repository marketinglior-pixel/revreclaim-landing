---
title: "How to Audit Your Stripe Account for Revenue Leaks (2026)"
description: "A complete guide to auditing your Stripe billing for revenue leaks. 10 checks across subscriptions, coupons, pricing, and payments — with exact steps and code examples."
date: "2026-03-09"
lastModified: "2026-03-09"
author: "RevReclaim Team"
tags: ["Stripe", "billing audit", "revenue leakage", "SaaS billing", "MRR"]
canonical: "https://revreclaim.com/blog/audit-stripe-account-revenue-leaks"
---

94% of the SaaS accounts we've scanned have at least one billing leak. Not a bug. Not fraud. Just money sitting in your Stripe account that you earned but aren't collecting — because of expired coupons, ghost subscriptions, outdated pricing, or failed payments nobody noticed.

The average leak: **$2,340/month**. That's $28,000/year walking out the door.

This guide walks you through a complete Stripe billing audit — the same 10 checks RevReclaim runs automatically in 90 seconds. You can do them manually. It takes 2-4 hours depending on your customer count. Or you can [run a free scan](/scan) and get the same results in under 2 minutes.

## Why You Need a Stripe Billing Audit

Stripe is excellent infrastructure. It processes payments, manages subscriptions, handles webhooks. What it doesn't do is tell you when something is quietly wrong.

Your MRR dashboard shows aggregate numbers. It doesn't show:

- The coupon that expired 6 months ago but is still discounting 12 subscriptions
- The customer on your old $49/mo plan when new signups pay $79/mo
- The 3 subscriptions stuck in `past_due` for 30+ days that nobody canceled
- The card expiring next week on your highest-paying customer

These are revenue leaks. They compound every month. And they hide in the gap between your dashboard view and your individual subscription records.

## The 10-Point Stripe Billing Audit

Here's every check you should run, in order of typical impact.

### 1. Failed Payments

**What to look for:** Open invoices with failed payment attempts that haven't been recovered.

**How to check manually:**

1. Go to **Payments** → filter by **Status: Failed**
2. Set date range to **Last 30 days**
3. Note the total count and dollar amount

**Via the API:**

```javascript
const invoices = await stripe.invoices.list({
  status: 'open',
  limit: 100,
});

const failedInvoices = invoices.data.filter(
  inv => inv.attempted && inv.amount_remaining > 0
);

console.log(`${failedInvoices.length} failed invoices`);
console.log(`$${failedInvoices.reduce((sum, inv) => sum + inv.amount_remaining, 0) / 100} at risk`);
```

**Typical finding:** 4-8% of charges fail each month. On $50K MRR, that's $2,000-$4,000/mo in uncollected revenue.

**Fix:** Enable Smart Retries + customer failure emails in **Settings → Billing → Subscriptions and emails**. This alone recovers 20-30% more failed payments.

---

### 2. Ghost Subscriptions

**What to look for:** Subscriptions stuck in `past_due` or `unpaid` status for 14+ days. These customers aren't paying, but their subscription isn't canceled either. They're ghosts — consuming resources without generating revenue.

**How to check:**

```javascript
const subs = await stripe.subscriptions.list({
  status: 'past_due',
  limit: 100,
});

const ghosts = subs.data.filter(sub => {
  const daysSinceCreated = (Date.now() / 1000 - sub.created) / 86400;
  return daysSinceCreated > 14;
});

console.log(`${ghosts.length} ghost subscriptions`);
```

Also check `unpaid` status subscriptions and any subscription where the latest invoice has been open for more than 2 weeks.

**Typical finding:** 1-3% of subscriptions are ghosts. They inflate your "active" customer count and hide real churn.

**Fix:** Cancel ghosts that haven't paid in 30+ days. Send a final notice email first. For borderline cases, reach out directly.

---

### 3. Expiring Cards

**What to look for:** Active subscriptions where the customer's card expires within the next 90 days.

**How to check:**

```javascript
const now = new Date();
const threeMonthsOut = new Date(now.getFullYear(), now.getMonth() + 3, 1);

const subs = await stripe.subscriptions.list({
  status: 'active',
  expand: ['data.default_payment_method'],
  limit: 100,
});

const expiringSoon = subs.data.filter(sub => {
  const pm = sub.default_payment_method;
  if (!pm || pm.type !== 'card') return false;
  const expDate = new Date(pm.card.exp_year, pm.card.exp_month - 1);
  return expDate <= threeMonthsOut;
});

console.log(`${expiringSoon.length} cards expiring within 90 days`);
```

**Typical finding:** 5-15% of active cards expire within 90 days at any given time. Each one is a future failed payment waiting to happen.

**Fix:** Send proactive card update emails before the card expires. This is pre-dunning — fixing the problem before it becomes a failed payment.

---

### 4. Expired Coupons

**What to look for:** Coupons where `redeem_by` has passed, but they're still actively discounting subscriptions.

This is one of the most common leaks. Stripe lets you set a coupon expiry date, but that only controls when the coupon can be *redeemed* — it doesn't remove the coupon from subscriptions that already have it. A coupon that expired 2 years ago can still be discounting a customer's subscription today.

**How to check:**

```javascript
const coupons = await stripe.coupons.list({ limit: 100 });
const now = Math.floor(Date.now() / 1000);

const expired = coupons.data.filter(
  c => c.redeem_by && c.redeem_by < now
);

// For each expired coupon, check if any active subscriptions use it
for (const coupon of expired) {
  const subs = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
  });

  const affected = subs.data.filter(sub =>
    sub.discount && sub.discount.coupon.id === coupon.id
  );

  if (affected.length > 0) {
    console.log(`Coupon "${coupon.name}" expired but still on ${affected.length} subs`);
  }
}
```

**Typical finding:** 2-5 expired coupons still running, costing $200-$900/mo in unnecessary discounts.

**Fix:** Remove the discount from affected subscriptions. In Stripe: open the subscription → click the discount → delete it. The customer's next invoice will be at full price.

---

### 5. Never-Expiring Discounts

**What to look for:** Coupons with `duration: "forever"` and no `redeem_by` date. These run indefinitely — a 20% forever discount on a $100/mo plan costs $240/year. Every year. Forever.

**How to check:**

```javascript
const coupons = await stripe.coupons.list({ limit: 100 });

const forever = coupons.data.filter(
  c => c.duration === 'forever' && !c.redeem_by
);

console.log(`${forever.length} forever coupons with no end date`);
```

Then cross-reference with active subscriptions to find which ones are currently running.

**Typical finding:** 1-3 forever discounts, usually from early sales deals or beta pricing that was never cleaned up.

**Fix:** Decide case-by-case. Some forever discounts are intentional (partnership deals). Others were meant to be temporary. For the unintentional ones, switch to a time-limited discount or remove it with advance notice to the customer.

---

### 6. Legacy Pricing

**What to look for:** Active subscriptions on price IDs that are lower than your current published prices. This happens every time you raise prices — existing customers stay on the old rate.

**How to check:**

```javascript
// Get current (latest) prices per product
const prices = await stripe.prices.list({
  active: true,
  type: 'recurring',
  limit: 100,
});

// Group by product and find highest price per interval
const currentPrices = {};
for (const price of prices.data) {
  const key = `${price.product}_${price.recurring.interval}`;
  if (!currentPrices[key] || price.unit_amount > currentPrices[key].unit_amount) {
    currentPrices[key] = price;
  }
}

// Check active subscriptions against current prices
const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });

for (const sub of subs.data) {
  for (const item of sub.items.data) {
    const key = `${item.price.product}_${item.price.recurring.interval}`;
    const current = currentPrices[key];
    if (current && item.price.unit_amount < current.unit_amount) {
      const gap = (current.unit_amount - item.price.unit_amount) / 100;
      console.log(`${sub.customer} paying $${item.price.unit_amount / 100} vs current $${current.unit_amount / 100} (gap: $${gap}/mo)`);
    }
  }
}
```

**Typical finding:** 10-25% of customers are on old pricing after a price increase. The gap can be $5-$50/mo per customer.

**Fix:** This is a business decision, not a technical fix. Options: grandfather existing customers (accept the gap), migrate them with advance notice, or offer a loyalty rate that's between old and new pricing.

---

### 7. Missing Payment Methods

**What to look for:** Active subscriptions with no default payment method. These will fail on the next billing cycle.

**How to check:**

```javascript
const subs = await stripe.subscriptions.list({
  status: 'active',
  limit: 100,
});

const missing = subs.data.filter(sub => !sub.default_payment_method);

console.log(`${missing.length} active subs with no payment method`);
```

**Typical finding:** 1-3% of active subscriptions have no payment method. Often caused by payment method removals or migration issues.

**Fix:** Email these customers immediately with a link to update their payment method. They will churn on their next billing cycle otherwise.

---

### 8. Unbilled Overages

**What to look for:** Customers whose usage exceeds their plan limits but aren't being charged for the overage. Common with seat-based or usage-based pricing where the billing isn't properly configured.

**How to check:**

Compare `subscription.items.quantity` against actual usage. This requires integration with your own usage data — Stripe doesn't track product usage.

Look for subscriptions where:
- Quantity is 1 but the customer has 5 team members
- A metered billing item hasn't reported usage in 30+ days
- The plan has a usage cap that the customer exceeds

**Typical finding:** 2-5% of customers use more than they pay for. Often the highest-value customers.

**Fix:** Update quantities to match actual usage. For seat-based pricing, sync your user count to Stripe on every seat change.

---

### 9. Expired Trials

**What to look for:** Subscriptions stuck in `trialing` status well past the expected trial period.

**How to check:**

```javascript
const subs = await stripe.subscriptions.list({
  status: 'trialing',
  limit: 100,
});

const stuckTrials = subs.data.filter(sub => {
  const trialDays = (Date.now() / 1000 - sub.trial_start) / 86400;
  return trialDays > 45; // Most trials are 7-30 days
});

console.log(`${stuckTrials.length} trials running for 45+ days`);
```

**Typical finding:** 1-5 subscriptions in perpetual trial mode, usually from manual trial extensions or webhook failures.

**Fix:** Convert to paid or cancel. If the customer has been trialing for 60+ days without converting, they're unlikely to convert. Either end the trial (which triggers billing) or reach out to understand what's blocking the conversion.

---

### 10. Duplicate Subscriptions

**What to look for:** The same customer with multiple active subscriptions to the same product. Usually caused by failed upgrades, accidental signups, or checkout bugs.

**How to check:**

```javascript
const subs = await stripe.subscriptions.list({
  status: 'active',
  limit: 100,
});

// Group by customer
const customerSubs = {};
for (const sub of subs.data) {
  if (!customerSubs[sub.customer]) customerSubs[sub.customer] = [];
  customerSubs[sub.customer].push(sub);
}

// Find duplicates
for (const [customerId, subs] of Object.entries(customerSubs)) {
  if (subs.length > 1) {
    console.log(`Customer ${customerId} has ${subs.length} active subscriptions`);
  }
}
```

**Typical finding:** 0-2% of customers have duplicate subscriptions. This is a chargeback risk — customers who notice they're being double-charged may dispute rather than contact support.

**Fix:** Cancel the duplicate subscription and issue a prorated refund for the overlap period. Then investigate the root cause in your checkout flow.

---

## How Long Does a Manual Audit Take?

Honest answer: **2-4 hours** for an account with 200 customers. Longer if you have complex pricing or multiple products. You'll need to:

1. Export subscription data from Stripe
2. Cross-reference coupons, prices, and payment methods
3. Calculate the dollar impact of each finding
4. Prioritize which leaks to fix first
5. Actually fix them (another 1-2 hours)

And you should do this quarterly at minimum. Billing data drifts constantly — new coupons get created, prices change, cards expire.

## The Faster Option

RevReclaim runs all 10 checks automatically in under 90 seconds. You paste a read-only Stripe API key, and you get a report with:

- Every leak found, with customer name and dollar amount
- A health score (0-100) across 6 billing dimensions
- Direct links to fix each issue in your Stripe dashboard
- Prioritized by severity (critical leaks first)

No write access. No stored keys. No credit card required.

[Run a free audit on your Stripe account →](/scan)

---

## Frequently Asked Questions

### How often should I audit my Stripe account?
At minimum, quarterly. Revenue leaks compound over time — a $200/mo expired coupon costs $2,400/year if left unchecked. If you use RevReclaim's monitoring plan, scans run automatically and alert you to new leaks as they appear.

### What's the most common Stripe revenue leak?
Failed payments are the most common leak by dollar amount (22% of total leakage). Expired coupons are the most common by count — they tend to affect multiple subscriptions at once since one coupon can be applied to dozens of customers.

### Can I audit Stripe without write access?
Yes. Every check in this guide uses read-only API operations (list subscriptions, list invoices, list coupons). RevReclaim requires only read-only restricted keys — it cannot modify your billing data.

### How much revenue leakage is normal for SaaS?
Industry research from MGI Research puts the average at 1-5% of revenue. Our data from 847+ scanned accounts shows an average of 4.7% of MRR leaking. For a $50K MRR business, that's roughly $2,350/month or $28,000/year.

### Does Stripe have built-in leak detection?
No. Stripe provides billing infrastructure — payment processing, subscription management, invoicing. It does not analyze your billing data for configuration errors, expired coupons, legacy pricing gaps, or optimization opportunities. That's a different product category.
