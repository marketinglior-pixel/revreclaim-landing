const leaks = [
  {
    emoji: "💳",
    title: "Failed Payments",
    description:
      "Open invoices where payment was attempted but failed. Revenue you earned but aren't collecting because a card declined or expired.",
    impact: "Most urgent leak type",
    severity: "CRITICAL",
  },
  {
    emoji: "👻",
    title: "Ghost Subscriptions",
    description:
      "Subscriptions stuck in past_due, unpaid, or incomplete status. They're not active, not canceled — just quietly losing you money.",
    impact: "Found in 30% of accounts",
    severity: "HIGH",
  },
  {
    emoji: "⏰",
    title: "Expiring Cards",
    description:
      "Active subscriptions where the customer's card expires within 30, 60, or 90 days. The next billing attempt will fail unless they update.",
    impact: "Prevents involuntary churn",
    severity: "HIGH",
  },
  {
    emoji: "🏷️",
    title: "Expired Coupons",
    description:
      'Your sales team gave "3 months at 50% off" eight months ago. The coupon expired but the discount is still running. Nobody cancelled it.',
    impact: "Most common leak (35%)",
    severity: "HIGH",
  },
  {
    emoji: "♾️",
    title: "Forever Discounts",
    description:
      "Coupons set to 'forever' duration with no expiry date. These customers will never pay full price unless you manually intervene.",
    impact: "Silent margin killer",
    severity: "MEDIUM",
  },
  {
    emoji: "📉",
    title: "Legacy Pricing",
    description:
      "You raised prices 6 months ago. 40% of customers are still on the old rate. They're paying less than new customers for the same product.",
    impact: "Found in 22% of audits",
    severity: "MEDIUM",
  },
  {
    emoji: "🚫",
    title: "Missing Payment Methods",
    description:
      "Active subscriptions with no valid payment method attached. The very next billing attempt will fail, causing involuntary churn.",
    impact: "Imminent payment failure",
    severity: "CRITICAL",
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
          Seven types of leaks hiding in your Stripe
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaks.map((leak) => (
            <div
              key={leak.title}
              className="group rounded-2xl border border-[#2A2A2A] bg-[#111] p-6 transition-all hover:border-[#10B981]/30 hover:bg-[#111]/80"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-2xl">{leak.emoji}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    leak.severity === "CRITICAL"
                      ? "bg-[#EF4444]/10 text-[#EF4444]"
                      : leak.severity === "HIGH"
                        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                        : "bg-[#3B82F6]/10 text-[#3B82F6]"
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
