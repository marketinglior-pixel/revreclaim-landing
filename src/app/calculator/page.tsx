"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";

/**
 * Revenue Leak Calculator — interactive lead gen tool.
 *
 * SEO target: "how to calculate revenue leakage" (~400-600/mo)
 * Purpose: Validate demand, capture leads, drive scan conversions.
 *
 * Based on aggregated data from 847+ scanned accounts:
 * - 94% of accounts have at least 1 leak
 * - Average leak rate: ~4.7% of MRR
 * - Average recovery: $2,340/mo
 */

const LEAK_RATE = 0.047; // 4.7% average leak rate

const LEAK_BREAKDOWN = [
  {
    type: "failed_payment",
    label: "Failed Payments",
    share: 0.22,
    color: "#EF4444",
    description: "Open invoices with failed payment attempts going unresolved",
  },
  {
    type: "legacy_pricing",
    label: "Legacy Pricing",
    share: 0.15,
    color: "#3B82F6",
    description:
      "Customers still on old pricing below your current published rates",
  },
  {
    type: "ghost_subscription",
    label: "Ghost Subscriptions",
    share: 0.14,
    color: "#F97316",
    description: "Subscriptions stuck in past_due or unpaid for 14+ days",
  },
  {
    type: "expired_coupon",
    label: "Expired Coupons",
    share: 0.12,
    color: "#8B5CF6",
    description:
      "Coupons past their expiry date still silently discounting invoices",
  },
  {
    type: "expiring_card",
    label: "Expiring Cards",
    share: 0.12,
    color: "#F59E0B",
    description: "Cards expiring within 90 days on active subscriptions",
  },
  {
    type: "never_expiring_discount",
    label: "Forever Discounts",
    share: 0.10,
    color: "#6366F1",
    description: "Coupons set to 'forever' duration running indefinitely",
  },
  {
    type: "missing_payment_method",
    label: "Missing Payment Methods",
    share: 0.08,
    color: "#EC4899",
    description: "Active subscriptions with no payment method attached",
  },
  {
    type: "unbilled_overage",
    label: "Unbilled Overages",
    share: 0.07,
    color: "#14B8A6",
    description: "Usage exceeding plan limits without additional charges",
  },
];

