import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim vs ChartMogul — Revenue Analytics vs Leak Detection",
  description:
    "ChartMogul shows your churn rate. RevReclaim shows the $2,500/mo causing it. See what revenue analytics misses.",
  alternates: { canonical: "https://revreclaim.com/compare/chartmogul" },
  openGraph: {
    title: "RevReclaim vs ChartMogul — Revenue Analytics vs Leak Detection",
    description: "ChartMogul shows your churn rate. RevReclaim shows the $2,500/mo causing it.",
    url: "https://revreclaim.com/compare/chartmogul",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RevReclaim vs ChartMogul comparison" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim vs ChartMogul — Revenue Analytics vs Leak Detection",
    description: "ChartMogul shows your churn rate. RevReclaim shows the $2,500/mo causing it.",
    images: ["/og-image.png"],
  },
};

const COMPARISON_ROWS = [
  {
    category: "MRR / ARR Tracking",
    competitor: "Yes — real-time MRR, ARR, churn, LTV, ARPU with 10+ integrations.",
    revreclaim: "No. Not an analytics tool. Focused on finding and fixing billing leaks.",
    competitorDoes: true,
    revreclaimDoes: false,
  },
  {
    category: "Revenue Recognition",
    competitor: "Yes — ASC 606 / IFRS 15 compliant revenue recognition.",
    revreclaim: "No. Not an accounting tool.",
    competitorDoes: true,
    revreclaimDoes: false,
  },
  {
    category: "Failed Payment Detection",
    competitor: "No detection or recovery. Shows aggregate churn data only.",
    revreclaim: "Detects every failed payment. AI-powered dunning emails with recovery tracking.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Expired Coupon Detection",
    competitor: "No detection. Doesn't examine individual coupons or their status.",
    revreclaim: "Detects every expired coupon still reducing invoices. Shows exact dollar impact.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Ghost Subscription Detection",
    competitor: "No detection. Counts ghost subscriptions as active MRR.",
    revreclaim: "Finds subscriptions in limbo states. Corrects your real MRR figure.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Legacy Pricing Analysis",
    competitor: "No detection. Doesn't compare current prices vs. what customers pay.",
    revreclaim: "Finds every customer on old pricing. Shows the exact revenue gap.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Expiring Card Alerts",
    competitor: "No proactive alerts. Cards expire silently until payment fails.",
    revreclaim: "90-day proactive warning. Pre-dunning emails before the card fails.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Cohort Analysis",
    competitor: "Yes — best-in-class cohort analysis and customer segmentation.",
    revreclaim: "No. Not an analytics tool.",
    competitorDoes: true,
    revreclaimDoes: false,
  },
  {
    category: "Billing Health Score",
    competitor: "No health score. Provides churn metrics and trends only.",
    revreclaim: "0-100 health score across 6 billing dimensions. Track improvement over time.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "One-Click Fix Links",
    competitor: "No fix links. Analytics only — no action layer.",
    revreclaim: "Direct links to the exact customer/subscription in your billing dashboard.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
];

function StatusIcon({ does }: { does: boolean }) {
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

export default function ChartMogulComparePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Hero */}
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
            RevReclaim vs ChartMogul
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            ChartMogul says your MRR is $50K.{" "}
            <span className="text-text-muted italic">
              $2,350 of it is phantom revenue from ghost subscriptions.
            </span>
          </h1>
          <p className="mb-16 max-w-3xl text-lg text-text-muted">
            ChartMogul is the gold standard for SaaS revenue analytics. Cohorts, LTV, churn &mdash; it&apos;s all there.
            But analytics tools work with <span className="text-white font-medium">aggregate sums</span>.
            They add up your subscriptions. They don&apos;t examine each one for errors.
            Ghost subscriptions inflate your MRR. Expired coupons silently discount.
            ChartMogul reports the total. RevReclaim shows what&apos;s broken inside it.
          </p>

          {/* The question */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 md:p-8 mb-12 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">
              &ldquo;ChartMogul says my churn is 5%. But how much of that is billing errors I could have prevented?&rdquo;
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Excellent question. The answer is usually more than you think.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">What ChartMogul does vs. what RevReclaim does</h2>

            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Feature</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">ChartMogul</th>
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
                        <span className="text-[10px] uppercase tracking-wider text-text-dim font-medium">ChartMogul</span>
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
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">ChartMogul shows</div>
                <div className="text-2xl font-bold text-text-muted">$50,000<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">Aggregate MRR (includes phantom)</div>
              </div>
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 text-center">
                <div className="text-xs text-brand uppercase tracking-wider mb-1">RevReclaim finds</div>
                <div className="text-2xl font-bold text-brand">$2,500<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">In billing leaks and phantom MRR</div>
              </div>
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-center">
                <div className="text-xs text-danger uppercase tracking-wider mb-1">Real MRR is actually</div>
                <div className="text-2xl font-bold text-danger">$47,500<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">Fix the leaks to collect what you earned</div>
              </div>
            </div>
          </div>

          {/* Clarification */}
          <div className="rounded-xl border border-border bg-surface p-5 mb-12">
            <h3 className="text-sm font-bold text-white mb-2">
              The ideal stack: ChartMogul + RevReclaim.
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              ChartMogul is the best revenue analytics platform available. RevReclaim is a billing auditor.
              ChartMogul tells you <span className="text-white font-medium">what your numbers are</span>.
              RevReclaim tells you <span className="text-white font-medium">which numbers are wrong and how to fix them</span>.
              Together: accurate metrics and clean billing. ChartMogul free tier + RevReclaim = under $29/mo total.
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
              <Link href="/compare/profitwell" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs ProfitWell</Link>
              <Link href="/compare/manual-audit" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs Manual Audit</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Find the leaks hiding behind your metrics.
            </h2>
            <p className="text-text-muted mb-8 max-w-lg mx-auto">
              Free scan. 90 seconds. See every billing leak with dollar amounts
              and direct fix links. Works alongside ChartMogul.
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
                name: "Does ChartMogul find revenue leaks?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. ChartMogul tracks revenue metrics like MRR, churn, and LTV and provides analytics dashboards. It doesn't scan individual subscriptions for billing configuration errors like expired coupons or ghost subscriptions.",
                },
              },
              {
                "@type": "Question",
                name: "What does RevReclaim do that ChartMogul doesn't?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "RevReclaim scans each subscription for 10 types of billing leaks (expired coupons, ghost subscriptions, legacy pricing, etc.). ChartMogul aggregates revenue data into dashboards but doesn't examine individual records for errors.",
                },
              },
              {
                "@type": "Question",
                name: "Is ChartMogul free?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ChartMogul offers a free tier for companies with up to $10K MRR. RevReclaim's billing leak scan is free for all MRR levels with no limits. Together they cost under $29/mo total.",
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
