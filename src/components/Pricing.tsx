const plans = [
  {
    name: "Free Audit",
    price: "$0",
    period: "",
    description: "See exactly what you're losing right now",
    features: [
      "Full Revenue Leak Report",
      "All 4 leak types scanned",
      "Actionable fix list per leak",
      "One-time scan",
    ],
    cta: "Get Free Audit",
    highlighted: false,
  },
  {
    name: "Monthly Monitor",
    price: "$299",
    period: "/month",
    description: "Continuous protection against revenue leaks",
    features: [
      "Everything in Free Audit",
      "Weekly automated scans",
      "Real-time leak alerts",
      "Leak trend tracking",
      "Slack & email notifications",
      "Priority support",
    ],
    cta: "Start Monitoring",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$499",
    period: "/month",
    description: "Full revenue intelligence for scaling SaaS",
    features: [
      "Everything in Monthly Monitor",
      "Per-customer margin analysis",
      "Revenue optimization suggestions",
      "Dedicated account manager",
      "Custom leak rules",
    ],
    cta: "Go Growth",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          Pricing
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Start with a free audit. Upgrade when it pays for itself.
        </h2>
        <p className="mb-16 text-center text-lg text-[#999]">
          If we don&apos;t find at least $1,000/month in leaked revenue, you pay nothing.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-[#10B981]/50 bg-[#10B981]/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                  : "border-[#2A2A2A] bg-[#111]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#10B981] px-4 py-1 text-xs font-bold text-black">
                  RECOMMENDED
                </div>
              )}
              <h3 className="mb-1 text-lg font-bold text-white">{plan.name}</h3>
              <p className="mb-6 text-sm text-[#666]">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-[#666]">{plan.period}</span>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#CCC]">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "border border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#10B981]/30 hover:bg-[#222]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
