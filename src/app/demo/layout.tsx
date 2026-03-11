import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Report — See What RevReclaim Finds | RevReclaim",
  description:
    "See a real RevReclaim scan report: 23 revenue leaks found, $4,830/mo at risk, $57,960/yr recovery potential. Every leak identified, dollar amounts, and one-click fixes.",
  alternates: { canonical: "https://revreclaim.com/demo" },
  openGraph: {
    title: "Demo Report — See What RevReclaim Finds",
    description:
      "A real scan found $57,960/yr in hidden revenue leaks. See the full report with every leak, amounts, and fixes.",
    url: "https://revreclaim.com/demo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevReclaim Demo Report — 23 leaks found, $57,960/yr recovery potential",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo Report — See What RevReclaim Finds",
    description:
      "A real scan found $57,960/yr in hidden revenue leaks. See the full report with every leak, amounts, and fixes.",
    images: ["/og-image.png"],
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
