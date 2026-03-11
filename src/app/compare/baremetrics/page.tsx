import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim vs Baremetrics — Analytics vs Leak Detection",
  description:
    "Baremetrics tracks your MRR. RevReclaim finds the $2,500/mo hiding behind it. See what analytics dashboards miss.",
  alternates: { canonical: "https://revreclaim.com/compare/baremetrics" },
  openGraph: {
    title: "RevReclaim vs Baremetrics — Analytics vs Leak Detection",
    description:
      "Baremetrics tracks your MRR. RevReclaim finds the $2,500/mo hiding behind it.",
    url: "https://revreclaim.com/compare/baremetrics",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RevReclaim vs Baremetrics comparison" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim vs Baremetrics — Analytics vs Leak Detection",
    description: "Baremetrics tracks your MRR. RevReclaim finds the $2,500/mo hiding behind it.",
    images: ["/og-image.png"],
  },
};

const COMPARISON_ROWS = [
  {
    category: "MRR / ARR Tracking",
    competitor: "Yes — real-time MRR, ARR, churn, LTV dashboards.",
    revreclaim: "No. Not an analytics tool. Focused on finding and fixing billing leaks.",
    competitorDoes: true,
    revreclaimDoes: false,
  },
  {
    category: "Failed Payment Recovery",
    competitor: "Yes — Recover add-on sends dunning emails and in-app reminders for failed payments.",
    revreclaim: "Detects failed payments + AI-powered personalized dunning emails. Tracks recovery per customer.",
    competitorDoes: true,
    revreclaimDoes: true,
  },
  {
    category: "Expired Coupon Detection",
    competitor: "No detection. Expired coupons continue discounting silently.",
    revreclaim: "Detects every expired coupon still reducing invoices. Shows exact dollar impact.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Ghost Subscription Detection",
    competitor: "No detection. Shows aggregate churn but doesn't flag individual stuck subscriptions.",
    revreclaim: "Finds subscriptions in limbo states. AI agents can auto-resolve or cancel.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Legacy Pricing Analysis",
    competitor: "No detection. Doesn't compare current prices vs. what customers are actually paying.",
    revreclaim: "Finds every customer on old pricing. Shows the gap between current and legacy rate.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Expiring Card Alerts",
    competitor: "No proactive alerts. Relies on failed payment flow after the card expires.",
    revreclaim: "90-day proactive warning. Pre-dunning emails before the card actually fails.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Forever Discount Detection",
    competitor: "No detection. Coupons set to 'forever' run indefinitely without warning.",
    revreclaim: "Flags all never-expiring discounts. Shows lifetime cost if left unchanged.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Billing Health Score",
    competitor: "No health score. Provides churn rate and MRR trends only.",
    revreclaim: "0-100 health score across 6 billing dimensions. Track improvement over time.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "One-Click Fix Links",
    competitor: "No fix links. Shows data but doesn't link to the source record.",
    revreclaim: "Direct links to the exact customer/subscription in your billing dashboard.",
    competitorDoes: false,
    revreclaimDoes: true,
  },
  {
    category: "Free Tier",
    competitor: "No free tier. Starts at $108/mo for up to $50K MRR.",
    revreclaim: "Free forever scan. Monitoring from $29/mo.",
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

export default function BaremetricsComparePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Hero */}
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
            RevReclaim vs Baremetrics
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Baremetrics shows your MRR is $50K.{" "}
            <span className="text-text-muted italic">
              It doesn&apos;t mention $2,500 of it is phantom revenue.
            </span>
          </h1>
          <p className="mb-16 max-w-3xl text-lg text-text-muted">
            Baremetrics is a great analytics dashboard. It tracks MRR, churn, LTV, and recovers failed payments with Recover.
            But analytics tools work with <span className="text-white font-medium">aggregate data</span>.
            Revenue leaks hide in <span className="text-white font-medium">individual records</span> &mdash;
            expired coupons, ghost subscriptions, legacy pricing gaps. Baremetrics doesn&apos;t scan for those.
          </p>

          {/* The question */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 md:p-8 mb-12 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">
              &ldquo;My Baremetrics dashboard says MRR is growing. So why does my bank account tell a different story?&rdquo;
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Because aggregate metrics don&apos;t catch record-level billing errors. That&apos;s what we built RevReclaim for.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">What Baremetrics does vs. what RevReclaim does</h2>

            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Feature
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Baremetrics
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-brand">
                      RevReclaim
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.category}
                      className={`border-b border-border last:border-b-0 ${
                        i % 2 === 0 ? "bg-surface/50" : "bg-surface-dim"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-white">{row.category}</span>
                      </td>
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

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {COMPARISON_ROWS.map((row) => (
                <div key={row.category} className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-bold text-white mb-3">{row.category}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <StatusIcon does={row.competitorDoes} />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-text-dim font-medium">Baremetrics</span>
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
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Baremetrics Recover</div>
                <div className="text-2xl font-bold text-text-muted">~$400<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">Failed payments only</div>
              </div>
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 text-center">
                <div className="text-xs text-brand uppercase tracking-wider mb-1">RevReclaim catches</div>
                <div className="text-2xl font-bold text-brand">~$2,500<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">All 10 leak categories</div>
              </div>
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-center">
                <div className="text-xs text-danger uppercase tracking-wider mb-1">Baremetrics misses</div>
                <div className="text-2xl font-bold text-danger">~$2,100<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">$25,200/year in undetected leaks</div>
              </div>
            </div>
          </div>

          {/* Clarification */}
          <div className="rounded-xl border border-border bg-surface p-5 mb-12">
            <h3 className="text-sm font-bold text-white mb-2">
              They&apos;re complementary, not competitive.
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Baremetrics is excellent at what it does: SaaS analytics and failed payment recovery.
              RevReclaim is excellent at what it does: finding billing leaks that analytics dashboards don&apos;t detect.
              The ideal stack uses both. Baremetrics tracks your metrics. RevReclaim cleans your billing.
              Together, you get <span className="text-white font-medium">accurate numbers and recovered revenue</span>.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              See what your dashboard is missing.
            </h2>
            <p className="text-text-muted mb-8 max-w-lg mx-auto">
              Run a free scan in 90 seconds. See every billing leak with dollar amounts
              and one-click fixes. Works alongside Baremetrics.
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

      <Footer />
    </div>
  );
}
