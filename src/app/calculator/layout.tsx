import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "SaaS Revenue Leakage Calculator — How Much Is Your Billing Losing? | RevReclaim",
  description:
    "Calculate how much revenue your SaaS is losing to billing blind spots. Based on data from 847+ scanned accounts. Free tool — no signup required.",
  alternates: { canonical: "https://revreclaim.com/calculator" },
  openGraph: {
    title: "SaaS Revenue Leakage Calculator | RevReclaim",
    description:
      "The average SaaS loses 3-5% of ARR to billing issues. Enter your MRR and see your estimated leakage breakdown across 8 categories.",
    url: "https://revreclaim.com/calculator",
    type: "website",
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
