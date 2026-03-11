import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Revenue Leak Calculator | RevReclaim",
  description:
    "Calculate how much revenue your SaaS is losing to billing blind spots. Based on data from 847+ scanned accounts. Free tool — no signup required.",
  alternates: { canonical: "https://revreclaim.com/calculator" },
  openGraph: {
    title: "SaaS Revenue Leakage Calculator | RevReclaim",
    description:
      "The average SaaS loses 3-5% of ARR to billing issues. Enter your MRR and see your estimated leakage breakdown across 8 categories.",
    url: "https://revreclaim.com/calculator",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SaaS Revenue Leak Calculator — see your estimated billing leakage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Revenue Leak Calculator | RevReclaim",
    description:
      "The average SaaS loses 3-5% of ARR to billing issues. Enter your MRR and see your estimated leakage breakdown.",
    images: ["/og-image.png"],
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
