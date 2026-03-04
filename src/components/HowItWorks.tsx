const steps = [
  {
    number: "01",
    title: "Connect Stripe",
    description:
      "One click OAuth. Read-only access — we never touch your billing, never see card numbers, never modify anything.",
    detail: "Takes 30 seconds",
  },
  {
    number: "02",
    title: "We scan everything",
    description:
      "Every subscription, coupon, discount, invoice, and usage event. Our algorithms check for all known leak patterns.",
    detail: "Under 2 minutes",
  },
  {
    number: "03",
    title: "Get your Leak Report",
    description:
      "See exactly what you're losing, which customers are affected, and the specific action to fix each leak.",
    detail: "Actionable fixes",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          How it works
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          Three steps. Two minutes. Real money.
        </h2>
        <p className="mb-16 text-lg text-[#999]">
          No complex setup. No engineering team needed. Just connect and see.
        </p>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[27px] top-0 hidden h-full w-px bg-gradient-to-b from-[#10B981] via-[#10B981]/50 to-transparent md:block" />

          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#10B981]/30 bg-[#111] text-lg font-bold text-[#10B981]">
                  {step.number}
                </div>
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 flex-1">
                  <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-[#999]">
                    {step.description}
                  </p>
                  <span className="inline-block rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                    {step.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
