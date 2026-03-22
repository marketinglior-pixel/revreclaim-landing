import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How RevReclaim Works - What We Scan, What We Do, What We Don't",
  description:
    "Exactly what RevReclaim reads from your Stripe account, what each scanner checks, and how recovery actions work. Full transparency.",
};

const SCANNERS = [
  {
    name: "Expired Coupons",
    what: "Checks if any coupon marked as \"expired\" is still giving discounts on active subscriptions.",
    reads: "Coupons list + subscriptions with discounts applied",
    example: "A 3-month launch promo that expired but 5 customers still get 30% off",
  },
  {
    name: "Never-Expiring Discounts",
    what: "Finds subscriptions with discounts that have no end date set.",
    reads: "Subscriptions with \"forever\" or no-expiry discount attached",
    example: "Beta user discount from 2023 still active on 12 customers",
  },
  {
    name: "Failed Payments",
    what: "Finds invoices in past_due or uncollectible status with no successful retry.",
    reads: "Invoices with failed payment status",
    example: "3 customers with unpaid invoices from 60+ days ago",
  },
  {
    name: "Expiring Cards",
    what: "Identifies credit cards expiring within the next 30 days.",
    reads: "Payment methods attached to active subscriptions",
    example: "8 customers whose cards expire next month (future failed payments)",
  },
  {
    name: "Ghost Subscriptions",
    what: "Active subscription but zero product usage. They'll churn eventually.",
    reads: "Subscription status + last activity metadata",
    example: "Customer paying $99/mo but hasn't logged in for 4 months",
  },
  {
    name: "Legacy Pricing",
    what: "Customers still on a price you've since changed or deprecated.",
    reads: "Subscription prices vs current product prices",
    example: "15 customers on $49/mo when current price is $79/mo",
  },
  {
    name: "Missing Payment Method",
    what: "Active subscription with no valid payment method attached.",
    reads: "Subscriptions + associated payment methods",
    example: "Customer deleted their card but subscription is still 'active'",
  },
  {
    name: "Unbilled Overages",
    what: "Usage exceeding plan limits without metered billing configured.",
    reads: "Usage records vs plan limits",
    example: "Customer using 150% of their plan quota with no overage charges",
  },
  {
    name: "Expired Trials",
    what: "Trial period ended but subscription never converted to paid.",
    reads: "Subscriptions with status 'trialing' past end date",
    example: "Trial ended 3 weeks ago, customer still shows as 'trialing'",
  },
  {
    name: "Duplicate Subscriptions",
    what: "Same customer with two or more active subscriptions to the same product.",
    reads: "Customer subscription list grouped by product",
    example: "Customer has 2 active Pro subscriptions (common after migrations)",
  },
];

