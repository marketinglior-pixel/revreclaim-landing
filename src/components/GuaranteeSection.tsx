"use client";

import { useSectionView } from "@/hooks/useSectionView";

export function GuaranteeSection() {
  const sectionRef = useSectionView("guarantee");

  return (
    <section ref={sectionRef} className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            {/* Shield icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
              <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>

            <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">
              Our guarantee
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              The $1,000 Revenue Guarantee
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-text-muted leading-relaxed">
              We find at least $1,000/month in recoverable revenue on your first scan,
              or every paid plan is free until we do. No fine print. No conditions. No tricks.
            </p>

            {/* Honest explanation */}
            <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface-dim p-6 text-left">
              <p className="text-sm text-text-muted leading-relaxed">
                Look, if we can&apos;t find $1,000/month in leaks for a SaaS doing $30K+ MRR,
                then either your billing is already perfect (congrats) or our scanner isn&apos;t
                good enough yet. Either way, you shouldn&apos;t pay us. Simple.
              </p>
              <p className="mt-3 text-xs text-text-dim">
                The free scan is always free regardless. This guarantee applies to paid plans only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
