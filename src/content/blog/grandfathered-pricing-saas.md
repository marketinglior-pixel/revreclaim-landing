---
title: "Grandfathered Pricing in SaaS: How to Audit Legacy Customers and Recover Revenue"
description: "40% of your SaaS customers may be on old pricing. Learn how to audit grandfathered pricing, calculate the revenue gap, and migrate legacy customers with email templates, Stripe code, and churn projections."
date: "2026-03-09"
lastModified: "2026-03-14"
author: "RevReclaim Team"
tags: ["grandfathered pricing SaaS", "legacy pricing", "SaaS pricing audit", "price migration", "revenue optimization"]
canonical: "https://revreclaim.com/blog/grandfathered-pricing-saas"
---

You raised prices 6 months ago. New customers pay $79/mo. But 40% of your customer base is still on the old $49/mo plan. That's $30/mo x 200 customers = $6,000/mo you're leaving on the table. $72,000/year.

The question isn't whether this is a problem. It's what to do about it.

Force everyone to the new price and risk a churn spike. Keep everyone grandfathered and bleed revenue every month. Or find the middle ground that recovers most of the gap without torching customer relationships.

This guide breaks down all three options with real numbers, churn projections, and the exact steps to execute each one.

## How Grandfathered Pricing Happens in SaaS

The pattern is always the same:

1. You announce a price increase.
2. New signups get the new pricing.
3. Existing customers stay on the old plan.
4. Stripe doesn't auto-migrate anyone. It keeps the original price ID on each subscription.
5. Six months later, you have a two-tier customer base paying different amounts for the same product.

This is grandfathered pricing. It's the default behavior in every billing system. Stripe, Paddle, Polar -- none of them move existing customers to new prices automatically. You have to do it yourself.

Every month the gap compounds. You ship features, improve infrastructure, expand support -- and legacy customers get all of it at the old rate. The product they're paying $49/mo for today is worth significantly more than the product they originally bought at $49/mo.

## The Real Cost of Grandfathered Pricing in SaaS

### Direct Revenue Gap

The math is straightforward:

```
Revenue gap = (new_price - old_price) x legacy_customer_count x months
```

**Example:**
- Old price: $49/mo
- New price: $79/mo
- Gap per customer: $30/mo
- Legacy customers: 200
- Monthly gap: $6,000
- Annual gap: $72,000

That's $72,000 in revenue you've earned but aren't collecting. Not a future opportunity -- current revenue you're leaving behind every single month.

After 2 years of grandfathering, the cumulative gap reaches $144,000. After 3 years, $216,000. It never shrinks. It only grows.

### Hidden Cost: You're Subsidizing Your Most Expensive Customers

Legacy customers are almost always your longest-tenured users. They've been around the longest, which means:

- They use the most features.
- They consume the most support resources.
- They have the most data stored.
- They generate the most API calls.

Your cheapest customers are your most expensive to serve. The economics are inverted.

A customer paying $49/mo who uses every feature, submits 3 support tickets a month, and stores 10GB of data costs you more to serve than a new customer paying $79/mo who just signed up.

### Perception Cost

New customers paying $79/mo are getting the same product as legacy customers paying $49/mo. If they find out -- through a public pricing page, a conversation with another user, or a community forum -- it feels unfair.

"I'm paying 60% more for the same thing" is a churn trigger. Even if your product is excellent.

This perception risk grows as your customer base grows. The more customers you have, the more likely the pricing gap becomes visible.

## 3 Approaches to SaaS Pricing Migration

There is no universally correct answer. The right approach depends on your gap size, customer relationship, and product trajectory. Here are the three options with honest tradeoffs.

### Option 1: Full Grandfather (Keep Everyone on Old Pricing)

You keep every existing customer on their original price. Forever. Only new signups pay the new rate.

**Pros:**
- Zero churn risk from pricing changes.
- Preserves customer goodwill and loyalty.
- Simple to execute (do nothing).
- No angry emails. No support tickets. No refund requests.

**Cons:**
- Revenue gap grows every month with no end date.
- Creates permanent pricing debt that compounds annually.
- Subsidizes your highest-usage customers at the lowest rate.
- Makes future price increases even harder (customers expect to always be grandfathered).

