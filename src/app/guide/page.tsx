import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SaaS Billing Health Checklist - 10 Stripe Leaks to Check | RevReclaim",
  description:
    "Free manual checklist: 10 billing leaks hiding in your Stripe account, where to find them, and how to fix them. Takes 45 minutes manually, or 90 seconds with RevReclaim.",
  openGraph: {
    title: "SaaS Billing Health Checklist - 10 Stripe Leaks to Check",
    description:
      "Free manual checklist: 10 billing leaks hiding in your Stripe account and how to fix them.",
  },
};

const leakChecklist = [
  {
    number: 1,
    title: "Expired Coupons Still Discounting",
    recurrence: "Episodic",
    recurrenceColor: "text-yellow-400",
    what: "Promotional coupons that have passed their expiry date but are still actively discounting existing subscriptions. Stripe \"expiry\" only blocks new redemptions. Existing subscriptions keep the discount forever.",
    where: "Stripe Dashboard > Coupons > Filter by \"Expired\" > Then check Customers tab for each expired coupon",
    redFlags: [
      "Any expired coupon with active subscriptions still using it",
      "Launch or promotional coupons from 6+ months ago",
      "Coupons with names like \"LAUNCH50\", \"BETA\", \"EARLYBIRD\" that are still applied",
    ],
    howToFix: "Go to each affected subscription > Edit subscription > Remove the coupon. Stripe won't auto-remove expired coupons from existing subscriptions.",
    impact: "One founder found an expired coupon costing $800/mo for 6 months before catching it. Average impact: $340/mo per affected account.",
  },
  {
    number: 2,
    title: "Failed Payments Nobody Followed Up On",
    recurrence: "Recurring",
    recurrenceColor: "text-emerald-400",
    what: "Invoices that failed all retry attempts and are sitting in an \"open\" or \"uncollectible\" state. Stripe retries 3 times over 7 days by default. If all retries fail, the invoice just... sits there. The subscription may move to \"past_due\" but the money is gone unless someone intervenes.",
    where: "Stripe Dashboard > Invoices > Filter by Status: \"Open\" or \"Past due\" > Sort by oldest first",
    redFlags: [
      "Open invoices older than 14 days",
      "Subscriptions in \"past_due\" status for 30+ days",
      "Multiple failed invoices from the same customer",
    ],
    howToFix: "For each open invoice: try to collect payment manually, update the payment method, or reach out to the customer. For very old invoices (90+ days), consider voiding them.",
    impact: "20-40% of churn is actually involuntary. These are customers who wanted to stay but their payment failed silently.",
  },
  {
    number: 3,
    title: "Never-Expiring Discounts",
    recurrence: "One-time fix",
    recurrenceColor: "text-gray-400",
    what: "Coupons created with \"forever\" duration and no end date. Common for beta testers, early adopters, or referral programs. These customers will pay a reduced rate indefinitely unless you manually remove the discount.",
    where: "Stripe Dashboard > Coupons > Filter by Duration: \"Forever\" > Check how many active subscriptions use each",
    redFlags: [
      "Coupons with \"forever\" duration and 50%+ discount",
      "Beta/early access coupons from more than a year ago",
      "Referral coupons with no usage cap",
    ],
    howToFix: "Decide which forever discounts are intentional (loyalty rewards) vs. accidental (beta pricing that should have expired). For accidental ones, create a migration plan to move customers to current pricing with advance notice.",
    impact: "12 beta users paying half price for 2+ years adds up. At $50/mo discount each, that's $7,200/year you're leaving on the table.",
  },
  {
    number: 4,
    title: "Ghost Subscriptions",
    recurrence: "Episodic",
    recurrenceColor: "text-yellow-400",
    what: "Active, paying subscriptions where the customer hasn't logged into your product in 30-60+ days. They're paying but not using the product, which means they'll eventually churn. But right now they're also inflating your real engagement metrics.",
    where: "This one requires cross-referencing Stripe data with your product usage data. Check your analytics tool for users with zero sessions in the last 30-60 days, then match those to active Stripe subscriptions.",
    redFlags: [
      "Active subscription + zero product logins in 30+ days",
      "Customers who downgraded but never actually canceled",
      "Free-to-paid conversions that never used the paid features",
    ],
    howToFix: "Send a re-engagement email. If they don't respond, consider proactively offering a pause or downgrade. Keeping ghost subscribers inflates your MRR but creates a churn cliff.",
    impact: "Ghost subscriptions typically represent 5-15% of total active subscriptions in growing SaaS companies.",
  },
  {
    number: 5,
    title: "Legacy Pricing",
    recurrence: "Episodic",
    recurrenceColor: "text-yellow-400",
    what: "Customers still paying prices from a previous pricing tier that you've since increased. Stripe doesn't auto-migrate existing subscriptions when you create new prices. If you raised your price from $49 to $79 six months ago, everyone who subscribed before the change is still paying $49.",
    where: "Stripe Dashboard > Products > Check each product's price list > Note which prices are \"archived\" or old > Then check Subscriptions using those old prices",
    redFlags: [
      "Archived prices that still have active subscriptions",
      "Price IDs from more than 1 year ago with active customers",
      "More than 20% of customers on non-current pricing",
    ],
    howToFix: "Create a migration plan. Options: grandfather existing customers (intentional), schedule a migration with 30-day notice (common), or offer the new plan with a loyalty discount.",
    impact: "If 30% of 200 customers are paying $30/mo less than current pricing, that's $1,800/mo or $21,600/year.",
  },
  {
    number: 6,
    title: "Expiring Credit Cards",
    recurrence: "Recurring",
    recurrenceColor: "text-emerald-400",
    what: "Payment methods that will expire within the next 1-3 months. When the card expires, the next invoice will fail. Stripe won't proactively notify you or the customer before this happens.",
    where: "Stripe Dashboard > Customers > Export customer list with payment methods > Filter by card expiry date within the next 90 days",
    redFlags: [
      "Cards expiring this month or next month",
      "Customers with only one payment method (no backup)",
      "High-value subscriptions on soon-to-expire cards",
    ],
    howToFix: "Email customers with expiring cards and ask them to update their payment method. Most billing tools don't do this proactively. Some card networks support automatic card updater, but coverage is about 60%.",
    impact: "Each expired card = one failed payment = potential churn. At $100/mo average, 10 expiring cards = $1,000/mo at risk.",
  },
  {
    number: 7,
    title: "Missing Payment Methods",
    recurrence: "One-time fix",
    recurrenceColor: "text-gray-400",
    what: "Customers with active or trialing subscriptions but no valid payment method on file. This usually happens after migrations, manual subscription creation, or checkout flow bugs.",
    where: "Stripe Dashboard > Customers > Look for customers with active subscriptions but \"No payment method\" in the payment methods section",
    redFlags: [
      "Trialing customers with no card on file (won't convert automatically)",
      "Active subscriptions created manually without payment method",
      "Customers who removed their payment method but kept the subscription",
    ],
    howToFix: "Reach out to these customers and ask them to add a payment method. For trialing customers, this is critical before trial ends or the conversion will fail silently.",
    impact: "Usually a small number (2-5% of customers) but represents guaranteed failed payments on next billing cycle.",
  },
  {
    number: 8,
    title: "Unbilled Overages",
    recurrence: "Recurring",
    recurrenceColor: "text-emerald-400",
    what: "Customers using more than their plan includes without being charged for the overage. This only applies if you have usage-based or hybrid pricing. If you don't have metered billing configured in Stripe, customers can exceed their plan limits without any additional charge.",
    where: "Compare your product usage data with Stripe subscription data. Look for customers who exceeded plan limits (API calls, seats, storage, etc.) but were only charged the base subscription price.",
    redFlags: [
      "Customers on a \"10 seats\" plan using 15+ seats",
      "API usage 2x or more above plan limit",
      "No metered billing items configured in Stripe for usage-based features",
    ],
    howToFix: "Set up metered billing in Stripe for usage-based features. Create overage tiers or upgrade prompts when customers approach their plan limits.",
    impact: "Varies wildly. Some companies lose 10-30% of potential revenue from unbilled overages, especially in early growth when enforcement isn't configured.",
  },
  {
    number: 9,
    title: "Expired Trials That Never Converted",
    recurrence: "One-time fix",
    recurrenceColor: "text-gray-400",
    what: "Subscriptions still in \"trialing\" status even though the trial period has ended. This happens when trial-end behavior isn't configured properly in Stripe. The customer might still have access to your product without paying.",
    where: "Stripe Dashboard > Subscriptions > Filter by Status: \"Trialing\" > Check each subscription's trial_end date",
    redFlags: [
      "Subscriptions in \"trialing\" status past their trial end date",
      "Trial subscriptions older than 30 days",
      "Customers with trialing status but no payment method",
    ],
    howToFix: "Configure proper trial-end behavior in Stripe (auto-convert to paid or auto-cancel). For existing stuck trials, manually convert or cancel them.",
    impact: "More of a conversion signal than a direct leak, but stuck trials can give away free access indefinitely.",
  },
  {
    number: 10,
    title: "Duplicate Subscriptions",
    recurrence: "One-time fix",
    recurrenceColor: "text-gray-400",
    what: "The same customer with two or more active subscriptions to the same product. This usually happens after plan migrations, checkout bugs, or manual subscription creation. The customer might be getting double-charged (and will eventually dispute it) or might have an old subscription still active alongside a new one.",
    where: "Stripe Dashboard > Customers > Look for customers with multiple active subscriptions > Check if any are to the same product",
    redFlags: [
      "Same customer ID with 2+ active subscriptions",
      "Subscriptions created within days of each other (migration artifact)",
      "Old subscription + new subscription both active",
    ],
    howToFix: "Cancel the duplicate subscription (usually the older one). If the customer was double-charged, issue a refund for the overlap period before they file a dispute.",
    impact: "Duplicates are rare (1-3% of accounts) but expensive when they lead to chargebacks. Each chargeback costs $15-25 in fees plus the refunded amount.",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-background text-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[30%] h-[500px] w-[500px] rounded-full bg-brand/6 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"
          >
            &larr; Back to RevReclaim
          </Link>

          <h1 className="mb-4 font-display text-[1.5rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl">
            10 Billing Leaks Hiding in Your Stripe Account
            <br />
            <span className="text-text-muted font-semibold text-[0.6em]">
              (and How to Find Them Manually)
            </span>
          </h1>

          <p className="mb-6 max-w-xl text-[15px] text-text-muted/90 leading-relaxed">
            A free checklist for SaaS founders who want to audit their billing.
            Each item tells you exactly where to look in Stripe and what to fix.
            The whole thing takes about 45 minutes if you do it manually.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href="/scan?utm_source=guide"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-[15px] font-bold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              Or scan automatically in 90 seconds
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Recurring = shows up every month
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Episodic = appears after events
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              One-time = fix once, stays solved
            </span>
          </div>
        </div>
      </section>

      {/* Checklist Items */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="space-y-10">
          {leakChecklist.map((item) => (
            <article
              key={item.number}
              id={`leak-${item.number}`}
              className="glass-card p-6 md:p-8"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-lg">
                  {item.number}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {item.title}
                  </h2>
                  <span className={`text-xs font-medium ${item.recurrenceColor}`}>
                    {item.recurrence}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-[14px] leading-relaxed text-text-muted">
                <div>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                    What it is
                  </h3>
                  <p>{item.what}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                    Where to find it in Stripe
                  </h3>
                  <p className="font-mono text-[13px] text-brand/80 bg-brand/5 rounded-md px-3 py-2">
                    {item.where}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                    Red flags
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {item.redFlags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                    How to fix
                  </h3>
                  <p>{item.howToFix}</p>
                </div>

                <div className="border-t border-white/[0.06] pt-3">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                    Real impact
                  </h3>
                  <p className="text-white/80 italic">{item.impact}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Summary + CTA */}
      <section className="border-t border-white/[0.06] py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">
            That&apos;s 10 places to check.
          </h2>
          <p className="mb-2 text-text-muted">
            Going through all of them manually takes about 45 minutes. And you&apos;d
            need to do it again every month or two, because some of these leaks
            are recurring.
          </p>
          <p className="mb-8 text-text-muted">
            RevReclaim checks all 10 in about 90 seconds. Read-only API access,
            no credit card required.
          </p>

          <Link
            href="/scan?utm_source=guide"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-9 py-4 text-[17px] font-bold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            Scan My Account Free
          </Link>

          <p className="mt-4 text-xs text-text-dim">
            Free scan shows your top 3 leaks. Upgrade to see all 10 categories.
          </p>
        </div>
      </section>

      {/* Email Capture */}
      <section className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-white">
            Want this checklist as a reference?
          </h3>
          <p className="mb-4 text-sm text-text-muted">
            Enter your email and we&apos;ll send you the full checklist plus a
            reminder to re-audit in 30 days.
          </p>
          <form
            action="/api/subscribe"
            method="POST"
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <input type="hidden" name="source" value="guide" />
            <button
              type="submit"
              className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              Send me the checklist
            </button>
          </form>
        </div>
      </section>

      {/* Footer link */}
      <div className="pb-8 text-center">
        <Link href="/" className="text-sm text-text-muted hover:text-white transition-colors">
          &larr; Back to RevReclaim
        </Link>
      </div>
    </main>
  );
}
