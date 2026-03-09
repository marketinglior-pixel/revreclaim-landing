---
title: "Zombie Discounts: The Most Common Revenue Leak in SaaS"
description: "Zombie discounts are coupons that should be dead but are still alive — silently discounting subscriptions months after they were supposed to expire. Learn how to find them in Stripe, fix them, and prevent them."
date: "2026-03-09"
lastModified: "2026-03-09"
author: "RevReclaim Team"
tags: ["zombie discounts", "Stripe coupons", "revenue leaks", "SaaS billing", "discount management"]
canonical: "https://revreclaim.com/blog/zombie-discounts-stripe"
---

A zombie discount is a coupon that should be dead but is still alive. It sits on active subscriptions, silently reducing revenue months or years after it was supposed to expire. Stripe does not remove coupons from existing subscriptions when the coupon expires. This is by design. It catches most founders off guard. In RevReclaim's scans, 67% of SaaS accounts have at least one zombie discount. Average cost: $340/month.

## What Is a Zombie Discount?

Every SaaS company runs promotions. Launch discounts. Annual sale coupons. Partner pricing. Early adopter deals.

You create a coupon in Stripe. You set an expiration date. Customers use it. The expiration date passes. No new customers can redeem it.

Done, right?

No.

The coupon expired for **new** customers. Every **existing** subscription that already has the coupon applied? Still discounted. Stripe does not auto-remove expired coupons from active subscriptions. The coupon stops accepting new redemptions, but existing redemptions continue indefinitely.

This is documented behavior. Stripe designed it this way because removing a discount from a paying customer without explicit action could cause disputes. The logic makes sense from Stripe's perspective.

From your perspective, it means that every promotional coupon you've ever created might still be costing you money right now.

These are zombie discounts. Dead coupons that are still walking.

## How Zombie Discounts Happen

Here's the lifecycle. It takes about 3 minutes to create a zombie discount. It takes months to notice.

**Month 1:** Your head of sales creates a coupon. "20% off for 3 months" to drive signups during a product launch. The coupon code: `LAUNCH20`. The `redeem_by` date is set to 30 days from now. The `duration` is set to `repeating` with `duration_in_months: 3`.

**Month 1-2:** 15 customers sign up using `LAUNCH20`. Each gets 20% off their first 3 invoices.

**Month 2:** The `redeem_by` date passes. The coupon expires. No new customers can use `LAUNCH20`. You see "expired" in your Stripe dashboard and move on.

**Month 4:** The 3-month duration ends for the 15 customers. The discount should stop being applied.

And it does — if the `duration` was correctly set to `repeating` with the right `duration_in_months`.

But what if someone set `duration: forever` by accident? Or what if they set `duration: repeating` with `duration_in_months: 12` instead of 3?

**Month 8:** You're giving away $450/month to 15 customers who forgot the discount exists. Your coupon page in Stripe says "expired." The subscriptions page tells a different story.

Nobody checked. Nobody noticed. The zombie walks.

## The Three Types of Zombie Discounts

Not all zombie discounts are created equal. RevReclaim categorizes them by how they got there and how hard they are to find.

### Type 1: Expired Coupons Still Applied

The `redeem_by` date passed. The coupon shows as expired in your dashboard. But it's still applied to every subscription that redeemed it before expiration.

**How to spot it:** The coupon appears expired in your coupon list. But when you look at individual subscriptions, the discount line item is still there.

**How common:** This is the most common type. It exists in virtually every Stripe account that has ever created a coupon with a `redeem_by` date.

**Typical cost:** $100-$400/month depending on coupon value and number of affected subscriptions.

### Type 2: Forever Discounts

Coupons created with `duration: forever`. These are the most dangerous because they literally never stop. There is no mechanism in Stripe that will automatically remove them. They will discount that subscription until the subscription is canceled or someone manually removes the coupon.

**How to spot it:** Filter your coupons by `duration: forever`. Then check how many active subscriptions have each one applied.

**How common:** RevReclaim finds forever discounts in 34% of accounts. Most were unintentional — the founder or team member selected "forever" when they meant "once" or "repeating."

**Typical cost:** $200-$600/month. Forever discounts tend to be the most expensive zombie type because they accumulate. A forever coupon created 2 years ago has had 2 years to spread across subscriptions.