**When this works:**
- The price gap is small (less than 10% of subscription value).
- You have a small, loyal customer base where relationships matter more than optimization.
- Your product hasn't changed significantly since the old pricing was set.
- You're growing fast enough that new customer revenue eclipses the gap.

**When this fails:**
- The gap is large (20%+ of subscription value) and affects a significant portion of your base.
- Your unit economics are tight and you need the revenue.
- You've significantly improved the product since the old pricing was set.

### Option 2: Forced Migration (Move Everyone to New Pricing)

Every customer moves to the new price on a specific date. No exceptions. The old price ceases to exist.

**Pros:**
- Maximum revenue recovery. You close 100% of the gap.
- Clean pricing structure. One price for everyone.
- Sets a precedent that prices evolve with the product.
- Simplifies billing operations.

**Cons:**
- Expect a churn spike. Industry data: 5-15% of migrated customers cancel.
- Customer complaints and negative sentiment.
- Support burden during the transition period.
- Risk of public backlash (social media, review sites).

**When this works:**
- The price gap is large (30%+ of subscription value).
- Your product has significantly improved since the old pricing.
- Customers are clearly getting more value than they're paying for.
- You can absorb the short-term churn hit.

**When this fails:**
- Your product hasn't changed much. Hard to justify a 50% price increase when the product is the same.
- You have high-value customers who will leave on principle.
- Your competitive landscape gives customers easy alternatives.

**Churn math on forced migration:**

If you migrate 200 customers from $49 to $79 and lose 10%:
- 180 customers x $79 = $14,220/mo (post-migration)
- vs. 200 customers x $49 = $9,800/mo (pre-migration)
- Net gain: $4,420/mo even after losing 20 customers

The math almost always favors migration if you can handle the short-term churn. But "handling the churn" means lost customers, possible negative reviews, and a 2-3 month recovery period.

### Option 3: Loyalty Rate (The Middle Ground)

You create a third price point between old and new. Legacy customers move to this loyalty rate instead of the full new price. New customers still pay the full new price.

**Example:**
- Old price: $49/mo
- Loyalty rate: $65/mo
- New price: $79/mo

**Pros:**
- Recovers most of the gap ($16/mo per customer vs. $30/mo).
- Shows respect for customer loyalty. "You've been with us since the beginning, so you get a better rate than new customers."
- Lower churn than forced migration (typically 2-5% vs. 5-15%).
- Customers feel they're getting a deal, not a punishment.

**Cons:**
- Creates a third pricing tier to manage.
- Doesn't recover the full gap.
- Some customers will still push back.

**When this works:**
- Most situations. This is the default recommendation for SaaS companies with a meaningful legacy pricing gap.

**Revenue math on loyalty rate:**

200 customers moved from $49 to $65 with 3% churn:
- 194 customers x $65 = $12,610/mo (post-migration)
- vs. 200 customers x $49 = $9,800/mo (pre-migration)
- Net gain: $2,810/mo with minimal churn

Compare to forced migration:
- 180 customers x $79 = $14,220/mo (higher revenue but 20 lost customers)

The loyalty rate recovers less per customer but retains more customers. Over 12 months, the cumulative revenue often converges because you avoid the churn recovery period.

## How to Audit and Execute a SaaS Pricing Migration

Regardless of which approach you choose, the execution matters as much as the strategy. A well-communicated price increase retains more customers than a poorly communicated one at any price point.

### Step 1: Identify All Legacy Customers and Current Pricing

Before you do anything, know the exact scope. Pull every active subscription and compare its price to your current published pricing.

