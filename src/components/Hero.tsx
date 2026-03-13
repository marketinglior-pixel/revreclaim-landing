"use client";

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
        {/* Headline */}
        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.2] lg:text-6xl animate-fade-in-up">
          Your Stripe account is
          <br className="hidden md:block" />
          {" "}leaking money right now.
        </h1>

        {/* Sub — plain language, human voice */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-text-muted md:text-xl leading-relaxed animate-fade-in-up animate-delay-200">
          Failed payments nobody retried. Coupons from that promo you ran
          last year, still active. Cards expiring next month that nobody
          will notice until the charge bounces.
          <br /><br />
          <span className="text-text-secondary">
            Most SaaS founders don&apos;t know this stuff exists. And honestly,
            why would you? You&apos;re busy building.
            We built a tool that finds all of it. Takes 90 seconds. Costs nothing.
          </span>
        </p>

        {/* Primary CTA */}
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
          {/* Trust line — all verifiable facts */}
          <span className="text-sm text-text-muted">
            Read-only access &middot; Key deleted after scan &middot; Free forever &middot; No credit card
          </span>
        </div>

        {/* Low-friction alternative for cold traffic */}
        <div className="mt-8 animate-fade-in-up animate-delay-400">
          <a
            href="/calculator"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "hero", action: "calculator" }).catch(() => {});
              trackCTAClick("hero", "calculator");
            }}
            className="text-sm text-text-dim hover:text-brand transition-colors"
          >
            Not sure? Try the 60-second calculator first (no signup) &rarr;
          </a>
        </div>

        {/* Product facts bar — only verifiable truths, no usage stats */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border-light pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10</div>
            <div className="text-xs text-text-muted">Automated checks</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">&lt; 90 sec</div>
            <div className="text-xs text-text-muted">Full scan</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-xs text-text-muted">Platforms supported</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-brand">Free</div>
            <div className="text-xs text-text-muted">No credit card needed</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <a
            href="https://www.producthunt.com/products/revreclaim?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-revreclaim"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1096804&theme=light&t=1773346857240"
              alt="RevReclaim on Product Hunt"
              width="250"
              height="54"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
