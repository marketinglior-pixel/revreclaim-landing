"use client";

import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";
import { ScanCounter } from "@/components/ScanCounter";
import Link from "next/link";

export function Hero() {
  const sectionRef = useSectionView("hero");

  return (
    <section ref={sectionRef} className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32 lg:pb-36">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand/5 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.2] lg:text-6xl animate-fade-in-up">
          Most SaaS companies are leaking{" "}
          <span className="text-brand">3&ndash;8% of their MRR.</span>
        </h1>
        <div className="mb-2 flex items-center justify-center gap-3 text-sm text-text-muted animate-fade-in-up animate-delay-100">
          <span className="rounded-full border border-border px-3 py-1 font-medium text-text-secondary">Stripe</span>
          <span className="rounded-full border border-border px-3 py-1 font-medium text-text-secondary">Polar</span>
          <span className="rounded-full border border-border px-3 py-1 font-medium text-text-secondary">Paddle</span>
        </div>

        {/* Qualifier */}
        <p className="mb-6 text-xs text-text-dim animate-fade-in-up animate-delay-100">
          Built for SaaS with 100+ customers
        </p>

        {/* Sub — honest, not overselling */}
        <div className="mx-auto mb-10 max-w-2xl text-lg text-text-muted md:text-xl leading-relaxed animate-fade-in-up animate-delay-200 space-y-1">
          <p>The billing audit most SaaS founders keep postponing.</p>
          <p className="text-brand font-medium">Most scans find something. Some find nothing &mdash; and that&apos;s fine too. Free.</p>
        </div>

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
            Find &amp; Fix My Leaks
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          {/* Trust line — all verifiable facts */}
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <svg className="h-4 w-4 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Read-only access &middot; Key deleted after scan &middot; No signup required &middot; No credit card
          </div>
        </div>

        {/* Mini report preview — show what the scan produces */}
        <div className="mt-10 mx-auto max-w-md animate-fade-in-up animate-delay-400">
          <p className="text-xs text-text-dim mb-3 uppercase tracking-wider font-medium">Example scan result</p>
          <div className="rounded-xl border border-border bg-surface/80 backdrop-blur-sm p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-danger">23</div>
                <div className="text-[10px] text-text-muted">leaks found</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-xl font-bold text-warning">$2,340</div>
                <div className="text-[10px] text-text-muted">MRR at risk</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-brand">70</div>
                <div className="text-[10px] text-text-muted">health score</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <p className="text-[11px] text-text-dim">
                That&apos;s ~$78/day walking out the door
              </p>
              <Link href="/demo" className="text-[11px] text-brand hover:text-brand-light transition">
                See full report &rarr;
              </Link>
            </div>
          </div>

          {/* Scan counter — real data from DB */}
          <div className="mt-3 text-xs text-text-dim">
            <ScanCounter /> scans completed &middot; Join them
          </div>
        </div>

        {/* Low-friction alternative for cold traffic */}
        <div className="mt-6 animate-fade-in-up animate-delay-400">
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

        {/* Problem facts bar — sell the problem, not the product */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border-light pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-danger">3-8%</div>
            <div className="text-xs text-text-muted">of MRR typically leaking</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10</div>
            <div className="text-xs text-text-muted">types of billing leaks</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">90 sec</div>
            <div className="text-xs text-text-muted">scan time</div>
          </div>
          <div className="hidden h-8 w-px bg-surface-lighter sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-brand">Free</div>
            <div className="text-xs text-text-muted">No signup needed</div>
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
