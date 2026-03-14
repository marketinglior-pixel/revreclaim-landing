import type { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { DailyLossCalculator } from "@/components/DailyLossCalculator";
import { DashboardPreview } from "@/components/DashboardPreview";
import { SocialProof } from "@/components/SocialProof";
import { HowItWorks } from "@/components/HowItWorks";
import { FreeValueStack } from "@/components/FreeValueStack";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { ObstacleSection } from "@/components/ObstacleSection";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "RevReclaim | Free SaaS Billing Leak Scan — Stripe, Polar, Paddle",
  description:
    "Scan your Stripe, Polar, or Paddle account for billing leaks in 90 seconds. Failed payments, expired coupons, legacy pricing, expiring cards. Free scan, read-only access.",
  alternates: { canonical: "https://revreclaim.com" },
  openGraph: {
    title: "RevReclaim | Free SaaS Billing Leak Scan",
    description:
      "Scan your billing account for revenue leaks in 90 seconds. Free, read-only, no signup required.",
    url: "https://revreclaim.com",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevReclaim — Find billing leaks in your SaaS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim | Free SaaS Billing Leak Scan",
    description:
      "Scan your billing account for revenue leaks in 90 seconds. Free, read-only, no signup required.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <PageViewTracker page="landing" />
      <Header />
      <Hero />
      <Problem />
      <DailyLossCalculator />
      <DashboardPreview />
      <SocialProof />
      <HowItWorks />
      <FreeValueStack />
      <GuaranteeSection />
      <ObstacleSection />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
