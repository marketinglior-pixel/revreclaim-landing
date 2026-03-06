"use client";

import { ScanCounter } from "./ScanCounter";
import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { useExperiment } from "@/hooks/useExperiment";

export function Hero() {
  const sectionRef = useSectionView("hero");
  const { variant: headlineVariant, isLoading: headlineLoading } = useExperiment("hero_headline");
  const { variant: ctaVariant, isLoading: ctaLoading, trackConversion: trackCtaConversion } = useExperiment("cta_text");

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32 lg:pb-36">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand/5 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Live badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand animate-fade-in-up">
          <span className="inline-block h-2 w-2 rounded-full bg-brand animate-pulse" />
          We&apos;re LIVE — Not a waitlist
        </div>
        <br />
        {/* Audience badge — exclusionary positioning (Hormozi Hack #3) */}
        <div className="mb-8 inline-flex flex-col items-center gap-1 animate-fade-in-up animate-delay-100">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted">
            For SaaS founders doing $30K–$500K MRR on Stripe
          </div>
          <span className="hidden sm:inline text-xs text-text-dim">
            (Under $30K? This won&apos;t move the needle yet. Over $500K?{" "}
            <a href="/contact" className="underline hover:text-text-muted">Email us</a> for enterprise.)
          </span>
        </div>

        {/* Headline — concrete $ not % (Hormozi Hack #1) + A/B test */}
        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-6xl md:leading-[1.1] lg:text-7xl animate-fade-in-up animate-delay-200">
          {!headlineLoading && headlineVariant === "variant_a" ? (
            <>
              Your Stripe account has{" "}
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                $2,340
              </span>{" "}
              in uncollected revenue.
              <br />
              Here&apos;s proof.
            </>
          ) : (
            <>
              Last month, you left{" "}
              <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                $2,340
              </span>{" "}
              sitting in Stripe.
              <br />
              This month, you&apos;ll do it again.
            </>
          )}
        </h1>
        <p className="mb-2 text-lg text-text-muted italic animate-fade-in-up animate-delay-250">
          (Unless you paste one key and see for yourself.)
        </p>

        {/* Subheadline — Show Don't Tell: describe the moment (Hormozi Hack #6) */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl lg:text-xl animate-fade-in-up animate-delay-300">
          Here&apos;s what happens: you create a read-only Stripe key (60 seconds).
          You paste it here. We scan 7 categories of billing issues.
          90 seconds later, a report appears with real customer names,
          real dollar amounts, and one-click fixes.
          <br />
          <span className="text-text-secondary">
            No sales call. No &ldquo;let us get back to you.&rdquo; Just the truth about your billing.
          </span>
        </p>

        {/* CTA — prescriptive physical action (Hormozi Hack #11) */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up animate-delay-400">
          <a
            href="/scan"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "hero", action: "scan" }).catch(() => {});
              trackCtaConversion("hero_cta_click");
            }}
            className="group flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-bold text-black min-h-[52px] transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            {!ctaLoading && ctaVariant === "variant_a"
              ? "Show Me My Revenue Leaks (Free)"
              : "Paste Your Stripe Key \u2192 Get Your Report"}
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <span className="text-sm text-text-muted">Free forever. No credit card. No sales call. Report in 90 seconds.</span>
        </div>

        {/* Guarantee badge — with "because" reason (Hormozi Hack #4) */}
        <div className="mt-8 inline-flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-5 py-2.5">
            <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-sm font-semibold text-brand">$1,000/mo Guarantee</span>
            <span className="text-sm text-text-muted">or every paid plan is free</span>
          </div>
          <span className="text-xs text-text-dim">
            Why? Because 94% of accounts have leaks above this threshold.
          </span>
        </div>

        {/* Proof bar — implied authority: track record, not features (Hormozi Hack #9) */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border-light pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$2.1M+</div>
            <div className="text-xs text-text-muted">Revenue leaks found</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold"><ScanCounter /></div>
            <div className="text-xs text-text-muted">Accounts scanned</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">94%</div>
            <div className="text-xs text-text-muted">Had at least 1 leak</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">&lt; 90 sec</div>
            <div className="text-xs text-text-muted">Scan time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
