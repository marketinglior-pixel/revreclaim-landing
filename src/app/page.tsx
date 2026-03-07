import type { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { DashboardPreview } from "@/components/DashboardPreview";
import { HowItWorks } from "@/components/HowItWorks";
import { LeakTypes } from "@/components/LeakTypes";
import { SocialProof } from "@/components/SocialProof";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "RevReclaim | Find Hidden Revenue Leaks in Your Stripe, Polar & Paddle",
  description:
    "SaaS founders lose $2,500/mo to billing blind spots. RevReclaim scans your Stripe, Polar, or Paddle account in 90 seconds and shows every leak with one-click fixes. Free forever.",
  alternates: { canonical: "https://revreclaim.com" },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <PageViewTracker page="landing" />
      <Header />
      <Hero />
      <Problem />
      <DashboardPreview />
      <LeakTypes />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
