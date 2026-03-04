const leaks = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: "Zombie Discounts",
    description:
      'Your sales team gave "3 months at 50% off" eight months ago. The discount is still running. Nobody cancelled it.',
    impact: "Most common leak type (35%)",
    severity: "HIGH",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Unbilled Overages",
    description:
      "Customers exceed their plan limits every month. Your system doesn't catch it. You eat the cost.",
    impact: "Found in 25% of audits",
    severity: "HIGH",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Legacy Pricing",
    description:
      "You raised prices 6 months ago. 40% of customers are still on the old rate. Nobody sent the migration email.",
    impact: "Found in 22% of audits",
    severity: "MEDIUM",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: "Ghost Subscribers",
    description:
      "They pay every month but haven't logged in for 90 days. One day they'll notice, cancel, and demand a refund.",
    impact: "Hidden churn risk (18%)",
    severity: "MEDIUM",
  },
];

export function LeakTypes() {
  return (
    <section className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          What we find
        </div>
        <h2 className="mb-12 text-3xl font-bold text-white md:text-4xl">
          Four types of leaks hiding in your Stripe
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {leaks.map((leak) => (
            <div
              key={leak.title}
              className="group rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 transition-all hover:border-[#10B981]/30 hover:bg-[#111]/80"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] text-[#10B981]">
                  {leak.icon}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    leak.severity === "HIGH"
                      ? "bg-[#EF4444]/10 text-[#EF4444]"
                      : "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}
                >
                  {leak.severity}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{leak.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#999]">
                {leak.description}
              </p>
              <div className="text-sm font-semibold text-[#10B981]">
                {leak.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
