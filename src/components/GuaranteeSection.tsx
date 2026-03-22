"use client";

import { useSectionView } from "@/hooks/useSectionView";

export function GuaranteeSection() {
  const sectionRef = useSectionView("guarantee");

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28">
      <div className="section-divider" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-brand/[0.03] blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 pt-16">
        <div className="glass-card rounded-2xl p-8 md:p-12 border-brand/10">
          <div className="flex flex-col items-center text-center">
            {/* Shield icon — large with layered glow rings */}
            <div className="relative mb-10">
              <div className="absolute -inset-4 rounded-full bg-brand/[0.06] blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/[0.12] to-brand/[0.04] border border-brand/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <svg className="h-12 w-12 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>

            <div className="mb-3 text-[13px] text-white/50 font-medium">
              Our guarantee
            </div>
            <h2 className="mb-6 font-display text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              The $1,000/Month Promise
            </h2>

            <p className="mx-auto mb-6 max-w-2xl text-[15px] text-white/50 leading-relaxed">
              This is simple. If RevReclaim can&apos;t find at least $1,000 per month in billing leaks across your account, every paid plan is free until we do. Not a discount. Not a credit. Free.
            </p>

            <p className="mx-auto mb-8 max-w-2xl text-[15px] text-white/40 leading-relaxed">
              We&apos;re that confident because the data says so. 42% of SaaS companies are leaking revenue. The average is 3-8% of MRR. For a $50K MRR company, 3% alone is $1,500/month.
            </p>
          </div>

          {/* Honest explanation — glass card */}
          <div className="mx-auto max-w-xl rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 text-left">
            <p className="text-sm text-white/45 leading-[1.7]">
              But look, we understand the hesitation. You&apos;re a founder. You&apos;ve seen tools promise big numbers and deliver nothing. You&apos;ve been burned by &ldquo;AI-powered&rdquo; products that sounded great on a landing page and fell apart in practice.
            </p>
            <p className="mt-4 text-sm text-white/45 leading-[1.7]">
              So here&apos;s the deal: the first scan is completely free. No credit card. No signup. No commitment. You paste a read-only API key, wait 90 seconds, and see your results.
            </p>
            <p className="mt-4 text-sm text-white/45 leading-[1.7]">
              If we don&apos;t find $1,000/month? Then honestly, you&apos;re in better shape than most SaaS companies, and we&apos;re genuinely happy for you. No charge. No awkward upsell email. We just saved you the 4-8 hours you would have spent doing a manual audit.
            </p>
            <p className="mt-5 text-sm font-semibold text-white/60 leading-[1.7]">
              Either way, you win. Either you find leaks and fix them, or you get peace of mind that your billing is actually healthy.
            </p>
            <p className="mt-3 text-[11px] text-white/20">
              The scan takes 90 seconds. There&apos;s really no reason not to check.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
