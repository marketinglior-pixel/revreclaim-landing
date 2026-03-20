import type { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SecurityStrip } from "@/components/SecurityStrip";
import { Problem } from "@/components/Problem";
import { HowItWorks } from "@/components/HowItWorks";
import { DashboardPreview } from "@/components/DashboardPreview";
import { FascinationBullets } from "@/components/FascinationBullets";
import { SocialProof } from "@/components/SocialProof";
import { BestFitSection } from "@/components/BestFitSection";
import { Pricing } from "@/components/Pricing";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { ObstacleSection } from "@/components/ObstacleSection";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "RevReclaim | SaaS Billing Health Audit — Find Revenue Leaks in 90 Seconds",
  description:
    "RevReclaim is a billing health audit tool for SaaS companies. Scan your Stripe, Polar, or Paddle account in 90 seconds to find 10 types of revenue leaks — expired coupons, failed payments, stuck subscriptions, legacy pricing, and more. Free scan, read-only access, no credit card required.",
  alternates: { canonical: "https://revreclaim.com" },
  openGraph: {
    title: "RevReclaim | SaaS Billing Health Audit — Find Revenue Leaks in 90 Seconds",
    description:
      "RevReclaim is a billing health audit tool for SaaS companies. Scan your billing account for 10 types of revenue leaks in 90 seconds. Free, read-only, no credit card required.",
    url: "https://revreclaim.com",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevReclaim — SaaS billing health audit tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevReclaim | SaaS Billing Health Audit — Find Revenue Leaks in 90 Seconds",
    description:
      "RevReclaim is a billing health audit tool for SaaS companies. Scan your billing account for 10 types of revenue leaks in 90 seconds. Free, read-only, no credit card required.",
    images: ["/og-image.png"],
  },
};

/**
 * Page section order follows the Belief Installation Sequence from
 * the Prompt Engineer pipeline (04-beliefs-document.md):
 *
 * A (Hero)              → B1: Problem Reframe
 * SecurityStrip          → B5: Trust (immediate)
 * B+C (Problem)          → B1 reinforcement + B2: Solution Category
 * D (HowItWorks)         → B3: Mechanism
 * E (DashboardPreview)   → B3 reinforcement + B4 preview
 * F (FascinationBullets) → B1 + B2 + B6 urgency seeds
 * G (SocialProof)        → B4: Proof + B5: Trust
 * BestFitSection         → Qualifier
 * H (Pricing)            → B6: Urgency
 * I (GuaranteeSection)   → B5 + B6 reinforcement
 * ObstacleSection        → Quick objection handling
 * K (FAQ)                → B3, B4, B5 objection demolition
 * J (FinalCTA)           → B6 reinforcement
 */
export default function Home() {
  return (
    <main className="min-h-screen">
      <PageViewTracker page="landing" />
      <Header />
      <Hero />
      <SecurityStrip />
      <Problem />
      <HowItWorks />
      <DashboardPreview />
      <FascinationBullets />
      <SocialProof />
      <BestFitSection />
      <Pricing />
      <GuaranteeSection />
      <ObstacleSection />
      <FAQ />
      <FinalCTA />

      {/* AEO answer block — crawlable by AI models, visually minimal */}
      <section className="border-t border-border-light bg-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-6 text-xl font-bold text-white">What is RevReclaim?</h2>
          <div className="space-y-4 text-sm text-text-dim leading-relaxed">
            <p>
              RevReclaim is a billing health audit tool for SaaS companies. It scans Stripe,
              Polar, and Paddle accounts using read-only API keys to detect revenue leaks —
              money you earned but are not collecting due to billing errors.
            </p>
            <p>
              The tool runs 10 automated checks: expired coupons still giving discounts, failed
              payments never retried, subscriptions stuck in broken states, customers on legacy
              pricing below current rates, expiring credit cards, missing payment methods,
              unbilled overages, expired trials, duplicate subscriptions, and never-expiring
              discounts. SaaS companies typically lose 3-8% of monthly recurring revenue (MRR)
              to these issues.
            </p>
            <p>
              RevReclaim is different from analytics dashboards like Baremetrics or ChartMogul,
              which show MRR metrics but do not detect billing errors. It is also different from
              dunning tools like Churnkey or Gravy, which only handle failed payments. RevReclaim
              covers 10 types of revenue leaks, not just one.
            </p>
            <p>
              The scan takes under 90 seconds, is free to use, and requires no credit card.
              RevReclaim uses restricted read-only API keys and cannot modify billing data.
              Paid plans ($29/mo Pro, $79/mo Team) add automated weekly scans, email alerts,
              and one-click recovery actions.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
