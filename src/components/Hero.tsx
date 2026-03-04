export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#10B981]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#111] px-4 py-2 text-sm text-[#999]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          For SaaS founders doing $30K-$500K MRR on Stripe
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl md:leading-[1.1]">
          You&apos;re losing{" "}
          <span className="bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent">
            3-5% of your revenue
          </span>{" "}
          right now.
          <br />
          We&apos;ll prove it in 2 minutes.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#999] md:text-xl">
          Connect your Stripe account (read-only). We scan every subscription,
          discount, and usage pattern, and show you exactly where money is
          leaking. Not failed payments. Not chargebacks. The revenue you earned
          but aren&apos;t collecting.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#cta"
            className="group flex items-center gap-2 rounded-xl bg-[#10B981] px-8 py-4 text-lg font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Find My Revenue Leaks
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <span className="text-sm text-[#666]">Free audit. No credit card required</span>
        </div>

        {/* Guarantee badge */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-[#10B981]/5 px-5 py-2.5">
          <svg className="h-5 w-5 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-sm font-semibold text-[#10B981]">$1,000/mo guarantee</span>
          <span className="text-sm text-[#999]">or you pay nothing</span>
        </div>

        {/* Proof bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-[#1A1A1A] pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">3-5%</div>
            <div className="text-xs text-[#666]">Average ARR leaked in SaaS</div>
          </div>
          <div className="hidden h-8 w-px bg-[#222] sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">2 min</div>
            <div className="text-xs text-[#666]">Average scan time</div>
          </div>
          <div className="hidden h-8 w-px bg-[#222] sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">Read-only</div>
            <div className="text-xs text-[#666]">We never touch your billing</div>
          </div>
        </div>
      </div>
    </section>
  );
}
