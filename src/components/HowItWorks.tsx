/* Steps rewritten with literal physical actions (Hormozi Hack #11: Clear CTAs) */
const steps = [
  {
    number: "01",
    title: "Create a Read-Only API Key",
    description:
      "Open your billing dashboard (Stripe, Polar, or Paddle). Navigate to API Keys. Create a restricted, read-only API key — it can only view data, never modify anything. This limitation is enforced by the platform itself. Copy it. Done.",
    detail: "60 seconds. Read-only access only.",
  },
  {
    number: "02",
    title: "Paste It Here",
    description:
      "Come back to RevReclaim. Select your platform. Paste the key into the box. Click 'Scan.' Watch the progress bar. We're reading every subscription, every invoice, every coupon, every payment method in your account. Your key is processed in memory — never stored, never logged.",
    detail: "Under 90 seconds. Key deleted after scan.",
  },
  {
    number: "03",
    title: "See It. Fix It. Recover.",
    description:
      "A report appears. Customer names on the left. Dollar amounts on the right. AI recovery agents handle the rest — dunning emails, payment retries, coupon removal. Approve each action or let pre-dunning run automatically. You keep the revenue.",
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
          We won&apos;t lie. There&apos;s no magic here. We&apos;re reading data that your
          billing platform already has but doesn&apos;t surface to you. The magic is
          that nobody else built a tool to show you. So we did. And it takes 90 seconds.
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
