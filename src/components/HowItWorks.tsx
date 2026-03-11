/* Steps rewritten with literal physical actions (Hormozi Hack #11: Clear CTAs) */
const steps = [
  {
    number: "01",
    title: "60 Seconds of Setup, Zero Risk",
    description:
      "Grab a read-only key from your billing dashboard (Stripe, Polar, or Paddle). It can view data but can't change anything — that's enforced by the platform, not by us. You're in control the whole time.",
    detail: "You stay in control. Read-only means read-only.",
  },
  {
    number: "02",
    title: "Watch Your Revenue Picture Appear",
    description:
      "Paste the key. Hit scan. In 90 seconds, every subscription, invoice, coupon, and payment method gets checked. Your key is used once and deleted — it exists only for this scan.",
    detail: "Your key disappears after the scan. Your revenue picture stays.",
  },
  {
    number: "03",
    title: "See the Money. Take It Back.",
    description:
      "Customer names. Dollar amounts. One-click fix for each one. The average founder discovers $2,340/month they didn't know they were missing. Most fix the critical leaks before lunch. That money hits your account next billing cycle.",
    detail: "Average founder recovers $2,340/mo — from customers they already have.",
  },
  {
    number: "04",
    title: "Your First Fix Is On Us.",
    description:
      "See a critical leak? Hit Fix. Our AI recovery agent sends a payment reminder, retries a failed charge, or removes an expired coupon — whatever the leak needs. Your first recovery action is free. Most founders recover more in that single action than the Pro plan costs.",
    detail: "Average first fix: $499 recovered. Free. No strings.",
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
          90 seconds from now, you&apos;ll know exactly where your money is.
        </h2>
        {/* Future-focused sub (85/15 Rule) */}
        <p className="mb-16 max-w-2xl text-lg text-text-muted">
          Right now, your billing data is sitting in Stripe, Polar, or Paddle &mdash;
          full of answers nobody&apos;s looking at. In 90 seconds, you&apos;ll see every
          dollar that should be hitting your account but isn&apos;t. Here&apos;s how.
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
