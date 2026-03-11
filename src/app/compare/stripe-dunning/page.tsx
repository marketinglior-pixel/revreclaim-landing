import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RevReclaim vs Stripe Dunning — What Stripe Doesn't Tell You",
  description:
    "Stripe sends 47 webhooks. None say 'you're losing $2,500/mo.' See what built-in dunning misses and how RevReclaim finds it.",
  alternates: { canonical: "https://revreclaim.com/compare/stripe-dunning" },
  openGraph: {
    title: "RevReclaim vs Stripe Dunning — What Stripe Doesn't Tell You",
    description:
      "Stripe sends 47 webhooks. None say 'you're losing $2,500/mo.' See what built-in dunning misses.",
    url: "https://revreclaim.com/compare/stripe-dunning",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevReclaim vs Stripe Dunning — side by side comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim vs Stripe Dunning — What Stripe Doesn't Tell You",
    description:
      "Stripe sends 47 webhooks. None say 'you're losing $2,500/mo.' See what built-in dunning misses.",
    images: ["/og-image.png"],
  },
};

/**
 * Comparison page: RevReclaim vs Stripe's built-in dunning.
 *
 * Purpose: "Naive Questions as Hooks" — challenge the incumbent assumption
 * that Stripe handles billing recovery automatically. This page serves as:
 * 1. SEO content targeting "Stripe dunning" and "Stripe revenue recovery"
 * 2. Ad landing page for LinkedIn/Google campaigns
 * 3. Social media link destination from "naive question" posts
 */

