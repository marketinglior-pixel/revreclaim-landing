export function FinalCTA() {
  return (
    <section id="cta" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-[#10B981]/5 blur-[100px]" />

        <h2 className="relative mb-4 text-3xl font-bold text-white md:text-5xl">
          Stop leaving money on the table
        </h2>
        <p className="relative mb-10 text-lg text-[#999]">
          Every month you wait is another month of leaked revenue.
          <br />
          Connect Stripe in 2 minutes and see what you&apos;re missing.
        </p>

        {/* Email capture form */}
        <div className="relative mx-auto max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="founder@yoursaas.com"
              className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#111] px-5 py-4 text-sm text-white placeholder-[#666] outline-none transition-colors focus:border-[#10B981]/50"
            />
            <button className="rounded-xl bg-[#10B981] px-8 py-4 text-sm font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Get Free Audit
            </button>
          </div>
          <p className="mt-3 text-xs text-[#666]">
            No credit card required. Read-only Stripe access. Cancel anytime.
          </p>
        </div>

        {/* Guarantee badge */}
        <div className="mt-12 inline-flex items-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#111] px-6 py-4">
          <svg className="h-8 w-8 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">$1,000/mo Guarantee</div>
            <div className="text-xs text-[#666]">If we don&apos;t find at least $1,000/mo in leaks, you pay nothing</div>
          </div>
        </div>
      </div>
    </section>
  );
}
