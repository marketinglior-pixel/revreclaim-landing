import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Revenue Leak Calculator | RevReclaim",
  description:
    "Your SaaS is probably leaking revenue right now. Find out how much in 60 seconds. Based on industry billing research. No signup required.",
  alternates: { canonical: "https://revreclaim.com/calculator" },
  openGraph: {
    title: "SaaS Revenue Leakage Calculator | RevReclaim",
    description:
      "The average SaaS loses 3-5% of ARR to billing issues. Enter your MRR and see your estimated leakage breakdown across 7 categories.",
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
