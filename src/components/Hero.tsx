"use client";

import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";
import { HeroScanAnimation } from "@/components/HeroScanAnimation";

export function Hero() {
  const sectionRef = useSectionView("hero");

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28 lg:pb-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[20%] h-[700px] w-[700px] rounded-full bg-brand/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Two-column layout: text left, animation right */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left column — copy */}
          <div className="text-center lg:text-left">
            {/* Platform badges — glass morphism */}
            <div className="mb-6 flex items-center justify-center gap-2 animate-fade-in-up lg:justify-start">
              {["Stripe", "Polar", "Paddle"].map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-4 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-brand/20 hover:text-white"
                >
                  {platform}
                </span>
              ))}
            </div>

            {/* Headline — problem-first, loss aversion */}
            <h1 className="mb-6 font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.4rem] animate-fade-in-up">
              We find and recover revenue your billing system{" "}
              <span className="bg-gradient-to-r from-brand to-emerald-300 bg-clip-text text-transparent">
                missed
              </span>.
            </h1>

            {/* Sub — 10 silent issues, scan CTA */}
            <p className="mx-auto mb-8 max-w-lg text-[17px] text-text-muted/90 leading-relaxed animate-fade-in-up animate-delay-100 lg:mx-0">
              10 silent billing issues that Stripe doesn&apos;t alert you about. We find it and help you get it back.
            </p>

            {/* Primary CTA — shimmer effect */}
            <div className="flex flex-col items-center gap-5 animate-fade-in-up animate-delay-200 lg:items-start">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="/scan"
                  onClick={() => {
                    trackEvent("cta_clicked", null, { location: "hero", action: "scan" }).catch(() => {});
                    trackCTAClick("hero", "scan");
                  }}
                  className="group flex items-center gap-2.5 rounded-xl bg-brand px-9 py-4 text-[17px] font-bold text-black min-h-[56px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
                >
                  Show Me My Leaks
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="/demo/dashboard"
                  onClick={() => {
                    trackEvent("cta_clicked", null, { location: "hero", action: "demo_dashboard" }).catch(() => {});
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface-light px-6 py-4 text-[15px] font-medium text-white min-h-[56px] transition-all duration-300 hover:border-brand/30 hover:bg-surface-lighter"
                >
                  Demo Dashboard
                </a>
              </div>

              {/* Trust line — refined with subtle separators */}
              <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-[13px] text-text-muted lg:justify-start">
                <span className="flex items-center gap-1.5 px-2">
                  <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Read-only (we can&apos;t change anything)
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5 px-2">
                  <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Key deleted after scan
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5 px-2">
                  <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Free, no credit card
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5 px-2">
                  <svg className="h-3.5 w-3.5 text-brand/70 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  No signup required
                </span>
              </div>
            </div>

            {/* Free/paid boundary + calculator */}
            <div className="mt-8 space-y-2.5 animate-fade-in-up animate-delay-400">
              <p className="text-xs text-text-muted/70 max-w-sm lg:mx-0 mx-auto">
                Free scan shows your top 3 leaks with full details. Upgrade to see all 10 categories and get ongoing monitoring.
              </p>
              <a
                href="/calculator"
                onClick={() => {
                  trackEvent("cta_clicked", null, { location: "hero", action: "calculator" }).catch(() => {});
                  trackCTAClick("hero", "calculator");
                }}
                className="inline-block text-sm text-text-dim hover:text-brand transition-colors duration-300"
              >
                Not sure? Try the 60-second calculator first &rarr;
              </a>
            </div>
          </div>

          {/* Right column — scanning animation with ambient glow */}
          <div className="relative animate-fade-in-up animate-delay-200">
            {/* Glow behind the terminal */}
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-brand/[0.04] blur-2xl" />
            <div className="relative">
              <HeroScanAnimation />
            </div>
          </div>
        </div>

        {/* Product Hunt badge — hidden until launch (2026-03-25) */}
        {/* <div className="mt-20 flex justify-center animate-fade-in-up animate-delay-500">
          <a
            href="https://www.producthunt.com/products/revreclaim?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-revreclaim"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 hover:opacity-80 hover:scale-105"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1096804&theme=light&t=1773346857240"
              alt="RevReclaim on Product Hunt"
              width="250"
              height="54"
              loading="lazy"
            />
          </a>
        </div> */}
      </div>
    </section>
  );
}