const COMPARISON_ROWS = [
  {
    category: "Expired Coupons",
    stripe: "No detection. Expired coupons continue discounting silently.",
    revreclaim: "Detects every expired coupon still reducing invoices. Shows exact dollar impact per customer.",
    stripeDoes: false,
  },
  {
    category: "Legacy Pricing",
    stripe: "No detection. Price increases don't retroactively update existing subscriptions.",
    revreclaim: "Finds every customer still on old pricing. Shows the gap between current and legacy rate.",
    stripeDoes: false,
  },
  {
    category: "Forever Discounts",
    stripe: "No warning. Coupons set to 'forever' run indefinitely.",
    revreclaim: "Flags all never-expiring discounts. Shows lifetime cost if left unchanged.",
    stripeDoes: false,
  },
  {
    category: "Ghost Subscriptions",
    stripe: "Shows status as 'past_due' but doesn't alert you or take action.",
    revreclaim: "Finds subscriptions stuck in limbo states. AI agents can auto-resolve or cancel.",
    stripeDoes: false,
  },
  {
    category: "Expiring Cards",
    stripe: "Sends card expiry emails to customers (if enabled in settings). No dashboard alert to you.",
    revreclaim: "Proactive 90-day warning. Pre-dunning emails before the card actually fails.",
    stripeDoes: "partial" as unknown as boolean,
  },
  {
    category: "Failed Payments",
    stripe: "Built-in Smart Retries (automatic retry schedule). Basic dunning emails.",
    revreclaim: "Detects failed payments + sends AI-powered dunning emails with personalized messaging. Tracks recovery.",
    stripeDoes: "partial" as unknown as boolean,
  },
  {
    category: "Missing Payment Methods",
    stripe: "No detection. Active subscriptions without payment methods sit silently.",
    revreclaim: "Flags every subscription missing a payment method before the next billing attempt.",
    stripeDoes: false,
  },
  {
    category: "Unbilled Overages",
    stripe: "No detection. Quantity mismatches and usage above plan limits go unnoticed.",
    revreclaim: "Finds subscriptions where seat count or usage exceeds what's being billed. Shows the exact gap.",
    stripeDoes: false,
  },
  {
    category: "Expired Trials",
    stripe: "No detection. Subscriptions can sit in 'trialing' status indefinitely if webhooks fail.",
    revreclaim: "Flags trials past 45 days and active subscriptions billing $0 despite having priced items.",
    stripeDoes: false,
  },
  {
    category: "Duplicate Subscriptions",
    stripe: "No detection. Multiple active subscriptions for the same customer are allowed.",
    revreclaim: "Finds customers with overlapping subscriptions for the same product. Prevents chargebacks from double-billing.",
    stripeDoes: false,
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

export default function StripeDunningComparePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-white">
      <Header />

      <main className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          {/* Hero */}
          <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
            RevReclaim vs Stripe Dunning
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Stripe sends you 47 webhooks.{" "}
            <span className="text-text-muted italic">
              None of them say &ldquo;you&apos;re losing $2,500/month.&rdquo;
            </span>
          </h1>
          <p className="mb-16 max-w-3xl text-lg text-text-muted">
            Stripe&apos;s built-in dunning handles <span className="text-white font-medium">one thing</span>: retrying failed payments.
            But failed payments are just <span className="text-white font-medium">1 of 10 categories</span> of revenue leaks hiding in your billing data.
            The other 9? Stripe doesn&apos;t detect them, doesn&apos;t flag them, and doesn&apos;t tell you they exist.
          </p>

          {/* The question */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 md:p-8 mb-12 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">
              &ldquo;Why doesn&apos;t Stripe tell me when a coupon expires but the discount keeps running?&rdquo;
            </p>
            <p className="mt-3 text-sm text-text-muted">
              Good question. We asked it too. Then we built the tool that answers it.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">What Stripe does vs. what RevReclaim does</h2>

            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Leak Category
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Stripe Built-in
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
                          <StatusIcon does={row.stripeDoes} />
                          <span className="text-sm text-text-muted">{row.stripe}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <StatusIcon does={true} />
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
                      <StatusIcon does={row.stripeDoes} />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-text-dim font-medium">Stripe</span>
                        <p className="text-xs text-text-muted">{row.stripe}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <StatusIcon does={true} />
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
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Stripe catches</div>
                <div className="text-2xl font-bold text-text-muted">~$400<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">Failed payment retries only</div>
              </div>
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 text-center">
                <div className="text-xs text-brand uppercase tracking-wider mb-1">RevReclaim catches</div>
                <div className="text-2xl font-bold text-brand">~$2,500<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">All 10 leak categories</div>
              </div>
              <div className="rounded-xl bg-danger/5 border border-danger/20 p-4 text-center">
                <div className="text-xs text-danger uppercase tracking-wider mb-1">You&apos;re missing</div>
                <div className="text-2xl font-bold text-danger">~$2,100<span className="text-sm font-normal">/mo</span></div>
                <div className="text-xs text-text-dim mt-1">$25,200/year left on the table</div>
              </div>
            </div>
          </div>

          {/* Important clarification */}
          <div className="rounded-xl border border-border bg-surface p-5 mb-12">
            <h3 className="text-sm font-bold text-white mb-2">
              We&apos;re not saying Stripe is bad.
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Stripe is the best payment infrastructure in the world. But it&apos;s infrastructure &mdash; not a billing auditor.
              Stripe processes your payments. RevReclaim finds the money your billing setup is leaving behind.
              They&apos;re complementary, not competitive. We read your Stripe data to find what Stripe doesn&apos;t surface to you.
            </p>
          </div>

          {/* Other comparisons */}
          <div className="mb-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Other comparisons
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/compare/baremetrics" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs Baremetrics</Link>
              <Link href="/compare/chartmogul" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs ChartMogul</Link>
              <Link href="/compare/profitwell" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs ProfitWell</Link>
              <Link href="/compare/manual-audit" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">vs Manual Audit</Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              See what Stripe isn&apos;t showing you.
            </h2>
            <p className="text-text-muted mb-8 max-w-lg mx-auto">
              Paste a read-only Stripe API key. Get a report with every leak identified, real dollar amounts,
              and one-click fixes. 90 seconds. Free. No credit card.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-4 text-sm font-bold text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition"
            >
              Find My Hidden Revenue → Free Scan
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
                name: "Does Stripe automatically recover failed payments?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stripe's Smart Retries handle some failed payments, but they only cover 1 of 10 leak types. Expired coupons, ghost subscriptions, and legacy pricing gaps are not addressed by Stripe's built-in dunning.",
                },
              },
              {
                "@type": "Question",
                name: "What's the difference between Stripe dunning and RevReclaim?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stripe dunning retries failed payments. RevReclaim scans for 10 types of revenue leaks including expired coupons, ghost subscriptions, and legacy pricing — issues Stripe doesn't flag.",
                },
              },
              {
                "@type": "Question",
                name: "How much revenue does Stripe dunning miss?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "On a typical $50K MRR account, Stripe dunning recovers ~$400/mo in failed payments. RevReclaim finds ~$2,500/mo across all 10 leak types — a gap of ~$2,100/mo ($25,200/year).",
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
