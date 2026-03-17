"use client";

import { useSectionView } from "@/hooks/useSectionView";

export function Problem() {
  const sectionRef = useSectionView("problem");

  return (
    <section ref={sectionRef} id="problem" className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">
          The problem
        </div>
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          You&apos;re losing money every month.
          <br />
          <span className="text-text-muted">You know it&apos;s there. You just don&apos;t have time to find it.</span>
        </h2>
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-text-muted">
          You track churn. You track MRR. You check your Stripe
          dashboard every morning like the rest of us.
          <br /><br />
          But here&apos;s what Stripe doesn&apos;t show you: a $899 charge that failed
          18 days ago and nobody retried. A 50% &ldquo;launch discount&rdquo; coupon that
          expired 4 months ago but is still active on 3 subscriptions. A trial
          user who&apos;s been on your product for free for 67 days because the
          webhook didn&apos;t fire.
          <br /><br />
          Nobody&apos;s stealing from you. Your billing system just has holes.
          And until you look, you won&apos;t know how many.
        </p>

        {/* Micro-stories — realistic scenarios, not fabricated data */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-dim p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-danger">The pricing migration you forgot</div>
            <p className="text-sm leading-relaxed text-text-muted">
              You raised prices 6 months ago. You assumed everyone migrated.
              Then you check: 40% of your customers are still on the old rate.
              Nobody told you. Stripe certainly didn&apos;t.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-dim p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-warning">The silent discount bleed</div>
            <p className="text-sm leading-relaxed text-text-muted">
              A &ldquo;30-day launch discount&rdquo; coupon you created 8 months ago.
              It expired. But it&apos;s still applied to 12 subscriptions.
              Every month, they pay less than they should. You never noticed.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-dim p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple">The accidental double charge</div>
            <p className="text-sm leading-relaxed text-text-muted">
              A customer upgraded their plan. But the old subscription was never canceled.
              They&apos;re paying for both. Right now, it&apos;s extra revenue.
              Next month, it&apos;s a chargeback and a 1-star review.
            </p>
          </div>
        </div>

        {/* Three categories of revenue leaks */}
        <div className="relative rounded-2xl border border-border bg-surface p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mb-2 text-sm text-text-muted">10 scanners. Three kinds of lost money.</div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-danger">Money walking out the door</div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>Failed payments nobody retried</li>
                <li>Expiring cards about to churn</li>
                <li>Trials that expired but weren&apos;t converted</li>
              </ul>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-warning">Money left on the table</div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>Expired coupons still giving discounts</li>
                <li>Never-expiring discounts you forgot</li>
                <li>Legacy pricing from last year</li>
              </ul>
            </div>
            <div className="rounded-xl border border-purple/30 bg-purple/5 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-purple">Money hiding in plain sight</div>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>Ghost subscriptions (inactive but paying)</li>
                <li>Duplicate subscriptions</li>
                <li>Missing payment methods</li>
                <li>Unbilled overages</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border-light bg-surface-dim p-4 text-center">
            <p className="text-sm text-text-muted">
              These add up. For a SaaS doing $50K MRR, even 3-5% means
              <span className="font-semibold text-white"> $1,500 to $2,500 every month</span> that
              should be in your account but isn&apos;t.
            </p>
          </div>
        </div>

        {/* 3-column comparison table — the "aha" moment */}
        <div className="mt-10 rounded-2xl border border-info/20 bg-info/5 p-6 md:p-8">
          <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-info">
            What each tool actually catches
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-text-dim" />
                  <th className="pb-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-text-dim">Stripe Dashboard</th>
                  <th className="pb-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-text-dim">Analytics tools</th>
                  <th className="pb-3 pl-4 text-left text-xs font-semibold uppercase tracking-wider text-brand">RevReclaim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                <ComparisonRow
                  leak="Expired coupons still active"
                  stripe="Invisible"
                  analytics="Invisible"
                  revreclaim="Finds + removes"
                />
                <ComparisonRow
                  leak="Failed payments"
                  stripe="Shows alert"
                  analytics="Shows churn %"
                  revreclaim="Finds + retries + sends dunning"
                />
                <ComparisonRow
                  leak="Legacy pricing gaps"
                  stripe="Invisible"
                  analytics="Invisible"
                  revreclaim="Finds + flags $ amount"
                />
                <ComparisonRow
                  leak="Duplicate subscriptions"
                  stripe="Invisible"
                  analytics="Invisible"
                  revreclaim="Finds + cancels duplicate"
                />
                <ComparisonRow
                  leak="Expiring cards (30 days out)"
                  stripe="No warning"
                  analytics="No warning"
                  revreclaim="Alerts before churn"
                />
                <ComparisonRow
                  leak="Ghost subscriptions"
                  stripe="Invisible"
                  analytics="Invisible"
                  revreclaim="Finds + flags"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonRow({ leak, stripe, analytics, revreclaim }: {
  leak: string;
  stripe: string;
  analytics: string;
  revreclaim: string;
}) {
  const isInvisible = (val: string) => val === "Invisible" || val === "No warning";
  return (
    <tr>
      <td className="py-3 pr-4 font-medium text-text-secondary">{leak}</td>
      <td className={`py-3 px-4 ${isInvisible(stripe) ? "text-text-dim" : "text-text-muted"}`}>{stripe}</td>
      <td className={`py-3 px-4 ${isInvisible(analytics) ? "text-text-dim" : "text-text-muted"}`}>{analytics}</td>
      <td className="py-3 pl-4 font-medium text-brand">{revreclaim}</td>
    </tr>
  );
}
