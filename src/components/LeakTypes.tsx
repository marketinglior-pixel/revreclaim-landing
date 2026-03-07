import { LeakIcon } from "@/components/LeakIcons";

/* Each description is a mini-story with an emotional punch (Hormozi Hack #6: Show Don't Tell) */
const leaks = [
  {
    title: "Expired Coupons",
    description:
      "Your sales rep promised '3 months at 50% off.' That was 8 months ago. The coupon expired. The discount is still running. Nobody canceled it. Nobody noticed.",
    impact: "Most common leak. 35% of all scans",
    afterFix: "Remove the expired discount. Full-price billing starts next cycle.",
    severity: "HIGH",
  },
  {
    title: "Legacy Pricing",
    description:
      "You raised prices 6 months ago. 40% of your customers are still on the old rate. They're getting the same product for less money than your newest signup. Your billing platform won't migrate them automatically.",
    impact: "Found in 22% of scans",
    afterFix: "Migrate to current pricing. One email, instant revenue lift.",
    severity: "MEDIUM",
  },
  {
    title: "Forever Discounts",
    description:
      "Someone on your team set a coupon to 'forever.' That customer will pay 30% less than everyone else for the rest of their lifetime. Unless you find it.",
    impact: "Silent margin killer",
    afterFix: "Set an end date. Your margins recover month over month.",
    severity: "MEDIUM",
  },
  {
    title: "Ghost Subscriptions",
    description:
      "14 subscriptions sitting in 'past_due' since November. They're not active. They're not canceled. They're in billing purgatory. Nobody fixes this for you.",
    impact: "Found in 30% of accounts we scan",
    afterFix: "Cancel or reactivate each one. Clean billing = predictable MRR.",
    severity: "HIGH",
  },
  {
    title: "Expiring Cards",
    description:
      "23 of your customers have cards expiring in the next 60 days. On that date, their next payment will fail. Then you'll call it 'involuntary churn.' But it was preventable.",
    impact: "$4,200/mo at risk right now",
    afterFix: "Send update reminders before expiry. Keep every customer paying.",
    severity: "HIGH",
  },
  {
    title: "Uncollected Revenue",
    description:
      "A customer's card was declined 12 days ago. The invoice is sitting there, open. You earned that money. It's just… not arriving. Nobody on your team got an alert.",
    impact: "$499/mo sitting uncollected",
    afterFix: "One click retries the charge. That $499 hits your account within 24 hours.",
    severity: "CRITICAL",
  },
  {
    title: "Missing Payment Methods",
    description:
      "An active subscription with no credit card attached. The next billing attempt will fail. That customer will silently disappear. You'll count it as churn. It wasn't.",
    impact: "Next payment = guaranteed failure",
    afterFix: "Prompt them to add a card now. Save the subscription before it fails.",
    severity: "CRITICAL",
  },
];

export function LeakTypes() {
  return (
    <section className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
          What we find
        </div>
        {/* Headline with reason why (Hormozi Hack #4) */}
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          Seven revenue streams hiding in your billing data.
        </h2>
        <p className="mb-12 text-lg text-text-muted italic">
          We find them in 90 seconds. You fix them before lunch.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaks.map((leak) => (
            <div
              key={leak.title}
              className="group cursor-pointer rounded-2xl border border-border bg-surface p-6 transition-all hover:border-brand/30 hover:bg-surface/80"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                  <LeakIcon type={leak.title} className="h-6 w-6 text-brand" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    leak.severity === "CRITICAL"
                      ? "bg-danger/10 text-danger"
                      : leak.severity === "HIGH"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                  }`}
                >
                  {leak.severity}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{leak.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-text-muted">
                {leak.description}
              </p>
              <div className="text-sm font-semibold text-brand">
                {leak.impact}
              </div>
              <div className="mt-2 text-xs text-text-secondary italic">
                After fix: {leak.afterFix}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