```javascript
// Get all active prices per product
const prices = await stripe.prices.list({
  active: true,
  type: 'recurring',
  limit: 100,
});

// Find current (highest) price per product/interval
const currentPrices = {};
for (const price of prices.data) {
  const key = `${price.product}_${price.recurring.interval}`;
  if (!currentPrices[key] || price.unit_amount > currentPrices[key].unit_amount) {
    currentPrices[key] = price;
  }
}

// Identify legacy subscriptions
const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
const legacy = [];

for (const sub of subs.data) {
  for (const item of sub.items.data) {
    const key = `${item.price.product}_${item.price.recurring.interval}`;
    const current = currentPrices[key];
    if (current && item.price.unit_amount < current.unit_amount) {
      legacy.push({
        customerId: sub.customer,
        subscriptionId: sub.id,
        currentAmount: item.price.unit_amount / 100,
        newAmount: current.unit_amount / 100,
        gap: (current.unit_amount - item.price.unit_amount) / 100,
      });
    }
  }
}

console.log(`${legacy.length} legacy subscriptions found`);
console.log(`Total monthly gap: $${legacy.reduce((sum, l) => sum + l.gap, 0)}`);
```

This gives you the exact customer list and dollar gap. No guessing.

### Step 2: Calculate Total Revenue Impact

Sum up the gap across all legacy customers. This is the number you're optimizing for.

| Metric | Value |
|--------|-------|
| Legacy customers | 200 |
| Average gap per customer | $30/mo |
| Total monthly gap | $6,000 |
| Total annual gap | $72,000 |
| Expected churn (loyalty rate, 3%) | 6 customers |
| Revenue from churned customers | -$390/mo |
| Net monthly gain | $5,610 |

Run this calculation before you decide on an approach. If the total annual gap is under $5,000, a full grandfather might be fine. If it's over $50,000, you can't afford to ignore it.

### Step 3: Choose Your Approach Based on Gap Size

| Gap Size | Recommended Approach |
|----------|---------------------|
| Under 10% of subscription value | Full grandfather |
| 10-30% of subscription value | Loyalty rate |
| Over 30% of subscription value | Forced migration or loyalty rate |

Factor in your product trajectory too. If you've shipped 10 major features since the last price increase, you have a strong value justification for the new price. If the product is essentially the same, a forced migration is harder to defend.

### Step 4: Communicate 60 Days in Advance

This is non-negotiable. Give customers at least 60 days' notice before any price change takes effect. 90 days is better.

The communication should include:
- The specific change (old price, new price, effective date).
- Why the price is changing (product improvements, new features, increased value).
- What they're getting that they weren't getting before.
- A clear action they need to take (or confirmation that no action is needed).

Do not bury the price change in a product update email. Send a dedicated pricing email with a clear subject line.

### Step 5: Frame It as Value, Not a Price Increase

The difference between "we're raising your price" and "here's what you're getting" is the difference between a churn event and a retention event.

Don't lead with the price change. Lead with the value the customer has received since they last signed up.

### Step 6: Offer Annual Billing as a Soft Migration Path

Annual billing at a discount is the best lever you have during a price migration.

Old price: $49/mo ($588/year).
New monthly price: $79/mo ($948/year).
Annual option: $65/mo billed annually ($780/year).

The annual option lets legacy customers lock in a rate below the new monthly price while you collect a full year upfront. Both sides win: the customer saves money, and you get cash flow certainty and reduce churn risk.

Annual customers churn at 50-70% lower rates than monthly customers. A price migration that converts even 20% of legacy customers to annual billing is a net win beyond just the price increase.

## The Email Template

Here's a migration email that balances honesty with value framing. Adjust the specifics for your product.

---

**Subject: Changes to your [Product] subscription starting [Date]**

Hi [First Name],

You've been a [Product] customer since [signup date], and a lot has changed since then.

In the last [time period], we've shipped [specific improvement 1], [specific improvement 2], and [specific improvement 3]. Your plan now includes [feature/capability] that didn't exist when you signed up.

Starting [effective date], we're updating your subscription from $49/mo to $65/mo.

This is a loyalty rate -- 18% below our current price of $79/mo -- because you've been with us since early days. New customers pay the full rate. You get the same product at a lower price.

**Two options to save more:**

1. **Switch to annual billing at $55/mo** (billed as $660/year) -- that's 30% below our current monthly rate. [Link to upgrade]
2. **Stay on monthly at $65/mo** -- no action needed, the change takes effect on [date].

If you have questions, reply to this email. I read every response.

