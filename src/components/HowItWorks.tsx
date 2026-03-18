const steps = [
  {
    number: "01",
    title: "Grab a read-only key from your billing platform",
    description:
      "4 clicks. We show you exactly which buttons to press. The key can view data but can't change anything. That's enforced by Stripe, Polar, or Paddle at the platform level, not by us.",
    detail: "Takes about 60 seconds. Seriously.",
  },
  {
    number: "02",
    title: "Paste it. Hit scan. Wait 90 seconds.",
    description:
      "We check everything: subscriptions, invoices, coupons, cards, payment methods. 10 categories. Your key gets deleted the moment we're done.",
    detail: "Your key disappears. Your leak report stays.",
  },
  {
    number: "03",
    title: "See every leak, with instructions on how to fix each one",
    description:
      "Dollar amounts. Customer names (masked). Fix links that take you straight to the right place in your billing platform. Track your recovered MRR over 30 days. Connect HubSpot (optional) and each leak also gets customer context so you know which ones are worth chasing.",
    detail: "The easy ones usually take a few minutes to fix.",
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
          Three steps. Two minutes. Zero platform risk.
        </h2>
        <p className="mb-16 max-w-2xl text-lg text-text-muted">
          Your billing data already exists in Stripe, Polar, or Paddle.
          We just read it and tell you what&apos;s leaking. That&apos;s it.
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
