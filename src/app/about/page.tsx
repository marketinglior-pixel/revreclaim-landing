import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About RevReclaim — SaaS Billing Health Audit Tool",
  description:
    "RevReclaim is a billing health audit tool for SaaS companies. It scans Stripe, Polar, and Paddle accounts to find revenue leaks like expired coupons, failed payments, and stuck subscriptions. Built by a founder who found $28K in annual leaks in his own Stripe account.",
  alternates: { canonical: "https://revreclaim.com/about" },
  openGraph: {
    title: "About RevReclaim — SaaS Billing Health Audit Tool",
    description:
      "RevReclaim scans your billing platform in 90 seconds and finds revenue you're losing to expired coupons, failed payments, and billing errors. Free to use.",
    url: "https://revreclaim.com/about",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "About RevReclaim — SaaS billing health audit",
      },
    ],
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "RevReclaim",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://revreclaim.com",
    description:
      "RevReclaim is a SaaS billing health audit tool that scans Stripe, Polar, and Paddle accounts using read-only API keys. It detects 10 types of revenue leaks including expired coupons, failed payments, stuck subscriptions, legacy pricing, missing payment methods, and duplicate subscriptions. The scan takes under 90 seconds and is free to use.",
    featureList: [
      "Expired coupon detection",
      "Failed payment recovery",
      "Stuck subscription detection",
      "Legacy pricing identification",
      "Expiring card alerts",
      "Missing payment method detection",
      "Unbilled overage detection",
      "Expired trial detection",
      "Duplicate subscription detection",
      "Never-expiring discount detection",
    ],
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "79",
      priceCurrency: "USD",
      offerCount: 3,
    },
    creator: {
      "@type": "Organization",
      name: "RevReclaim",
      url: "https://revreclaim.com",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
        />
      </head>
      <Header />
      <main className="min-h-screen bg-bg pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {/* Page title */}
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            About RevReclaim
          </h1>

          <p className="mb-12 text-lg text-text-muted leading-relaxed">
            RevReclaim is a billing health audit tool for SaaS companies. It connects to your
            Stripe, Polar, or Paddle account with a read-only API key and scans for revenue
            leaks — money you earned but aren&apos;t collecting. The scan takes under 90 seconds
            and is completely free.
          </p>

          {/* What is RevReclaim */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              What is RevReclaim?
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                RevReclaim is an automated billing health scanner that detects revenue leaks in
                SaaS subscription billing. It works with Stripe, Polar, and Paddle — the three
                most common billing platforms for SaaS companies.
              </p>
              <p>
                The tool runs 10 automated checks on your billing data: expired coupons still
                giving discounts, failed payments that were never retried, subscriptions stuck
                in broken states, customers on legacy pricing below your current rates, expiring
                credit cards, missing payment methods, unbilled overages, expired trials,
                duplicate subscriptions, and never-expiring discounts.
              </p>
              <p>
                Most SaaS companies lose between 3% and 8% of their MRR to these types of
                billing errors. The problem is that billing platforms like Stripe don&apos;t flag
                them. They process payments correctly — they just don&apos;t tell you when something
                is silently costing you money.
              </p>
            </div>
          </section>

          {/* Why it exists */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Why RevReclaim Exists
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                RevReclaim started when the founder ran a manual audit on his own Stripe account
                and found over $2,300 per month in revenue leaks — expired coupons still
                discounting active subscriptions, failed payments that were never retried, and
                customers on pricing from two years ago.
              </p>
              <p>
                The manual audit took hours. And it was the kind of thing nobody does regularly
                because it&apos;s tedious, error-prone, and easy to put off. So RevReclaim was
                built to do it automatically, in under 90 seconds, using read-only access to
                your billing data.
              </p>
              <p>
                There are plenty of SaaS analytics tools (Baremetrics, ChartMogul, ProfitWell)
                and dunning tools (Churnkey, Stunning, Gravy). But none of them do a
                comprehensive billing health audit. They either show you dashboards or help you
                recover failed payments. RevReclaim covers the full spectrum — 10 types of
                billing leaks that most founders don&apos;t even know they have.
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              How It Works
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong className="text-white">Connect your billing platform.</strong>{" "}
                  Create a restricted, read-only API key in your Stripe, Polar, or Paddle
                  dashboard. RevReclaim cannot modify your billing data — it only reads.
                </li>
                <li>
                  <strong className="text-white">Run the scan.</strong>{" "}
                  The scanner checks your subscriptions, invoices, coupons, payment methods,
                  and pricing against 10 leak detection rules. This takes under 90 seconds for
                  most accounts.
                </li>
                <li>
                  <strong className="text-white">Review your report.</strong>{" "}
                  Each leak shows the affected customer, the dollar amount at risk, and a
                  one-click link to fix it in your billing dashboard. The report includes a
                  Billing Health Score from 0 to 100.
                </li>
              </ol>
            </div>
          </section>

          {/* Who it's for */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Who Is RevReclaim For?
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                RevReclaim is built for B2B SaaS founders and revenue teams who use Stripe,
                Polar, or Paddle for subscription billing. It works best for companies with
                100+ customers and $30K+ in monthly recurring revenue — the stage where your
                billing account has grown past what one person can manually monitor.
              </p>
              <p>
                If you have fewer than 50 customers, you probably know each one by name and
                can spot issues manually. RevReclaim becomes valuable when your subscription
                base is large enough that billing errors compound silently.
              </p>
            </div>
          </section>

          {/* What makes it different */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              What Makes RevReclaim Different?
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Most tools in the billing space focus on one thing: either analytics dashboards
                (Baremetrics, ChartMogul) or failed payment recovery (Churnkey, Gravy).
                RevReclaim is the first tool that runs a comprehensive billing health audit
                covering 10 different types of revenue leaks.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-white">Not just dunning.</strong> Failed payments are
                  only 1 of 10 leak types RevReclaim detects. Expired coupons, legacy pricing,
                  and stuck subscriptions are often bigger problems.
                </li>
                <li>
                  <strong className="text-white">Not just dashboards.</strong> Analytics tools
                  show you your MRR. RevReclaim shows you the money you&apos;re leaving on the table.
                </li>
                <li>
                  <strong className="text-white">Read-only and secure.</strong> RevReclaim uses
                  restricted API keys with read-only access. It cannot modify your billing,
                  create charges, or access card numbers.
                </li>
                <li>
                  <strong className="text-white">Multi-platform.</strong> Works with Stripe,
                  Polar, and Paddle from a single interface.
                </li>
                <li>
                  <strong className="text-white">Free to try.</strong> The scan is free, with
                  no credit card required. Paid plans add automated monitoring, recovery actions,
                  and team features.
                </li>
              </ul>
            </div>
          </section>

          {/* Pricing summary */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Pricing
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                RevReclaim has three plans:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-white">Free</strong> — Unlimited manual scans, 10 leak checks, export to PDF/CSV.</li>
                <li><strong className="text-white">Pro ($29/mo)</strong> — Automated weekly scans, Recovery Agent, email alerts, priority support.</li>
                <li><strong className="text-white">Team ($79/mo)</strong> — Everything in Pro plus team members and shared dashboard.</li>
              </ul>
              <p>
                All plans include read-only scanning. No contracts. Cancel anytime.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Security & Privacy
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                RevReclaim is designed with security first. API keys are used only during the
                scan and are never stored. All data in transit is encrypted with TLS 1.3. Data
                at rest is encrypted with AES-256-GCM. Customer email addresses are masked in
                the UI and encrypted in the database. Row Level Security ensures each user can
                only access their own scan data.
              </p>
              <p>
                We do not sell, share, or use your billing data for any purpose other than
                generating your scan report. Data is automatically deleted 30 days after
                account cancellation.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-border bg-surface p-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white">
              Try It Free
            </h2>
            <p className="mb-6 text-text-muted">
              Run a free billing health scan on your Stripe, Polar, or Paddle account.
              Under 90 seconds. No credit card required.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-lg font-bold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                Show Me My Leaks
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/calculator"
                className="text-sm text-text-dim hover:text-brand transition-colors"
              >
                Or try the 60-second calculator first &rarr;
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