[Founder name]

---

This template works because it:
- Leads with value delivered, not the price change.
- Positions the increase as a loyalty rate (customer feels rewarded, not punished).
- Offers annual billing as an escape valve.
- Comes from a person, not "the billing team."
- Gives a clear timeline and specific numbers.

## How to Find Your Grandfathered Pricing Gap

You have two options.

### Option A: Use the Stripe API

The code in Step 1 above identifies every legacy customer and calculates the gap. Export the results to a spreadsheet, sort by gap size, and you have your migration list.

For a complete walkthrough of all billing checks beyond just legacy pricing, see our [Stripe billing audit guide](/blog/audit-stripe-account-revenue-leaks).

### Option B: Use RevReclaim

RevReclaim scans your billing account and surfaces the legacy pricing gap automatically. You get:

- Every customer on old pricing, with the exact dollar gap per subscription.
- Total monthly and annual revenue impact.
- A breakdown by price tier showing which old prices have the most customers.
- The percentage of your customer base on legacy pricing.

The scan takes 60 seconds. Read-only access. No stored keys.

Legacy pricing is one of [5 types of revenue leaks](/blog/five-types-revenue-leaks-saas) that RevReclaim detects. The others -- [stuck subscriptions](/blog/ghost-subscriptions-saas), [failed payments](/blog/find-failed-payments-stripe), [expired coupons](/blog/zombie-discounts-stripe), and missing payment methods -- compound on top of the pricing gap. See [SaaS churn vs revenue leakage](/blog/saas-churn-vs-revenue-leakage) to understand whether fixing pricing gaps or reducing churn should be your priority.

[Run a free scan to find your legacy pricing gap -->](/scan)

Use our [revenue leakage calculator](/calculator) to estimate the gap before scanning.

---

## Frequently Asked Questions

### How much churn should I expect from a price migration?

It depends on the approach. Full grandfather: 0% churn (no change). Loyalty rate (middle ground): 2-5% churn, mostly from price-sensitive customers who were already at risk. Forced migration to full new pricing: 5-15% churn. The actual number depends on the size of the increase, how well you communicate it, and how much value your product delivers. A 15% price increase with 60 days' notice and a clear value justification typically sees under 3% churn. A 50% increase with 30 days' notice can push churn to 10-15%.

### Should I grandfather early customers forever?

Only if the revenue gap is small enough to absorb. Grandfathering feels generous, but it creates permanent pricing debt that compounds every year. A better approach: grandfather for a fixed period (12-24 months) and communicate that upfront. "As an early customer, you'll keep your current rate for 12 months after any price change." This gives loyalty recognition with a clear end date. After the period expires, migrate to a loyalty rate that's still below the new price but closer to it.

### How often should SaaS companies raise prices?

Most SaaS companies raise prices too infrequently. The benchmark: review pricing annually and adjust every 12-18 months if the product has meaningfully improved. Patrick Campbell's research at ProfitWell found that SaaS companies that review pricing quarterly grow 2-4x faster than companies that set pricing once and forget it. You don't need to raise prices every quarter -- but you should evaluate whether your current pricing reflects the current value of your product. If you've shipped major features, expanded integrations, or improved reliability since your last price change, you're likely underpriced.

### Can I migrate pricing in Stripe without creating new subscriptions?

Yes. Stripe supports price changes on existing subscriptions without canceling and recreating them. Use the `stripe.subscriptions.update()` method to swap the price ID on an existing subscription item. You can set `proration_behavior` to control whether the customer gets prorated charges or the new price starts on the next billing cycle. For most migrations, set `proration_behavior: 'none'` and schedule the change for the next billing date using `billing_cycle_anchor: 'unchanged'`. This avoids confusing mid-cycle charges and aligns the new price with the customer's normal billing date.

```javascript
await stripe.subscriptions.update('sub_xxx', {
  items: [{
    id: 'si_xxx', // existing subscription item ID
    price: 'price_new_xxx', // new price ID
  }],
  proration_behavior: 'none',
});
```

This updates the subscription in place. No cancellation, no new subscription, no disruption to the customer's billing cycle.
