import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RevReclaim - Find Revenue Leaks in Your Stripe Account",
  description:
    "10 silent billing issues Stripe doesn't alert you about. Free scan, 90 seconds, read-only access. See exactly what's leaking.",
};

export default function ProductHuntPage() {
  return (
    <main className="min-h-screen bg-background text-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-brand/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm font-medium text-brand">
            <span>Live on Product Hunt</span>
          </div>

          <h1 className="mb-5 font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            Your Stripe account is{" "}
            <span className="bg-gradient-to-r from-brand to-emerald-300 bg-clip-text text-transparent">
              leaking money
            </span>{" "}
            right now.
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-[16px] text-text-muted/90 leading-relaxed">
            10 silent billing issues that Stripe doesn&apos;t alert you about. Most
            SaaS founders don&apos;t find them until thousands are already gone.
          </p>

          <a
            href="/scan?utm_source=producthunt"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-brand px-9 py-4 text-[17px] font-bold text-black min-h-[56px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-sm text-text-muted/60">
              Free scan shows your top 3 leaks with full details. No signup required.
            </p>
            <a href="/demo" className="text-sm text-text-muted hover:text-brand transition-colors">
              Not ready? See an example report first &rarr;
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Read-only access
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              90-second scan
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Key deleted after scan
            </span>
          </div>
        </div>
      </section>

      {/* 3 Most Relatable Leak Types */}
      <section className="border-t border-border-light py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
            3 leaks almost every Stripe account has
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Expired Coupons */}
            <div className="rounded-2xl border border-border/50 bg-surface/80 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
                <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Expired Coupons</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Customer signed up with a 50% off coupon 2 years ago. The promo ended, but Stripe
                never removed the discount. You&apos;re still giving them half off.
              </p>
              <div className="mt-4 rounded-lg bg-danger/5 border border-danger/10 px-3 py-2 text-xs text-danger font-medium">
                Typical impact: $50-$500/mo per customer
              </div>
            </div>

            {/* Failed Payments */}
            <div className="rounded-2xl border border-border/50 bg-surface/80 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Failed Payments</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Invoice failed 12 days ago. Customer is still using your product.
                Stripe retried once and gave up. Nobody noticed.
              </p>
              <div className="mt-4 rounded-lg bg-warning/5 border border-warning/10 px-3 py-2 text-xs text-warning font-medium">
                Typical impact: $100-$1,000/mo per customer
              </div>
            </div>

            {/* Legacy Pricing */}
            <div className="rounded-2xl border border-border/50 bg-surface/80 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <svg className="h-5 w-5 text-info" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Legacy Pricing</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                You raised prices 6 months ago. But 30% of your customers are still
                on the old plan. Stripe doesn&apos;t flag this. You just keep losing the difference.
              </p>
              <div className="mt-4 rounded-lg bg-info/5 border border-info/10 px-3 py-2 text-xs text-info font-medium">
                Typical impact: $20-$200/mo per customer
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-text-muted">
            These are 3 of the 10 leak types RevReclaim checks. The free scan covers all 10.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border-light py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
            How it works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 border border-brand/20 text-lg font-bold text-brand">
                1
              </div>
              <h3 className="mb-2 font-semibold text-white">Paste your API key</h3>
              <p className="text-sm text-text-muted">
                Read-only restricted key. We can&apos;t change anything in your account.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 border border-brand/20 text-lg font-bold text-brand">
                2
              </div>
              <h3 className="mb-2 font-semibold text-white">90-second scan</h3>
              <p className="text-sm text-text-muted">
                We check all 10 leak categories. Your key is deleted the moment the scan finishes.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 border border-brand/20 text-lg font-bold text-brand">
                3
              </div>
              <h3 className="mb-2 font-semibold text-white">Fix with direct links</h3>
              <p className="text-sm text-text-muted">
                Each leak comes with a link straight to the customer in Stripe. Click, fix, done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blurred Leak Preview */}
      <section className="border-t border-border-light py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-3 text-center text-2xl font-bold text-white md:text-3xl">
            What your report looks like
          </h2>
          <p className="mb-10 text-center text-sm text-text-muted">
            Free scan shows your top 3 leaks. Upgrade to see all 10 categories.
          </p>

          <div className="rounded-2xl border border-white/[0.06] bg-surface/80 overflow-hidden">
            {/* Report header */}
            <div className="border-b border-white/[0.04] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                  <span className="text-sm font-bold text-warning">70</span>
                </div>
                <div>
                  <div className="text-xs text-white/30">Billing Health Score</div>
                  <div className="text-sm font-semibold text-warning">Needs Attention</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/30">MRR at Risk</div>
                <div className="text-lg font-bold text-danger">$2,340/mo</div>
              </div>
            </div>

            {/* Visible leaks (top 3) */}
            <div className="divide-y divide-white/[0.03]">
              <LeakPreviewRow
                severity="CRITICAL"
                type="Failed Payment"
                impact="$499/mo"
                badge="Recurring"
                badgeColor="text-brand bg-brand/10 border-brand/20"
              />
              <LeakPreviewRow
                severity="HIGH"
                type="Expired Coupon"
                impact="$150/mo"
                badge="Recurring"
                badgeColor="text-brand bg-brand/10 border-brand/20"
              />
              <LeakPreviewRow
                severity="HIGH"
                type="Legacy Pricing"
                impact="$100/mo"
                badge="One-time fix"
                badgeColor="text-white/40 bg-white/[0.04] border-white/10"
              />
            </div>

            {/* Blurred leaks (4-10) */}
            <div className="relative">
              <div className="divide-y divide-white/[0.03] blur-[6px] select-none pointer-events-none">
                <LeakPreviewRow severity="MEDIUM" type="Ghost Subscription" impact="$89/mo" badge="Recurring" badgeColor="text-brand bg-brand/10 border-brand/20" />
                <LeakPreviewRow severity="MEDIUM" type="Expiring Card" impact="$299/mo" badge="Episodic" badgeColor="text-yellow-400 bg-yellow-400/10 border-yellow-400/20" />
                <LeakPreviewRow severity="LOW" type="Never-Expiring Discount" impact="$45/mo" badge="One-time fix" badgeColor="text-white/40 bg-white/[0.04] border-white/10" />
                <LeakPreviewRow severity="LOW" type="Duplicate Subscription" impact="$79/mo" badge="One-time fix" badgeColor="text-white/40 bg-white/[0.04] border-white/10" />
              </div>

              {/* Upgrade overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background/90 via-background/60 to-transparent">
                <div className="rounded-xl border border-brand/20 bg-surface/95 backdrop-blur-sm px-6 py-4 text-center shadow-lg">
                  <p className="text-sm font-semibold text-white mb-1">
                    + 7 more leaks found
                  </p>
                  <p className="text-xs text-text-muted mb-3">
                    Upgrade to see all leaks and get fix instructions
                  </p>
                  <span className="inline-block rounded-lg bg-brand px-4 py-2 text-xs font-bold text-black">
                    Upgrade to See All
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border-light py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
            Takes 90 seconds. Completely free.
          </h2>
          <p className="mb-8 text-sm text-text-muted">
            No signup. No credit card. Free scan shows your top 3 leaks with full details.
            Upgrade to see all and get ongoing monitoring.
          </p>

          <a
            href="/scan?utm_source=producthunt"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-brand px-9 py-4 text-[17px] font-bold text-black min-h-[56px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          <div className="mt-8">
            <Link
              href="/"
              className="text-sm text-text-muted hover:text-brand transition-colors"
            >
              See full details about RevReclaim &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function LeakPreviewRow({
  severity,
  type,
  impact,
  badge,
  badgeColor,
}: {
  severity: string;
  type: string;
  impact: string;
  badge: string;
  badgeColor: string;
}) {
  const sevColor =
    severity === "CRITICAL"
      ? "bg-danger/10 text-danger border-danger/20"
      : severity === "HIGH"
        ? "bg-warning/10 text-warning border-warning/20"
        : severity === "MEDIUM"
          ? "bg-info/10 text-info border-info/20"
          : "bg-white/[0.04] text-white/40 border-white/10";

  return (
    <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className={`shrink-0 rounded-md border px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${sevColor}`}>
          {severity}
        </span>
        <span className="text-xs sm:text-sm font-medium text-white/80 truncate">{type}</span>
        <span className={`shrink-0 rounded-full border px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium hidden sm:inline ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <span className="shrink-0 text-xs sm:text-sm font-bold text-danger">{impact}</span>
    </div>
  );
}