**Worst case from RevReclaim's scans:** A 30% forever coupon on 23 enterprise subscriptions. The founder intended it as a 3-month launch discount. Annual impact: **$9,936**.

### Type 3: Promotional One-Offs

Manual discounts added directly to a subscription through the Stripe dashboard. No coupon code. No `redeem_by` date. No documentation. Someone on your team gave a customer a discount during a support call or sales negotiation, and it was never logged anywhere.

**How to spot it:** These are the hardest to find because they don't show up in your coupon list. You have to inspect individual subscriptions and look for discount line items that aren't tied to a known coupon.

**How common:** Present in 28% of accounts. Usually a small number of subscriptions, but often with large discount amounts (because they were negotiated one-on-one).

**Typical cost:** $50-$300/month. Lower volume but higher per-subscription impact.

## How to Find Zombie Discounts in Stripe

### Manual Method: Stripe Dashboard

1. Go to **Billing > Coupons** in your Stripe Dashboard
2. Note every coupon that shows as "Expired" — these are your primary suspects
3. For each expired coupon, click into it and check "Customers" — this shows active subscriptions still using it
4. Go to **Billing > Subscriptions**, export to CSV
5. Look for any subscription with a non-zero discount that references an expired coupon

This takes 30-60 minutes depending on how many coupons you have.

### API Method: JavaScript

For a more thorough audit, use the Stripe API to cross-reference coupons against active subscriptions:

```javascript
const Stripe = require('stripe');
const stripe = Stripe('sk_live_your_key_here');

async function findZombieDiscounts() {
  const zombies = [];

  // Step 1: Get all subscriptions with discounts
  let hasMore = true;
  let startingAfter = null;

  while (hasMore) {
    const params = { status: 'active', limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;

    const subs = await stripe.subscriptions.list(params);

    for (const sub of subs.data) {
      if (sub.discount) {
        const coupon = sub.discount.coupon;

        // Check if coupon has expired (redeem_by in the past)
        const isExpired = coupon.redeem_by
          && coupon.redeem_by < Math.floor(Date.now() / 1000);

        // Check if coupon is "forever" duration
        const isForever = coupon.duration === 'forever';

        // Check if repeating coupon has exceeded its duration
        const isOverDuration = coupon.duration === 'repeating'
          && sub.discount.start
          && (Date.now() / 1000 - sub.discount.start)
            > coupon.duration_in_months * 30 * 24 * 60 * 60;

        if (isExpired || isForever || isOverDuration) {
          const monthlyDiscount = calculateMonthlyDiscount(sub, coupon);
          zombies.push({
            subscriptionId: sub.id,
            customerId: sub.customer,
            couponId: coupon.id,
            type: isForever ? 'forever' : isExpired ? 'expired' : 'over-duration',
            percentOff: coupon.percent_off,
            amountOff: coupon.amount_off,
            monthlyImpact: monthlyDiscount,
            discountStart: new Date(sub.discount.start * 1000).toISOString(),
          });
        }
      }
    }

    hasMore = subs.has_more;
    if (subs.data.length > 0) {
      startingAfter = subs.data[subs.data.length - 1].id;
    }
  }

  return zombies;
}

function calculateMonthlyDiscount(subscription, coupon) {
  // Get the subscription's monthly revenue
  let monthlyAmount = 0;
  for (const item of subscription.items.data) {
    const price = item.price;
    if (price.recurring.interval === 'month') {
      monthlyAmount += price.unit_amount * (item.quantity || 1);
    } else if (price.recurring.interval === 'year') {
      monthlyAmount += (price.unit_amount * (item.quantity || 1)) / 12;
    }
  }

  // Calculate discount
  if (coupon.percent_off) {
    return Math.round((monthlyAmount * coupon.percent_off) / 100);
  } else if (coupon.amount_off) {
    return coupon.amount_off;
  }
  return 0;
}

// Run the audit
findZombieDiscounts().then(zombies => {
  console.log(`Found ${zombies.length} zombie discounts`);
  const totalMonthly = zombies.reduce((sum, z) => sum + z.monthlyImpact, 0);
  console.log(`Total monthly impact: $${(totalMonthly / 100).toFixed(2)}`);
  console.table(zombies);
});
```