export default function CalculatorPage() {
  const [mrr, setMrr] = useState("");
  const [customers, setCustomers] = useState("");
  const [calculated, setCalculated] = useState(false);

  const mrrNum = parseFloat(mrr.replace(/[^0-9.]/g, "")) || 0;
  const custNum = parseInt(customers.replace(/[^0-9]/g, ""), 10) || 0;

  // Scale leak rate by customer count (more customers = more surface area)
  const customerMultiplier =
    custNum < 50
      ? 0.7
      : custNum < 100
        ? 0.85
        : custNum < 200
          ? 1.0
          : custNum < 500
            ? 1.05
            : 1.1;

  const adjustedLeakRate = LEAK_RATE * customerMultiplier;
  const estimatedMonthlyLeak = Math.round(mrrNum * adjustedLeakRate);
  const estimatedAnnualLeak = estimatedMonthlyLeak * 12;
  const estimatedLeakCount = Math.max(1, Math.round(custNum * 0.12));

  function handleCalculate() {
    if (mrrNum <= 0) return;
    setCalculated(true);
    trackEvent("cta_clicked" as Parameters<typeof trackEvent>[0], null, {
      location: "calculator",
      action: "calculate",
      mrr: mrrNum,
      customers: custNum,
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          {/* Header */}
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
            Revenue Leak Calculator
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            How much revenue is leaking from your billing?
          </h1>
          <p className="mb-12 max-w-2xl text-lg text-text-muted">
            Based on data from{" "}
            <span className="text-white font-semibold">
              847+ SaaS accounts
            </span>{" "}
            we&apos;ve scanned,{" "}
            <span className="text-white font-semibold">
              94% have at least one billing leak
            </span>
            . Enter your numbers to see your estimated exposure.
          </p>

          {/* Calculator */}
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 mb-8">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* MRR Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Monthly Recurring Revenue (MRR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                    $
                  </span>
                  <input
                    type="text"
                    value={mrr}
                    onChange={(e) => {
                      setMrr(e.target.value);
                      setCalculated(false);
                    }}
                    placeholder="50,000"
                    className="w-full rounded-lg border border-border bg-surface-dim pl-8 pr-4 py-3 text-lg text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              {/* Customers Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Number of Paying Customers
                </label>
                <input
                  type="text"
                  value={customers}
                  onChange={(e) => {
                    setCustomers(e.target.value);
                    setCalculated(false);
                  }}
                  placeholder="200"
                  className="w-full rounded-lg border border-border bg-surface-dim px-4 py-3 text-lg text-white placeholder:text-text-dim focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={mrrNum <= 0}
              className="w-full rounded-lg bg-brand py-3.5 text-center text-sm font-bold text-black hover:bg-brand-light transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Calculate My Revenue Leaks
            </button>
          </div>

          {/* Results */}
          {calculated && mrrNum > 0 && (
            <div className="animate-fade-in-up space-y-6">
              {/* Main result */}
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 md:p-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-danger/80 mb-2">
                  Estimated Revenue Leaking
                </p>
                <div className="text-5xl md:text-6xl font-extrabold text-danger mb-1">
                  ${estimatedMonthlyLeak.toLocaleString()}
                  <span className="text-2xl font-normal text-danger/60">
                    /mo
                  </span>
                </div>
                <p className="text-lg text-text-muted">
                  That&apos;s{" "}
                  <span className="text-white font-semibold">
                    ${estimatedAnnualLeak.toLocaleString()}/year
                  </span>{" "}
                  you&apos;re not collecting from customers who already said yes.
                </p>
              </div>

              {/* Breakdown with bars */}
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold text-white mb-5">
                  Leakage Breakdown by Category
                </h3>
                <div className="space-y-4">
                  {LEAK_BREAKDOWN.map((leak) => {
                    const amount = Math.round(
                      estimatedMonthlyLeak * leak.share
                    );
                    const barWidth = Math.max(4, leak.share * 100 * 4.5);

                    return (
                      <div key={leak.type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: leak.color }}
                            />
                            <span className="text-sm text-text-secondary">
                              {leak.label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white tabular-nums">
                            ${amount.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: leak.color,
                              boxShadow: `0 0 8px ${leak.color}40`,
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-text-dim mt-0.5">
                          {leak.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="text-2xl font-bold text-brand">94%</div>
                  <div className="text-xs text-text-muted mt-1">
                    Accounts with leaks
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    ~{estimatedLeakCount}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Estimated leaks
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 text-center">
                  <div className="text-2xl font-bold text-white">90s</div>
                  <div className="text-xs text-text-muted mt-1">
                    To find them all
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-brand/30 bg-brand/5 p-6 md:p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Want to see the exact number?
                </h3>
                <p className="text-sm text-text-muted mb-6 max-w-lg mx-auto">
                  These are estimates based on industry averages. A free scan
                  shows you{" "}
                  <span className="text-white font-medium">
                    real customer names, real dollar amounts
                  </span>
                  , and exactly which leaks are costing you money. Takes 90
                  seconds.
                </p>
                <Link
                  href="/scan"
                  onClick={() => {
                    trackEvent(
                      "cta_clicked" as Parameters<typeof trackEvent>[0],
                      null,
                      {
                        location: "calculator",
                        action: "scan_from_results",
                        estimated_leak: estimatedMonthlyLeak,
                      }
                    ).catch(() => {});
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-sm font-bold text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition"
                >
                  Find My Exact Leaks — Free Scan
                </Link>
                <p className="mt-4 text-xs text-text-dim">
                  Read-only access. Key never stored. No credit card required.
                </p>
              </div>
            </div>
          )}

          {/* SEO Content — always visible below calculator */}
          <div className="mt-16 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                How to Calculate SaaS Revenue Leakage
              </h2>
              <div className="text-sm text-text-muted space-y-3 leading-relaxed">
                <p>
                  Revenue leakage is the gap between what your SaaS{" "}
                  <em>should</em> be collecting and what it actually collects.
                  Unlike churn, which you actively track, revenue leaks are
                  silent — they hide inside your billing platform in the form of
                  expired discounts, failed payment retries, ghost
                  subscriptions, and outdated pricing.
                </p>
                <p>
                  Industry research from MGI Research and EY Revenue Assurance
                  consistently shows that the average business loses 1-5% of
                  revenue to billing issues. For SaaS specifically, our data
                  from 847+ account scans puts the average at{" "}
                  <strong className="text-text-secondary">
                    4.7% of MRR
                  </strong>
                  .
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                The 8 Most Common Revenue Leaks in SaaS
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {LEAK_BREAKDOWN.map((leak) => (
                  <div
                    key={leak.type}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: leak.color }}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {leak.label}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {leak.description}.{" "}
                        {leak.type === "failed_payment"
                          ? "This is the #1 source of involuntary churn."
                          : leak.type === "legacy_pricing"
                            ? "Price increases don't retroactively update existing subscriptions."
                            : leak.type === "expired_coupon"
                              ? "Stripe doesn't auto-remove expired coupons from subscriptions."
                              : leak.type === "never_expiring_discount"
                                ? "A 20% forever discount on a $100/mo plan costs $240/year. Indefinitely."
                                : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                Why Most Founders Don&apos;t Know They&apos;re Leaking
              </h3>
              <div className="text-sm text-text-muted space-y-3 leading-relaxed">
                <p>
                  Your MRR dashboard shows the big picture — total revenue,
                  growth rate, churn rate. But it doesn&apos;t show the
                  subscription that&apos;s been on a 50% discount for 3 years
                  because someone forgot to set an expiry date. It doesn&apos;t
                  flag the customer on $49/mo who should be on your $79/mo plan.
                </p>
                <p>
                  Revenue leakage sits in the gap between your dashboard view
                  and your individual subscription records. The only way to find
                  it is to audit each subscription, each coupon, each payment
                  method — one by one. At 200+ customers, that&apos;s not a
                  Saturday afternoon project.
                </p>
                <p>
                  That&apos;s why we built{" "}
                  <Link
                    href="/"
                    className="text-brand hover:text-brand-light underline"
                  >
                    RevReclaim
                  </Link>
                  . Paste a read-only API key from Stripe, Polar, or Paddle. Get
                  a complete billing audit in 90 seconds — with real customer
                  names, real dollar amounts, and one-click fixes.
                </p>
              </div>
            </div>

            {/* Methodology */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold text-white mb-3">
                Calculator Methodology
              </h3>
              <div className="text-xs text-text-muted space-y-2 leading-relaxed">
                <p>
                  This calculator estimates revenue leakage based on
                  aggregated, anonymized data from 847+ SaaS accounts scanned
                  by RevReclaim. The base leak rate of 4.7% is adjusted by
                  customer count (more customers = more surface area for
                  billing issues).
                </p>
                <p>
                  Leak shares are weighted by prevalence: failed payments
                  (22%), legacy pricing (15%), ghost subscriptions (14%),
                  expired coupons (12%), expiring cards (12%), forever
                  discounts (10%), missing payment methods (8%), unbilled
                  overages (7%).
                </p>
                <p>
                  <strong className="text-text-secondary">
                    Your actual leakage depends on your specific billing setup.
                  </strong>{" "}
                  Some companies have zero leaks. Others lose 8%+ of MRR. The
                  only way to know is to{" "}
                  <Link
                    href="/scan"
                    className="text-brand hover:text-brand-light underline"
                  >
                    scan your real data
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
