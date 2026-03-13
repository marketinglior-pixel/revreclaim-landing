const steps = [
  {
    number: "01",
    title: "Create a read-only API key",
    description:
      "Go to your Stripe, Polar, or Paddle dashboard and create a restricted key with read-only access. It can view data but can't change anything. That's enforced by the platform, not by us.",
    detail: "Takes about 60 seconds. We show you how.",
  },
  {
    number: "02",
    title: "Paste it and hit scan",
    description:
      "We check every subscription, invoice, coupon, and payment method across 10 categories. The scan takes about 90 seconds. Your key is used once and deleted immediately after.",
    detail: "Your key disappears. Your leak report stays.",
  },
  {
    number: "03",
    title: "See your leaks, with fix instructions",
    description:
      "Every leak shows the customer, the dollar amount, and a clear explanation of how to fix it. Links take you straight to the right place in your billing dashboard. Connect HubSpot (optional) and each leak also gets customer context so you know which ones are worth chasing.",
    detail: "Fix the easy ones first. Usually takes minutes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
          How it works
        </div>
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Three steps. About two minutes total.
        </h2>
        <p className="mb-16 max-w-2xl text-lg text-text-muted">
          Your billing data is already in Stripe, Polar, or Paddle.
          We just read it and tell you what&apos;s leaking. Here&apos;s how.
        </p>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[27px] top-0 hidden h-full w-px bg-gradient-to-b from-brand via-brand/50 to-transparent md:block" />

          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-surface text-lg font-bold text-brand">
                  {step.number}
                </div>
                <div className="rounded-2xl border border-border bg-surface p-6 flex-1">
                  <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-text-muted">
                    {step.description}
                  </p>
                  <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
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
