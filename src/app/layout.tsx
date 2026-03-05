import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://revreclaim.com"),
  title: "RevReclaim | Find the Revenue Leaking from Your SaaS",
  description:
    "We scan your Stripe account and show you exactly how much revenue you're losing to forgotten discounts, unbilled overages, and outdated pricing. In under 2 minutes.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "RevReclaim | Find the Revenue Leaking from Your SaaS",
    description:
      "Scan your Stripe account in 2 minutes. See exactly how much MRR you're losing to failed payments, expired coupons, and ghost subscriptions.",
    url: "https://revreclaim.com",
    siteName: "RevReclaim",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim | Find the Revenue Leaking from Your SaaS",
    description:
      "Scan your Stripe account in 2 minutes. See exactly how much MRR you're losing to failed payments, expired coupons, and ghost subscriptions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
