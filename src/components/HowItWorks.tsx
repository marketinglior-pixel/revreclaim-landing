const steps = [
  {
    number: "01",
    label: "Connect",
    time: "5 seconds",
    title: "Paste a read-only API key. That's it.",
    description:
      "RevReclaim can see your billing data, but it physically cannot modify, delete, or change anything. That's enforced by Stripe, Polar, and Paddle at the platform level, not by us. You can revoke the key anytime.",
    detail: "4 clicks. We show you exactly which buttons to press.",
  },
  {
    number: "02",
    label: "X-Ray",
    time: "90 seconds",
    title: "10 independent scanners run in parallel across your entire billing account.",
    description:
      "Each scanner checks one specific type of leak. If one scanner fails, the rest keep going (isolated architecture). The amounts you see are risk-adjusted. We don't inflate numbers. Ever.",
    detail: "Your key gets deleted the moment we're done.",
  },
  {
    number: "03",
    label: "Fix",
    time: "Direct from results",
    title: "Every leak comes with a direct link to fix it in Stripe.",
    description:
      "The monthly dollar amount. The annual impact. A severity rating. And a direct link to fix it in your billing platform. Not a PDF report. Not a dashboard you'll forget about. A fix list with one-click links.",
    detail: "The easy ones usually take a few minutes to fix.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 md:py-28">
      <div className="section-divider" />

      <div className="mx-auto max-w-4xl px-6 pt-16">
        <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-brand/80">
          The mechanism
        </div>
        <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          The 90-Second Revenue X-Ray
        </h2>
        <p className="mb-6 max-w-2xl text-[15px] text-white/45 leading-relaxed">
          Think of your Stripe account like the plumbing in your house.
          Everything looks fine from the outside. Water runs, faucets work.
          But behind the walls, there&apos;s a quiet leak. Not enough for a flood.
          But enough that your water bill creeps up every month.
        </p>
        <p className="mb-16 max-w-2xl text-[15px] text-white/45 leading-relaxed">
          That&apos;s exactly what&apos;s happening in your billing. And RevReclaim is the tool that opens the wall.
        </p>

        <div className="relative">
          {/* Connector line — gradient glow with pulse */}
          <div className="absolute left-[27px] top-0 hidden h-full w-px md:block overflow-hidden">
            <div className="h-full w-full bg-gradient-to-b from-brand/50 via-brand/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-brand/30 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6">
                {/* Step number */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-brand/20 bg-surface-dim text-lg font-bold text-brand font-display">
                    {step.number}
                  </div>
                </div>

                {/* Step content — glass card */}
                <div className={`glass-card-hover rounded-2xl p-6 flex-1 ${i === 1 ? "md:ml-4" : i === 2 ? "md:ml-8" : ""}`}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">{step.label}</span>
                    <span className="text-[11px] text-white/25">{step.time}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white/90 font-display">{step.title}</h3>
                  <p className="mb-3 text-sm leading-[1.7] text-white/40">
                    {step.description}
                  </p>
                  <span className="inline-block rounded-full bg-brand/[0.08] border border-brand/15 px-3.5 py-1.5 text-[11px] font-semibold text-brand">
                    {step.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual vs RevReclaim comparison */}
        <div className="mt-14 glass-card rounded-2xl p-6 md:p-8 border-brand/10">
          <p className="text-sm text-white/50 leading-[1.8]">
            <span className="font-semibold text-white/70">This is the billing audit you know you should do but never have time for.</span> Manual version: 4 to 8 hours, maybe covers 3 to 5 leak types, and you&apos;ll probably never get around to doing it again next month.
          </p>
          <p className="mt-4 text-sm font-semibold text-brand leading-[1.8]">
            RevReclaim: 90 seconds. 10 leak types. Every week. Automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
