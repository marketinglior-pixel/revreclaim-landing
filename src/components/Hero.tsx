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

        {/* Headline — THE SPECIFIC MOMENT (Harry Dry: visual, falsifiable, unique) */}
        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.2] lg:text-6xl animate-fade-in-up animate-delay-200">
          <span className="bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent">$499</span> is sitting in your
          <br className="hidden md:block" />
          {" "}billing account right now.
        </h1>
        <p className="mb-10 text-xl font-medium text-text-muted md:text-2xl animate-fade-in-up animate-delay-250">
          A failed payment from 12 days ago. Nobody noticed.
          <br />
          <span className="text-base md:text-lg">Your full revenue picture in 90&nbsp;seconds.</span>
        </p>

        {/* ONE CTA — Rule of One (Hormozi) + benefit-focused (Neil Patel) */}
        <div className="flex flex-col items-center gap-4 animate-fade-in-up animate-delay-400">
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
          {/* Trust line — one line, not three (Hormozi: remove clutter) */}
          <span className="text-sm text-text-muted">
            Free &middot; Read-only &middot; 90 seconds &middot; Works with Stripe, Polar &amp; Paddle
          </span>
        </div>

        {/* Low-friction alternative — calculator for cold traffic (Priestley) */}
        <div className="mt-8 animate-fade-in-up animate-delay-400">
          <a
            href="/calculator"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "hero", action: "calculator" }).catch(() => {});
              trackCTAClick("hero", "calculator");
            }}
            className="text-sm text-text-dim hover:text-brand transition-colors"
          >
            Not sure yet? Take the 60-second billing health quiz &rarr;
          </a>
        </div>

        {/* Proof bar — below fold, single line (Hormozi Hack #9) */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border-light pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$2.1M+</div>
            <div className="text-xs text-text-muted">Back in founders&apos; accounts</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold"><ScanCounter /></div>
            <div className="text-xs text-text-muted">Founders who found hidden revenue</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">94%</div>
            <div className="text-xs text-text-muted">Had money they didn&apos;t know about</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">&lt; 90 sec</div>
            <div className="text-xs text-text-muted">From paste to &lsquo;holy shit&rsquo;</div>
          </div>
        </div>
      </div>
    </section>
  );
}