const ACTIONS = [
  {
    name: "Payment Reminder (Dunning)",
    what: "Sends an email to the customer about their failed payment.",
    requires: "Write-access API key + your approval",
  },
  {
    name: "Retry Payment",
    what: "Attempts to charge the customer's card again for a failed invoice.",
    requires: "Write-access API key + your approval",
  },
  {
    name: "Remove Expired Coupon",
    what: "Removes a discount from a subscription where the coupon has expired.",
    requires: "Write-access API key + your approval",
  },
  {
    name: "Cancel Ghost Subscription",
    what: "Cancels a subscription with zero usage (at period end, not immediately).",
    requires: "Write-access API key + your approval",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-text-muted hover:text-white transition mb-6 inline-block">
            &larr; Back to RevReclaim
          </Link>
          <h1 className="text-3xl font-bold text-white mb-4">
            Exactly what RevReclaim does with your data
          </h1>
          <p className="text-text-muted text-lg">
            We deal with your billing data. That&apos;s sensitive, and you should know exactly
            what happens. Here&apos;s the full breakdown.
          </p>
        </div>

        {/* Step 1: The Scan */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">The Scan (read-only)</h2>
              <p className="text-sm text-text-muted">Nothing changes in your account</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">What we read from Stripe:</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">&#10003;</span>
                Subscriptions (status, price, discount, dates)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">&#10003;</span>
                Invoices (payment status, amounts, retry history)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">&#10003;</span>
                Coupons (active, expired, redemption count)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">&#10003;</span>
                Payment methods (card expiry dates only)
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">What we do NOT read:</h3>
              <ul className="space-y-2 text-sm text-text-dim">
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Full card numbers (we only see last 4 digits + expiry)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Bank account details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Customer passwords or login credentials
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger mt-0.5">&#10007;</span>
                  Your Stripe dashboard settings or configurations
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-brand/20 bg-brand/5 px-5 py-4">
            <p className="text-sm text-brand font-medium">
              The scan API key is restricted to read-only permissions. It literally cannot
              make changes to your account, even if we wanted to.
            </p>
          </div>
        </section>

        {/* Step 2: The 10 Scanners */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">10 Checks We Run</h2>
              <p className="text-sm text-text-muted">Each one looks for a specific billing issue</p>
            </div>
          </div>

          <div className="space-y-3">
            {SCANNERS.map((scanner, i) => (
              <details key={i} className="group rounded-xl border border-border bg-surface">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-dim w-5">{i + 1}</span>
                    <span className="text-sm font-semibold text-white">{scanner.name}</span>
                  </div>
                  <svg className="h-4 w-4 text-text-dim transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                  <p className="text-sm text-text-muted"><span className="text-white font-medium">What it checks:</span> {scanner.what}</p>
                  <p className="text-sm text-text-muted"><span className="text-white font-medium">Data it reads:</span> {scanner.reads}</p>
                  <p className="text-sm text-text-dim italic">Example: {scanner.example}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Step 3: Recovery Actions */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recovery Actions (only if you approve)</h2>
              <p className="text-sm text-text-muted">Nothing runs automatically. You approve each one.</p>
            </div>
          </div>

          <div className="rounded-xl border border-warning/20 bg-warning/5 px-5 py-4 mb-6">
            <p className="text-sm text-warning font-medium">
              Recovery actions require a separate API key with write permissions.
              This is different from the scan key. You choose if and when to add it.
            </p>
          </div>

          <div className="space-y-3">
            {ACTIONS.map((action, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface px-5 py-4">
                <h3 className="text-sm font-semibold text-white mb-1">{action.name}</h3>
                <p className="text-sm text-text-muted mb-2">{action.what}</p>
                <p className="text-xs text-text-dim">Requires: {action.requires}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface p-6">
            <h3 className="text-sm font-semibold text-white mb-3">The approval flow:</h3>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white">Action suggested</span>
              <span className="text-text-dim">&rarr;</span>
              <span className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand">You review</span>
              <span className="text-text-dim">&rarr;</span>
              <span className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand">You click approve</span>
              <span className="text-text-dim">&rarr;</span>
              <span className="rounded-lg bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand">Action runs</span>
            </div>
            <p className="text-xs text-text-dim mt-3">
              You can also dismiss any action you don&apos;t want to take.
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold">
              4
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">How we handle your data</h2>
              <p className="text-sm text-text-muted">Short version: we encrypt everything and don&apos;t sell anything</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-brand mt-0.5">&#10003;</span>
              <div>
                <p className="text-sm font-medium text-white">API keys encrypted with AES-256-GCM</p>
                <p className="text-xs text-text-muted">Your Stripe key is encrypted before storage. We can&apos;t read it in plain text.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand mt-0.5">&#10003;</span>
              <div>
                <p className="text-sm font-medium text-white">Customer emails masked in the UI</p>
                <p className="text-xs text-text-muted">We show j***@example.com, not full email addresses. Privacy mode available for screenshots.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand mt-0.5">&#10003;</span>
              <div>
                <p className="text-sm font-medium text-white">No data shared with third parties</p>
                <p className="text-xs text-text-muted">Your billing data stays between you and RevReclaim. We don&apos;t sell, share, or aggregate it.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand mt-0.5">&#10003;</span>
              <div>
                <p className="text-sm font-medium text-white">You can delete everything</p>
                <p className="text-xs text-text-muted">Delete your account from Settings and all data (reports, keys, actions) is permanently removed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-text-muted mb-4">Still have questions? Reply to any email from us or ask in the chat.</p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold text-black hover:bg-brand-light transition"
          >
            Run a Free Scan
          </Link>
        </section>
      </div>
    </main>
  );
}
