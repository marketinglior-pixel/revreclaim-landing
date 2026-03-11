import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim vs ProfitWell — Free Analytics vs Leak Detection",
  description:
    "ProfitWell is free for Paddle users. But it doesn't find the 9 leak types hiding in your billing. See the gap.",
  alternates: { canonical: "https://revreclaim.com/compare/profitwell" },
  openGraph: {
    title: "RevReclaim vs ProfitWell — Free Analytics vs Leak Detection",
    description: "ProfitWell is free for Paddle users. But it doesn't find the 9 leak types hiding in your billing.",
    url: "https://revreclaim.com/compare/profitwell",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RevReclaim vs ProfitWell comparison" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim vs ProfitWell — Free Analytics vs Leak Detection",
    description: "ProfitWell is free for Paddle users. But it doesn't find the 9 leak types hiding in your billing.",
    images: ["/og-image.png"],
  },
};

const COMPARISON_ROWS = [
  {
    category: "MRR / ARR Tracking",
    competitor: "Yes — free for Paddle users. MRR, churn, LTV dashboards.",
    revreclaim: "No. Not an analytics tool. Focused on finding and fixing billing leaks.",
    competitorDoes: true,
    revreclaimDoes: false,
  },
  {
    category: "Price Benchmarking",
    competitor: "Yes — compares your pricing against industry benchmarks.",
    revreclaim: "No. Focuses on finding revenue you're losing, not pricing strategy.",
    competitorDoes: true,
    revreclaimDoes: false,
  },
  {
    category: "Failed Payment Recovery",
    competitor: "Paddle handles this automatically for Paddle users. Not available for Stripe.",
    revreclaim: "Detects all failed payments across Stripe, Polar, and Paddle. AI-powered dunning emails.",
    competitorDoes: "partial" as unknown as boolean,
    revreclaimDoes: true,
  },
  {
    category: "Expired Coupon Detection",
    competitor: "No detection. Doesn't scan individual coupons for expiry issues.",
    revreclaim: "Detects every expired coupon still reducing invoices. Shows exact dollar impact.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Ghost Subscription Detection",
    competitor: "No detection. Shows aggregate churn but doesn't flag stuck subscriptions.",
    revreclaim: "Finds subscriptions in limbo states. Shows which ones need action.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Legacy Pricing Analysis",
    competitor: "Has price intelligence but doesn't flag customers on outdated plans.",
    revreclaim: "Finds every customer on old pricing. Shows the gap per subscription.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Multi-Platform Support",
    competitor: "Paddle only. De-emphasized for non-Paddle users since 2022 acquisition.",
    revreclaim: "Stripe, Polar, and Paddle. One interface for all platforms.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Expiring Card Alerts",
    competitor: "Paddle handles card updates internally. No proactive alerts to you.",
    revreclaim: "90-day proactive warning for all platforms. Pre-dunning before failure.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Billing Health Score",
    competitor: "No health score. Provides aggregate analytics only.",
    revreclaim: "0-100 health score across 6 billing dimensions. Track improvement over time.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "One-Click Fix Links",
    competitor: "No fix links. Paddle dashboard handles some issues automatically.",
    revreclaim: "Direct links to the exact customer/subscription in your billing dashboard.",
    competitorDoes: false,
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

export default function ProfitWellComparePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Hero */}
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
            RevReclaim vs ProfitWell
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            ProfitWell is free.{" "}
            <span className="text-text-muted italic">
              But &ldquo;free analytics&rdquo; doesn&apos;t find the $2,500/mo you&apos;re losing.
            </span>
          </h1>
          <p className="mb-16 max-w-3xl text-lg text-text-muted">
            ProfitWell (now part of Paddle) gives Paddle users free analytics &mdash; MRR, churn, LTV, benchmarking.
            It&apos;s a great deal. But it only works with <span className="text-white font-medium">Paddle</span>.
            If you use Stripe or Polar, you&apos;re out of luck. And even for Paddle users, ProfitWell doesn&apos;t scan for
            the <span className="text-white font-medium">9 billing leak categories</span> that silently drain revenue.
          </p>

          {/* The question */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 md:p-8 mb-12 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">
              &ldquo;I use ProfitWell because it&apos;s free. But what am I missing?&rdquo;
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Free analytics is great. But it only tells you what happened &mdash; not what&apos;s broken.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">What ProfitWell does vs. what RevReclaim does</h2>

            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Feature</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">ProfitWell</th>
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
                        <span className="text-[10px] uppercase tracking-wider text-text-dim font-medium">ProfitWell</span>
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
            <h2 className="text-xl font-bold text-white mb-4">The math on a $50K MRR SaaS</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-surface-dim border border-border p-4 text-center">
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">ProfitWell cost</div>
                <div className="text-2xl font-bold text-brand">$0<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">Free analytics (Paddle only)</div>
              </div>
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 text-center">
                <div className="text-xs text-brand uppercase tracking-wider mb-1">RevReclaim finds</div>
                <div className="text-2xl font-bold text-brand">~$2,500<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">In undetected billing leaks</div>
              </div>
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-center">
                <div className="text-xs text-danger uppercase tracking-wider mb-1">Cost of not checking</div>
                <div className="text-2xl font-bold text-danger">$30,000<span className="text-sm font-normal">/yr</span></div>
                <div className="text-xs text-text-dim mt-1">Revenue lost to billing errors</div>
              </div>
            </div>
          </div>

          {/* Clarification */}
          <div className="rounded-xl border border-border bg-surface p-5 mb-12">
            <h3 className="text-sm font-bold text-white mb-2">
              Use both. ProfitWell is free. RevReclaim scan is free.
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              ProfitWell gives Paddle users free metrics. RevReclaim gives everyone a free billing scan.
              ProfitWell tells you <span className="text-white font-medium">what your numbers are</span>.
              RevReclaim tells you <span className="text-white font-medium">which billing records are leaking money</span>.
              Start with both free tiers. Upgrade when you see the value.
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
              <Link href="/compare/manual-audit" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs Manual Audit</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Free analytics is step one. Finding leaks is step two.
            </h2>
            <p className="text-text-muted mb-8 max-w-lg mx-auto">
              Run a free scan in 90 seconds. See every billing leak hiding behind your metrics.
              Works with Stripe, Polar, and Paddle.
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
                name: "Is ProfitWell the same as RevReclaim?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. ProfitWell (now part of Paddle) provides free revenue analytics for Paddle users. RevReclaim detects billing leaks that analytics tools miss — like expired coupons still discounting active subscriptions, ghost subscriptions, and legacy pricing gaps.",
                },
              },
              {
                "@type": "Question",
                name: "Does ProfitWell work with Stripe?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ProfitWell is now Paddle-exclusive after the 2022 acquisition. It no longer supports Stripe directly. RevReclaim works with Stripe, Paddle, and Polar from a single interface.",
                },
              },
              {
                "@type": "Question",
                name: "What revenue leaks does ProfitWell miss?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ProfitWell doesn't scan for expired coupons, ghost subscriptions, legacy pricing gaps, forever discounts, duplicate subscriptions, unbilled overages, or missing payment methods. RevReclaim checks all 10 leak types in 90 seconds.",
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
