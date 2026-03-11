"use client";

import { ScanCounter } from "./ScanCounter";
import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

export function Hero() {
  const sectionRef = useSectionView("hero");

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32 lg:pb-36">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand/5 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Social proof badge — implied authority (Hormozi Hack #9) */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-medium text-brand animate-fade-in-up">
          <span className="inline-block h-2 w-2 rounded-full bg-brand animate-pulse" />
          <ScanCounter /> SaaS billing accounts audited
        </div>

        {/* Headline — Visual, Falsifiable, One Idea (Harry Dry + Hormozi Rule of One) */}
        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-6xl md:leading-[1.1] lg:text-7xl animate-fade-in-up animate-delay-200">
          Your Stripe account is{" "}
          <span className="bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent">
            leaking money
          </span>{" "}
          right now.
        </h1>

        {/* Problem education — bridges Stage 1→2→3 (SPF Framework) */}
        <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl animate-fade-in-up animate-delay-250">
          Failed payments. Expired coupons. Ghost subscriptions.
          <br />
          The average SaaS loses{" "}
          <span className="font-semibold text-danger">$2,340/mo</span> to billing
          mistakes that nobody notices.
        </p>

        {/* Platform badges */}
        <div className="mb-8 flex items-center justify-center gap-3 animate-fade-in-up animate-delay-250">
          <span className="text-xs text-text-dim">Works with</span>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border bg-surface/50 px-3 py-1 text-sm font-semibold text-text-muted">Stripe</span>
            <span className="rounded-full border border-border bg-surface/50 px-3 py-1 text-sm font-semibold text-text-muted">Polar</span>
            <span className="rounded-full border border-border bg-surface/50 px-3 py-1 text-sm font-semibold text-text-muted">Paddle</span>
          </div>
        </div>

        {/* Solution — 90-second promise (Hormozi Value Equation: Time↓ Effort↓) */}
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-text-secondary animate-fade-in-up animate-delay-300">
          We find every leak in 90&nbsp;seconds. Customer names. Dollar amounts. One-click fixes.
        </p>

        {/* CTA — benefit-focused (Neil Patel: CTA = benefit, not action) */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up animate-delay-400">
          <a
            href="/scan"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "hero", action: "scan" }).catch(() => {});
              trackCTAClick("hero", "scan");
            }}
            className="group flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-lg font-bold text-black min-h-[56px] transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="/demo"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "hero", action: "demo" }).catch(() => {});
              trackCTAClick("hero", "demo");
            }}
            className="group flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-4 text-base font-semibold text-white min-h-[52px] transition-all hover:border-brand/30 hover:bg-surface"
          >
            See a Demo Report
            <svg className="h-5 w-5 text-text-muted transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
        {/* Trust stack — risk reduction (Hormozi Value Equation: Risk↓) */}
        <div className="mt-6 flex flex-col items-center gap-2 animate-fade-in-up animate-delay-400">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Free forever
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Read-only access
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Results in 90 seconds
            </span>
          </div>
        </div>

        {/* Proof bar — implied authority: track record, not features (Hormozi Hack #9) */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border-light pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$2.1M+</div>
            <div className="text-xs text-text-muted">Revenue recovered</div>
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
