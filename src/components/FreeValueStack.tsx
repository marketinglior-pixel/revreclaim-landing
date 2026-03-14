"use client";

import { useSectionView } from "@/hooks/useSectionView";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

const valueItems = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    name: "10-Category Revenue Audit",
    description: "Every subscription, invoice, coupon, and payment method — checked automatically",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    name: "Customer-Level Leak Report",
    description: "Every leak with dollar amounts, customer details, and direct fix links",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    name: "Fix Instructions for Every Leak",
    description: "Step-by-step playbook — click the link, fix in your billing dashboard",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    name: "1 Auto-Recovery Action",
    description: "We retry a charge, remove a coupon, or send a dunning email. Automatically.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    name: "PDF & CSV Export",
    description: "Share your report with co-founders, investors, or your team",
  },
];

export function FreeValueStack() {
  const sectionRef = useSectionView("free_value_stack");

  return (
    <section ref={sectionRef} className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          The free scan includes
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Here&apos;s everything you get.{" "}
          <span className="text-text-muted">For free.</span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-text-muted">
          Billing consultants charge $2,000+ for a manual version of this.
          We automated it. The scan is free because we think once you see
          what&apos;s leaking, you&apos;ll want to fix it automatically. And that&apos;s
          what the paid plans do.
        </p>

        {/* Value stack grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {valueItems.map((item) => (
            <div
              key={item.name}
              className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                <p className="mt-1 text-xs text-text-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Why free */}
        <div className="mt-8 rounded-xl border border-brand/30 bg-brand/5 p-6 text-center">
          <div className="text-4xl font-extrabold text-brand">All free. No catch.</div>
          <p className="mt-3 text-sm text-text-muted">
            Why? Because once you see $2,000/month sitting in your billing account,
            you&apos;ll want it back. The free scan makes the case better than we ever could.
          </p>
        </div>

        {/* Pro intelligence teaser */}
        <div className="mt-6 rounded-xl border border-info/20 bg-info/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Want to know which leaks to fix first?</h3>
              <p className="mt-1 text-xs text-text-muted">
                Pro plans connect to HubSpot CRM and add intelligence to every leak.
                Not just &ldquo;payment failed&rdquo; but &ldquo;payment failed + customer inactive 52 days = probably gone.&rdquo;
                Same scan. Smarter priorities.
              </p>
              <a href="#pricing" className="mt-2 inline-block text-xs font-semibold text-info hover:underline">
                See Pro features &darr;
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="/scan"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "value_stack", action: "scan" }).catch(() => {});
              trackCTAClick("value_stack", "scan");
            }}
            className="group inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-lg font-bold text-black min-h-[56px] transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
