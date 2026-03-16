import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ExternalAnalytics from "@/components/ExternalAnalytics";
import UTMCapture from "@/components/UTMCapture";
import PostHogProvider from "@/components/PostHogProvider";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revreclaim.com"),
  verification: {
    google: "llleqEOxKm_NMJMV1M6vUbe3XFLOE1X0mHOKFZpsJ4M",
  },
  title: "RevReclaim | SaaS Billing Health Audit — Find Revenue Leaks in 90 Seconds",
  description:
    "RevReclaim is a billing health audit tool for SaaS companies. Scan your Stripe, Polar, or Paddle account in 90 seconds to find 10 types of revenue leaks: expired coupons, failed payments, stuck subscriptions, legacy pricing, and more. Free to use. No credit card required.",
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "https://revreclaim.com",
  },
  openGraph: {
    title: "RevReclaim | SaaS Billing Health Audit — Find Revenue Leaks in 90 Seconds",
    description:
      "RevReclaim is a billing health audit tool for SaaS companies. Scan your Stripe, Polar, or Paddle account in 90 seconds to find 10 types of revenue leaks. Free, no credit card required.",
    url: "https://revreclaim.com",
    siteName: "RevReclaim",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevReclaim — Find hidden revenue leaks in your billing data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim | SaaS Billing Health Audit — Find Revenue Leaks in 90 Seconds",
    description:
      "RevReclaim is a billing health audit tool for SaaS companies. Scan your Stripe, Polar, or Paddle account in 90 seconds to find 10 types of revenue leaks. Free, no credit card required.",
    images: ["/og-image.png"],
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://revreclaim.com/#organization",
      name: "RevReclaim",
      url: "https://revreclaim.com",
      logo: "https://revreclaim.com/icon.svg",
      description:
        "RevReclaim is a SaaS billing health audit tool. It scans Stripe, Polar, and Paddle accounts using read-only API keys to detect 10 types of revenue leaks including expired coupons, failed payments, stuck subscriptions, legacy pricing, and duplicate subscriptions. The scan takes under 90 seconds and is free to use. SaaS companies typically lose 3-8% of MRR to billing errors that platforms like Stripe don't flag.",
      foundingDate: "2026",
      sameAs: [
        "https://x.com/revreclaim",
        "https://github.com/revreclaim",
        "https://www.producthunt.com/products/revreclaim",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://revreclaim.com/contact",
      },
      knowsAbout: [
        "SaaS revenue leakage",
        "Billing health audit",
        "Stripe billing optimization",
        "Subscription revenue recovery",
        "Failed payment recovery",
        "SaaS billing errors",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://revreclaim.com/#website",
      url: "https://revreclaim.com",
      name: "RevReclaim",
      description:
        "RevReclaim is a billing health audit tool for SaaS companies using Stripe, Polar, or Paddle. Free scan finds revenue leaks in 90 seconds.",
      publisher: { "@id": "https://revreclaim.com/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://revreclaim.com/#software",
      name: "RevReclaim",
      alternateName: "RevReclaim Billing Health Scanner",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Revenue Optimization",
      operatingSystem: "Web",
      url: "https://revreclaim.com",
      description:
        "RevReclaim is a billing health audit tool for SaaS companies. It scans Stripe, Polar, and Paddle billing data in 90 seconds using read-only API keys to find 10 types of revenue leaks: expired coupons still discounting, failed payments never retried, stuck subscriptions, legacy pricing below current rates, expiring credit cards, missing payment methods, unbilled overages, expired trials, duplicate subscriptions, and never-expiring discounts. SaaS companies typically lose 3-8% of MRR to these billing errors. RevReclaim is free to scan, with paid plans for automated monitoring and recovery.",
      disambiguatingDescription:
        "RevReclaim is a comprehensive SaaS billing health audit tool — not a dunning tool or analytics dashboard. While dunning tools like Churnkey handle only failed payments, and analytics tools like Baremetrics show MRR dashboards, RevReclaim scans for 10 types of billing leaks across Stripe, Paddle, and Polar. It uses read-only API keys and cannot modify billing data. Distinct from chargeback recovery services, payment analytics platforms, and subscription management tools.",
      featureList:
        "Expired coupon detection, Failed payment recovery alerts, Stuck subscription detection, Legacy pricing identification, Expiring card warnings, Missing payment method alerts, Unbilled overage detection, Expired trial detection, Duplicate subscription detection, Never-expiring discount detection, Billing Health Score, Multi-platform support (Stripe, Polar, Paddle)",
      screenshot: "https://revreclaim.com/og-image.png",
      softwareHelp: {
        "@type": "CreativeWork",
        url: "https://revreclaim.com/blog",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description:
            "Unlimited manual scans, 10 leak type checks, export to PDF/CSV. Free forever, no credit card required.",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "29",
          priceCurrency: "USD",
          billingIncrement: "P1M",
          description:
            "Automated weekly scans, Recovery Agent for one-click fixes, email alerts when new leaks detected, priority support.",
        },
        {
          "@type": "Offer",
          name: "Team",
          price: "79",
          priceCurrency: "USD",
          billingIncrement: "P1M",
          description:
            "Everything in Pro plus team member access, shared dashboard, and collaborative leak management.",
        },
      ],
    },
    {
      "@type": "HowTo",
      "@id": "https://revreclaim.com/#howto",
      name: "How to Find Revenue Leaks in Your SaaS Billing",
      description:
        "Use RevReclaim to scan your Stripe, Polar, or Paddle account for revenue leaks in under 90 seconds. Free, read-only, and no credit card required.",
      totalTime: "PT2M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Create a read-only API key",
          text: "Go to your billing platform (Stripe, Polar, or Paddle) and create a restricted API key with read-only access to Customers, Subscriptions, Invoices, Products, Prices, Coupons, and Payment Methods.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Run the scan",
          text: "Paste your read-only key into RevReclaim. The scanner runs 10 automated checks on your billing data in under 90 seconds.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Review and fix leaks",
          text: "Each detected leak shows the affected customer, dollar amount at risk, and a direct link to fix it in your billing dashboard. Your Billing Health Score shows your overall billing health from 0 to 100.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is my billing data safe?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. We only read data — we cannot modify your billing, create charges, or access card numbers. All supported platforms (Stripe, Polar, Paddle) support restricted read-only keys. Your key is used only during the scan and is never stored or logged.",
          },
        },
        {
          "@type": "Question",
          name: "Which billing platforms do you support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We support Stripe, Polar.sh, and Paddle. Select your platform on the scan page and we'll guide you through creating an API key. Each platform gets a tailored scan covering the leak types it supports.",
          },
        },
        {
          "@type": "Question",
          name: "What permissions does the API key need?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Read access for: Customers, Subscriptions, Invoices, Products, Prices, Coupons, and Payment Methods (exact names vary by platform). We provide step-by-step instructions on the scan page. It takes about 60 seconds to create.",
          },
        },
        {
          "@type": "Question",
          name: "How long does the scan take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Under 90 seconds for most accounts. Larger accounts (1,000+ customers) may take up to 3 minutes. You'll see real-time progress as we scan each category.",
          },
        },
        {
          "@type": "Question",
          name: "What exactly do you scan for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We run 10 automated checks: (1) Expired coupons still discounting, (2) Legacy pricing below current rates, (3) Forever discounts with no end date, (4) Stuck subscriptions stuck in bad states, (5) Expiring cards within 90 days, (6) Uncollected revenue with open invoices, (7) Missing payment methods on active subscriptions, (8) Unbilled overages — quantity mismatches and usage exceeding plan limits, (9) Expired trials — subscriptions stuck in trialing status, (10) Duplicate subscriptions — customers charged twice after failed upgrades.",
          },
        },
        {
          "@type": "Question",
          name: "What do I do with the report?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Open the report. See the leak. See the dollar amount. See the one-sentence fix. Click the link — it takes you straight to that customer in your billing dashboard. Fix it. That money hits your account next billing cycle.",
          },
        },
        {
          "@type": "Question",
          name: "What if you don't find any leaks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Then your billing is clean. You get a perfect health score and some peace of mind. The free scan costs you nothing either way. If you're on a paid plan and we find less than $1,000/mo, you pay nothing.",
          },
        },
        {
          "@type": "Question",
          name: "What happens when a Stripe coupon expires?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "When a Stripe coupon's redeem_by date passes, the coupon stops accepting new redemptions — but existing subscriptions keep the discount indefinitely. Stripe does not auto-remove expired coupons from active subscriptions. RevReclaim scans for these zombie discounts and shows you exactly which subscriptions are affected and how much they're costing you.",
          },
        },
        {
          "@type": "Question",
          name: "Is this the same as chargeback recovery?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Chargeback tools handle disputed payments. We find revenue you earned but aren't collecting: expired discounts still running, subscriptions stuck in failed states, cards about to expire, and outdated pricing that was never updated. Different problem, different fix.",
          },
        },
        {
          "@type": "Question",
          name: "Can I cancel the monthly plan anytime?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. No contracts, no lock-in. Cancel anytime from your dashboard. Your data is deleted within 30 days of cancellation.",
          },
        },
        {
          "@type": "Question",
          name: "Is this worth it if I have fewer than 50 customers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Probably not. Revenue leaks compound with scale. If you have 10 customers, you probably know each one by name. RevReclaim is built for the stage where your billing account has grown past what one person can monitor — typically 100+ customers, $30K+ MRR.",
          },
        },
        {
          "@type": "Question",
          name: "Why should I trust you with my billing data?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Fair question. We designed RevReclaim to work with restricted, read-only API keys scoped to specific resources. We only perform read operations, never modify your data, never see card numbers, and never store the key after the scan.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <PostHogProvider>
          <ExternalAnalytics />
          <UTMCapture />
          {children}
          <FeedbackWidget />
        </PostHogProvider>
        <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
        {/* @ts-expect-error - ElevenLabs custom element */}
        <elevenlabs-convai agent-id="agent_4601kkt0963me2svvrs47s83tthz"></elevenlabs-convai>
      </body>
    </html>
  );
}
