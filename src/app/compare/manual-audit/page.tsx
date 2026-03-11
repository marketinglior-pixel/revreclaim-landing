import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim vs Manual Stripe Audit — 90 Seconds vs 3 Hours",
  description:
    "A manual Stripe audit takes 3+ hours and misses half the leaks. RevReclaim runs 10 checks in 90 seconds. See the comparison.",
  alternates: { canonical: "https://revreclaim.com/compare/manual-audit" },
  openGraph: {
    title: "RevReclaim vs Manual Stripe Audit — 90 Seconds vs 3 Hours",
    description: "A manual audit takes 3+ hours and misses half the leaks. RevReclaim runs 10 checks in 90 seconds.",
    url: "https://revreclaim.com/compare/manual-audit",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RevReclaim vs Manual Stripe Audit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim vs Manual Stripe Audit — 90 Seconds vs 3 Hours",
    description: "A manual audit takes 3+ hours and misses half the leaks. RevReclaim runs 10 checks in 90 seconds.",
    images: ["/og-image.png"],
  },
};

const COMPARISON_ROWS = [
  {
    category: "Time to Complete",
    competitor: "3-4 hours minimum. More for accounts with 500+ customers.",
    revreclaim: "Under 90 seconds. Larger accounts up to 3 minutes.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Expired Coupon Detection",
    competitor: "Possible with Stripe API. Requires custom scripts to cross-reference coupon expiry dates with active subscriptions.",
    revreclaim: "Automatic. Finds every expired coupon still discounting. Shows exact dollar impact.",
    competitorDoes: "partial" as unknown as boolean,
    revreclaimDoes: true,
  },
  {
    category: "Ghost Subscription Detection",
    competitor: "Possible via dashboard filters. Manual review of past_due and unpaid statuses. Easy to miss edge cases.",
    revreclaim: "Automatic. Catches all limbo states including past_due, unpaid, and incomplete_expired.",
    competitorDoes: "partial" as unknown as boolean,
    revreclaimDoes: true,
  },
  {
    category: "Legacy Pricing Analysis",
    competitor: "Very difficult. Requires comparing every subscription's price against current price list. Most founders skip this.",
    revreclaim: "Automatic. Compares every subscription against current pricing. Shows gap per customer.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Expiring Card Detection",
    competitor: "Possible via Stripe API. Requires looping through all payment methods and checking expiry dates.",
    revreclaim: "Automatic. 90-day lookahead with probability-weighted risk scoring.",
    competitorDoes: "partial" as unknown as boolean,
    revreclaimDoes: true,
  },
  {
    category: "Repeatability",
    competitor: "Must repeat the entire 3-4 hour process every time. New leaks appear monthly.",
    revreclaim: "One-click rescan. Auto-scans available on Pro plan ($29/mo).",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Multi-Platform Support",
    competitor: "Each platform requires a separate process. Stripe, Paddle, and Polar all have different APIs.",
    revreclaim: "One interface for Stripe, Polar, and Paddle. Same 10 checks across all.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Technical Skill Required",
    competitor: "Requires Stripe API knowledge, JSON parsing, and spreadsheet skills.",
    revreclaim: "Paste a read-only API key. No technical skill required.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Billing Health Score",
    competitor: "No standardized score. You get raw data that you have to interpret yourself.",
    revreclaim: "0-100 health score across 6 dimensions. Compare against benchmarks.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Cost",
    competitor: "Free (but costs 3-4 hours of founder time per audit).",
    revreclaim: "Free scan. $29/mo for automated monitoring.",
    competitorDoes: true,
    revreclaimDoes: true,
  },
];

function StatusIcon({ does }: { does: boolean | string }) {
  if (does === "partial") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/15">
        <svg className="h-3.5 w-3.5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </div>
    );
  }
  if (does) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/15">
        <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-danger/15">
      <svg className="h-3.5 w-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

