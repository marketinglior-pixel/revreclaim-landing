/* Steps rewritten with literal physical actions (Hormozi Hack #11: Clear CTAs) */
const steps = [
  {
    number: "01",
    title: "Create a Read-Only Key",
    description:
      "Open Stripe Dashboard. Click Developers. Click API Keys. Click 'Create restricted key.' Toggle on read access for subscriptions, invoices, customers, and prices. Copy the key. Done.",
    detail: "60 seconds. We show you exactly where to click.",
  },
  {
    number: "02",
    title: "Paste It Here",
    description:
      "Come back to RevReclaim. Paste the key into the box. Click 'Scan.' Watch the progress bar. We're reading every subscription, every invoice, every coupon, every payment method in your account.",
    detail: "The scan runs in under 90 seconds.",
  },
  {
    number: "03",
    title: "See Where Your Money Went",
    description:
      "A report appears. Customer names on the left. Dollar amounts on the right. A green 'Fix' button next to each one. Click it and it takes you to the exact Stripe page to fix that leak. That's it.",
    detail: "Average recovery: $2,340/mo",
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
          Three steps. 90 seconds. The money was there the whole time.
        </h2>
        {/* Damaging admission (Hormozi Hack #5) */}
        <p className="mb-16 max-w-2xl text-lg text-text-muted">
          We won&apos;t lie — there&apos;s no magic here. We&apos;re reading data that Stripe
          already has but doesn&apos;t surface to you. The magic is that nobody else
          built a tool to show you. So we did. And it takes 90 seconds.
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