This script checks three conditions:

1. Coupons where `redeem_by` is in the past (expired coupons still applied)
2. Coupons with `duration: forever` (never-ending discounts)
3. Repeating coupons where the subscription has exceeded the `duration_in_months`

Run it against your live Stripe account. The output shows every zombie discount, its type, and how much it's costing you per month.

### Automated Method: RevReclaim

[Run a free scan](/scan). RevReclaim detects all three types of zombie discounts automatically, calculates the monthly and annual cost of each, and tells you exactly which subscriptions are affected.

Takes 60 seconds. Read-only access.

## How to Fix Zombie Discounts

Finding them is step one. Removing them requires care — you're changing what a customer pays.

### Step 1: Categorize Each Zombie

For every zombie discount you find, put it in one of three buckets:

**Remove immediately.** The discount was clearly temporary, the customer knows it was temporary, and continuing it has no business justification. Most expired promotional coupons fall here.

**Remove with notice.** The discount has been running long enough that the customer might expect it. Send an email 14-30 days before removal: "Your promotional discount is ending on [date]. Your subscription will renew at the standard rate of $X."

**Keep deliberately.** Some discounts should stay — partnership agreements, contractual obligations, strategic accounts. The key word is "deliberately." If you're keeping a discount, document why.

### Step 2: Remove via Stripe Dashboard

For individual subscriptions:

1. Go to **Billing > Subscriptions**
2. Click the subscription
3. Under "Discount," click the **X** to remove it
4. The next invoice will be at the full price

For bulk removal, use the API:

```javascript
// Remove discount from a single subscription
await stripe.subscriptions.update('sub_xxx', {
  coupon: '',
});

// Remove discount from multiple subscriptions
const subscriptionIds = ['sub_xxx', 'sub_yyy', 'sub_zzz'];
for (const id of subscriptionIds) {
  await stripe.subscriptions.update(id, { coupon: '' });
  console.log(`Removed discount from ${id}`);
}
```

### Step 3: Communicate the Change

For the "remove with notice" bucket, send a simple email:

> Subject: Your discount is ending on [date]
>
> Hi [Name],
>
> When you signed up, you received a [X]% promotional discount on your [Product] subscription. That promotion is ending on [date].
>
> Starting with your next billing cycle after [date], your subscription will renew at the standard rate of $[amount]/month.
>
> No action needed on your end. If you have questions, reply to this email.

Direct. No apology. The discount was always temporary — you're just following through.

**Response rate from RevReclaim customers who've done this:** Less than 5% of notified customers respond. Less than 1% cancel. Most customers either forgot about the discount or expected it to end eventually.

## How to Prevent Zombie Discounts

Fixing existing zombies recovers revenue today. Preventing new ones protects revenue permanently.

### Coupon Naming Conventions

Every coupon should encode its terms in the name. Not just a catchy code — a name that tells you exactly what it does and when it ends.

**Bad:** `LAUNCH50`, `SPECIALDEAL`, `VIP`

**Good:** `launch-50pct-3mo-jan2026`, `partner-acme-20pct-forever`, `annual-promo-25pct-1mo-mar2026`

Pattern: `[purpose]-[discount]-[duration]-[created/expires]`

When you look at your coupon list 6 months from now, you'll know exactly what each one was for and whether it should still exist.

### Set `redeem_by` on Every Coupon

Every coupon should have a `redeem_by` date. Even "permanent" partner discounts should have a `redeem_by` date set to the contract renewal date. This doesn't stop the discount from being applied to existing subscriptions, but it prevents the coupon from spreading to new subscriptions after the promotion ends.

### Use `repeating` Duration, Not `forever`

The `forever` duration should be reserved for genuine lifetime discounts — and those should be rare. For any time-limited promotion, use `repeating` with an explicit `duration_in_months`.

If you need a 3-month discount: `duration: repeating`, `duration_in_months: 3`.

If you need a 1-year discount: `duration: repeating`, `duration_in_months: 12`.

`forever` means forever. Use it only when you mean it.

### Monthly Coupon Audit

Add a recurring calendar event: "Audit active coupons." Once a month, spend 15 minutes:

1. List all active coupons
2. Check if any should be deactivated
3. Cross-reference expired coupons against active subscriptions
4. Remove any zombie discounts found