export default function ManualAuditComparePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Hero */}
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
            RevReclaim vs Manual Audit
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            A manual Stripe audit takes 3 hours.{" "}
            <span className="text-text-muted italic">
              And still misses half the leaks.
            </span>
          </h1>
          <p className="mb-16 max-w-3xl text-lg text-text-muted">
            You <em>can</em> audit your Stripe account manually. Export CSVs, filter by status, cross-reference coupons,
            check payment methods one by one. Some founders do this quarterly.
            But it takes <span className="text-white font-medium">3-4 hours</span>, requires
            <span className="text-white font-medium"> API knowledge</span>, and most people still
            miss legacy pricing gaps, forever discounts, and unbilled overages. RevReclaim runs all 10 checks in 90 seconds.
          </p>

          {/* The question */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 md:p-8 mb-12 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">
              &ldquo;I&apos;ll just check my Stripe dashboard. How hard can it be?&rdquo;
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Not hard &mdash; just time-consuming and incomplete. Here&apos;s what you&apos;ll miss.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Manual audit vs. RevReclaim scan</h2>

            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Category</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Manual Audit</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand">RevReclaim</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.category} className={`border-b border-border last:border-b-0 ${i % 2 === 0 ? "bg-surface/50" : "bg-surface-dim"}`}>
                      <td className="px-5 py-4"><span className="text-sm font-semibold text-white">{row.category}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <StatusIcon does={row.competitorDoes} />
                          <span className="text-sm text-text-muted">{row.competitor}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <StatusIcon does={row.revreclaimDoes} />
                          <span className="text-sm text-text-secondary">{row.revreclaim}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {COMPARISON_ROWS.map((row) => (
                <div key={row.category} className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-bold text-white mb-3">{row.category}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <StatusIcon does={row.competitorDoes} />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-text-dim font-medium">Manual</span>
                        <p className="text-xs text-text-muted">{row.competitor}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <StatusIcon does={row.revreclaimDoes} />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-brand font-medium">RevReclaim</span>
                        <p className="text-xs text-text-secondary">{row.revreclaim}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The math */}
          <div className="rounded-2xl border border-border bg-surface p-6 md:p-8 mb-12">
            <h2 className="text-xl font-bold text-white mb-4">The real cost of a manual audit</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-surface-dim border border-border p-4 text-center">
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Your time</div>
                <div className="text-2xl font-bold text-text-muted">3-4 hrs</div>
                <div className="text-xs text-text-dim mt-1">Per audit (monthly = 36-48 hrs/yr)</div>
              </div>
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-center">
                <div className="text-xs text-danger uppercase tracking-wider mb-1">Leaks missed</div>
                <div className="text-2xl font-bold text-danger">~50%</div>
                <div className="text-xs text-text-dim mt-1">Legacy pricing + forever discounts + overages</div>
              </div>
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 text-center">
                <div className="text-xs text-brand uppercase tracking-wider mb-1">RevReclaim</div>
                <div className="text-2xl font-bold text-brand">90 sec</div>
                <div className="text-xs text-text-dim mt-1">All 10 checks. Every leak. Every time.</div>
              </div>
            </div>
          </div>

          {/* Clarification */}
          <div className="rounded-xl border border-border bg-surface p-5 mb-12">
            <h3 className="text-sm font-bold text-white mb-2">
              Manual auditing works &mdash; until it doesn&apos;t.
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              If you have 20 customers, a manual audit is fine. You probably know each customer by name.
              But once you pass <span className="text-white font-medium">100+ customers</span> and
              <span className="text-white font-medium"> $30K+ MRR</span>, billing complexity outgrows what one person
              can manually check. That&apos;s when automated scanning saves you hours and catches what you&apos;d miss.
              We wrote a complete <Link href="/blog/audit-stripe-account-revenue-leaks" className="text-brand underline underline-offset-2 hover:text-brand-light">manual audit guide</Link> if you want to try it yourself first.
            </p>
          </div>

          {/* Other comparisons */}
          <div className="mb-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Other comparisons
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/compare/stripe-dunning" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs Stripe Dunning</Link>
              <Link href="/compare/baremetrics" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs Baremetrics</Link>
              <Link href="/compare/chartmogul" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs ChartMogul</Link>
              <Link href="/compare/profitwell" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs ProfitWell</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Skip the spreadsheets. Get results in 90 seconds.
            </h2>
            <p className="text-text-muted mb-8 max-w-lg mx-auto">
              Paste a read-only API key. Get a complete billing audit with every leak,
              dollar amounts, and direct fix links. Free. No signup required.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-4 text-sm font-bold text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition"
            >
              Find My Hidden Revenue &rarr; Free Scan
            </Link>
            <p className="mt-4 text-xs text-text-dim">
              Works with Stripe, Polar, and Paddle. Read-only access. Key never stored.
            </p>
          </div>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does a manual Stripe audit take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A thorough manual Stripe audit takes 3-4 hours for a typical account with 100-500 customers. It requires exporting CSVs, filtering by status, cross-referencing coupons, and checking payment methods. RevReclaim runs the same checks in 90 seconds.",
                },
              },
              {
                "@type": "Question",
                name: "What do manual Stripe audits miss?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Manual audits typically catch failed payments and obvious cancellations but miss expired coupons still discounting, ghost subscriptions in limbo states, legacy pricing gaps, forever discounts, and duplicate subscriptions — roughly 50% of total leaks.",
                },
              },
              {
                "@type": "Question",
                name: "Is there a free tool to audit my Stripe account?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. RevReclaim offers a free billing leak scan that checks 10 leak types in 90 seconds using read-only API access. No signup required, no credit card, and your API key is never stored.",
                },
              },
            ],
          }),
        }}
      />

      <Footer />
    </div>
  );
}
