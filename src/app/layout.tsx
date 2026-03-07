import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revreclaim.com"),
  title: "RevReclaim | Your Stripe Has Revenue Leaks. We Prove It in 90 Seconds.",
  description:
    "Paste a read-only Stripe key. Get a report in 90 seconds showing every dollar you're losing to expired coupons, failed payments, and ghost subscriptions. Free. No credit card.",
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "https://revreclaim.com",
  },
  openGraph: {
    title: "RevReclaim | Your Stripe Has Revenue Leaks. We Prove It in 90 Seconds.",
    description:
      "Paste a read-only Stripe key. See real customer names, real dollar amounts, and one-click fixes in 90 seconds. 94% of SaaS accounts have leaks. Free scan.",
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
    title: "RevReclaim | Your Stripe Has Revenue Leaks. We Prove It in 90 Seconds.",
    description:
      "Paste a read-only Stripe key. See real customer names, real dollar amounts, and one-click fixes in 90 seconds. 94% of SaaS accounts have leaks. Free scan.",
    images: ["/og-image.png"],
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "RevReclaim",
      url: "https://revreclaim.com",
      logo: "https://revreclaim.com/icon.svg",
      description:
        "RevReclaim scans your Stripe, Polar, or Paddle account and finds hidden revenue leaks — expired coupons, failed payments, ghost subscriptions, and more.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://revreclaim.com/contact",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "RevReclaim",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://revreclaim.com",
      description:
        "Revenue leak detection for SaaS. Scans Stripe, Polar, and Paddle billing data in 90 seconds to find failed payments, expired coupons, ghost subscriptions, and more.",
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: "Unlimited scans, 7 leak checks, export to PDF/CSV",
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
            text: "Yes. We only read data — we cannot modify your billing, create charges, or access card numbers. Your key is used only during the scan and is never stored or logged.",
          },
        },
        {
          "@type": "Question",
          name: "Which billing platforms do you support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We support Stripe, Polar.sh, and Paddle. Select your platform on the scan page and we'll guide you through creating an API key.",
          },
        },
        {
          "@type": "Question",
          name: "How long does the scan take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Under 90 seconds for most accounts. Larger accounts (1,000+ customers) may take up to 3 minutes.",
          },
        },
        {
          "@type": "Question",
          name: "What exactly do you scan for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We run 7 automated checks: failed payments, ghost subscriptions, expiring cards, expired coupons, forever discounts, legacy pricing, and missing payment methods.",
          },
        },
        {
          "@type": "Question",
          name: "What if you don't find any leaks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Then your billing is in better shape than 94% of accounts we've scanned. If you're on a paid plan and we find less than $1,000/mo, you pay nothing.",
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
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