This single habit prevents zombie discounts from accumulating. The [SaaS Billing Health Checklist](/blog/saas-billing-health-checklist) includes a complete monthly audit workflow.

### Document Every Discount

Maintain a simple log — a spreadsheet, a Notion table, whatever you'll actually use — with one row per coupon:

| Coupon ID | Purpose | Discount | Duration | Created | Expires | Owner |
|-----------|---------|----------|----------|---------|---------|-------|
| launch-50pct-3mo-jan2026 | Product launch | 50% | 3 months | Jan 2026 | Feb 2026 | Marketing |
| partner-acme-20pct-forever | Acme partnership | 20% | Contract term | Mar 2026 | Mar 2027 | Sales |

When someone asks "why does this customer have a discount?" — you have the answer in 10 seconds instead of 10 minutes of digging through Slack threads.

## The Real Cost of Zombie Discounts

RevReclaim has scanned hundreds of SaaS billing accounts. Here's what the data shows:

- **67% of accounts** have at least one zombie discount
- **Average cost:** $340/month per affected account
- **Worst case:** $830/month from a single forgotten forever coupon
- **Average age of zombie discounts:** 7.4 months (the discount has been running 7+ months past its intended end date)
- **Average number of zombie discounts per affected account:** 3.2

For a SaaS company at $50K MRR, zombie discounts are typically the second or third largest leak type — behind failed payment gaps but often ahead of [ghost subscriptions](/blog/ghost-subscriptions-saas).

The insidious part: zombie discounts don't show up as failed revenue. The invoices succeed. The customers pay. The money just arrives at a lower amount than it should. There's no alert, no error, no notification. The revenue quietly doesn't exist.

## Find Your Zombie Discounts

You have two options.

**Option 1: Manual audit.** Use the JavaScript code above, or go through your Stripe dashboard coupon by coupon. Takes 30-60 minutes. Repeat monthly.

**Option 2: Automated scan.** [Run a free scan](/scan) with RevReclaim. It detects all three types of zombie discounts in 60 seconds, shows you the exact monthly cost, and identifies which subscriptions to fix first.

Either way, check today. If you've ever created a coupon in Stripe, there's a 67% chance you have at least one zombie discount costing you money right now.

For a complete billing audit beyond just discounts, follow the [step-by-step Stripe audit guide](/blog/audit-stripe-account-revenue-leaks).

---

## Frequently Asked Questions

### Does Stripe automatically remove expired coupons from subscriptions?

No. When a Stripe coupon's `redeem_by` date passes, the coupon stops accepting new redemptions. But existing subscriptions that already have the coupon applied continue to receive the discount indefinitely. This is Stripe's documented behavior — the platform does not auto-remove discounts from active subscriptions because doing so could cause payment disputes. You must manually remove the coupon from each affected subscription via the dashboard or API.

### Will removing a discount upset customers?

In RevReclaim's experience, less than 5% of customers respond when notified that a promotional discount is ending, and less than 1% cancel. Most customers either forgot the discount existed or expected it to end. The key is giving 14-30 days notice before the change takes effect. Send a clear, direct email stating the date the discount ends and what the new price will be. No apology needed — the discount was always intended to be temporary.

### How do I prevent zombie discounts in the future?

Three rules prevent most zombie discounts. First, never use `duration: forever` unless you genuinely intend a permanent discount — use `repeating` with an explicit `duration_in_months` instead. Second, set a `redeem_by` date on every coupon so it stops spreading to new subscriptions. Third, run a monthly coupon audit: list all active coupons, cross-reference expired coupons against active subscriptions, and remove any zombies found. The [SaaS Billing Health Checklist](/blog/saas-billing-health-checklist) includes a monthly audit workflow for this.

### How much do zombie discounts cost the average SaaS company?

RevReclaim's scan data shows that 67% of SaaS accounts have at least one zombie discount, with an average monthly cost of $340 per affected account. The most expensive single zombie discount found was a 30% forever coupon on 23 enterprise subscriptions, costing $9,936 per year. Zombie discounts are typically the second or third largest revenue leak category for SaaS companies, behind failed payment recovery gaps. Use the [revenue leakage calculator](/calculator) to estimate your specific exposure.
