import type { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { DailyLossCalculator } from "@/components/DailyLossCalculator";
import { DashboardPreview } from "@/components/DashboardPreview";
import { FreeValueStack } from "@/components/FreeValueStack";
import { HowItWorks } from "@/components/HowItWorks";
import { ObstacleSection } from "@/components/ObstacleSection";
import { SecuritySection } from "@/components/SecuritySection";
import { SocialProof } from "@/components/SocialProof";
import { Pricing } from "@/components/Pricing";
import { LeakTypes } from "@/components/LeakTypes";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "RevReclaim | Free SaaS Billing Leak Audit in 90 Seconds",
  description:
    "SaaS founders lose $2,500/mo to billing blind spots. Scan your Stripe, Paddle, or Polar account in 90 seconds. Find every leak. Free.",
  alternates: { canonical: "https://revreclaim.com" },
  openGraph: {
    title: "RevReclaim | Free SaaS Billing Leak Audit in 90 Seconds",
    description:
      "SaaS founders lose $2,500/mo to billing blind spots. Scan your Stripe, Paddle, or Polar account in 90 seconds. Find every leak. Free.",
    url: "https://revreclaim.com",
    type: "website",
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
    title: "RevReclaim | Free SaaS Billing Leak Audit in 90 Seconds",
    description:
      "SaaS founders lose $2,500/mo to billing blind spots. Scan your Stripe, Paddle, or Polar account in 90 seconds. Find every leak. Free.",
    images: ["/og-image.png"],
  },
};

/* Hormozi Grand Slam Offer flow: Dream → Pain → Urgency → Show → Stack → How → Trust → Proof → Decision → Detail → FAQ → Close */
export default function Home() {
  return (
    <main className="min-h-screen">
      <PageViewTracker page="landing" />
      <Header />
      <Hero />
      <Problem />
      <DailyLossCalculator />
      <DashboardPreview />
      <FreeValueStack />
      <HowItWorks />
      <ObstacleSection />
      <SecuritySection />
      <SocialProof />
      <Pricing />
      <LeakTypes />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
