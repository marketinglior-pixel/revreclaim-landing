import { LeakIcon } from "@/components/LeakIcons";

/* Each description is a mini-story with an emotional punch (Hormozi Hack #6: Show Don't Tell) */
const leaks = [
  {
    title: "Expired Coupons",
    description:
      "Your sales rep promised '3 months at 50% off.' That was 8 months ago. The coupon expired. The discount is still running. Nobody canceled it. Nobody noticed.",
    impact: "Most common leak. 35% of all scans",
    afterFix: "Full-price revenue starts hitting your account next cycle.",
    severity: "HIGH",
  },
  {
    title: "Legacy Pricing",
    description:
      "You raised prices 6 months ago. 40% of your customers are still on the old rate. They're getting the same product for less money than your newest signup. Your billing platform won't migrate them automatically.",
    impact: "Found in 22% of scans",
    afterFix: "One migration email → instant revenue lift from customers you already have.",
    severity: "MEDIUM",
  },
  {
    title: "Forever Discounts",
    description:
      "Someone on your team set a coupon to 'forever.' That customer will pay 30% less than everyone else for the rest of their lifetime. Unless you find it.",
    impact: "Silent margin killer",
    afterFix: "Your margins recover month over month. Automatically.",
    severity: "MEDIUM",
  },
  {
    title: "Ghost Subscriptions",
    description:
      "14 subscriptions sitting in 'past_due' since November. They're not active. They're not canceled. They're in billing purgatory. Nobody fixes this for you.",
    impact: "Found in 30% of accounts we scan",
    afterFix: "Clean billing = predictable MRR. No more guessing what's real.",
    severity: "HIGH",
  },
  {
    title: "Expiring Cards",
    description:
      "23 of your customers have cards expiring in the next 60 days. On that date, their next payment will fail. Then you'll call it 'involuntary churn.' But it was preventable.",
    impact: "$4,200/mo at risk right now",
    afterFix: "Every customer keeps paying. No surprise churn next month.",
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
    afterFix: "That subscription keeps paying. No silent disappearance.",
    severity: "CRITICAL",
  },
  {
    title: "Unbilled Overages",
    description:
      "Your customer has 12 seats but their invoice only charges for 1. Or their usage blew past the plan ceiling 3 months ago and nobody upgraded them. That's revenue you earned and never collected.",
    impact: "Avg $800/mo per affected customer",
    afterFix: "Future billing matches actual usage. That revenue gap closes permanently.",
    severity: "HIGH",
  },
  {
    title: "Expired Trials",
    description:
      "A subscription has been in 'trialing' status for 67 days. Your trial is 14 days. This customer has been using your product for free for two months. Your webhook didn't fire. Your billing didn't convert them.",
    impact: "Full price × every day they're free",
    afterFix: "Either they start paying or you stop giving it away. Either way, you win.",
    severity: "HIGH",
  },
  {
    title: "Duplicate Subscriptions",
    description:
      "A customer upgraded their plan, but the old subscription was never canceled. They're paying for both. When they notice — and they will — you'll get a chargeback, not a thank you.",
    impact: "Double-charge = chargeback risk",
    afterFix: "Customer stays happy. No chargeback. Clean billing going forward.",
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
          Ten revenue streams hiding in your billing data.
        </h2>
        <p className="mb-12 text-lg text-text-muted italic">
          Most founders fix the critical ones before lunch. The money lands next billing cycle.
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
