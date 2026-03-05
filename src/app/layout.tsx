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
  openGraph: {
    title: "RevReclaim | Your Stripe Has Revenue Leaks. We Prove It in 90 Seconds.",
    description:
      "Paste a read-only Stripe key. See real customer names, real dollar amounts, and one-click fixes in 90 seconds. 94% of SaaS accounts have leaks. Free scan.",
    url: "https://revreclaim.com",
    siteName: "RevReclaim",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim | Your Stripe Has Revenue Leaks. We Prove It in 90 Seconds.",
    description:
      "Paste a read-only Stripe key. See real customer names, real dollar amounts, and one-click fixes in 90 seconds. 94% of SaaS accounts have leaks. Free scan.",
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
