import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ExternalAnalytics from "@/components/ExternalAnalytics";
import UTMCapture from "@/components/UTMCapture";
import PostHogProvider from "@/components/PostHogProvider";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revreclaim.com"),
  verification: {
    google: "llleqEOxKm_NMJMV1M6vUbe3XFLOE1X0mHOKFZpsJ4M",
  },
  title: "RevReclaim | Find SaaS Revenue Leaks in 90 Seconds",
  description:
    "Scan your Stripe, Polar, or Paddle account in 90 seconds. Find expired coupons, failed payments, and stuck subscriptions. Free. No credit card.",
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "https://revreclaim.com",
  },
  openGraph: {
    title: "RevReclaim | Find SaaS Revenue Leaks in 90 Seconds",
    description:
      "Scan your Stripe, Polar, or Paddle account in 90 seconds. Find expired coupons, failed payments, and stuck subscriptions. Free. No credit card.",
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
    title: "RevReclaim | Find SaaS Revenue Leaks in 90 Seconds",
    description:
      "Scan your Stripe, Polar, or Paddle account in 90 seconds. Find expired coupons, failed payments, and stuck subscriptions. Free. No credit card.",
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
        "RevReclaim scans your Stripe, Polar, or Paddle account and finds hidden revenue leaks — expired coupons, failed payments, stuck subscriptions, and more.",
      sameAs: [
        "https://x.com/revreclaim",
        "https://github.com/revreclaim",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://revreclaim.com/contact",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://revreclaim.com/#website",
      url: "https://revreclaim.com",
      name: "RevReclaim",
      publisher: { "@id": "https://revreclaim.com/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://revreclaim.com/#software",
      name: "RevReclaim",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://revreclaim.com",
      description:
        "Revenue leak detection for SaaS. Scans Stripe, Polar, and Paddle billing data in 90 seconds to find failed payments, expired coupons, stuck subscriptions, and more.",
      disambiguatingDescription:
        "A SaaS billing leak detection tool that scans Stripe, Paddle, and Polar accounts using read-only API keys to find revenue leaks like expired coupons, stuck subscriptions, and failed payments. Distinct from chargeback recovery services or dunning automation platforms.",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: "Unlimited scans, 10 leak checks, export to PDF/CSV",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "29",
          priceCurrency: "USD",
          billingIncrement: "P1M",
          description:
            "Auto-scans, Recovery Agent, email alerts, priority support",
        },
        {
          "@type": "Offer",
          name: "Team",
          price: "79",
          priceCurrency: "USD",
          billingIncrement: "P1M",
          description: "Everything in Pro plus team members and shared dashboard",
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
      </body>
    </html>
  );
}
