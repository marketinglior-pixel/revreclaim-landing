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
        {/* Headline — Show Don't Tell: specific moment (Hormozi Hack #6) */}
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Right now, there&apos;s a customer in your billing account who owes you $499.
          <br />
          <span className="text-text-muted">Their card failed 12 days ago. Nobody noticed.</span>
        </h2>
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-text-muted">
          You track churn. You track MRR. You track CAC.
          But nobody tracks the money that&apos;s already yours and isn&apos;t arriving.
          <br />
          <span className="text-white font-semibold">Stripe doesn&apos;t alert you when a coupon expires and keeps running.
          Paddle doesn&apos;t flag ghost subscriptions. Nobody does.</span>
          <br />
          The average SaaS at your stage loses $2,500/month to these blind spots.
        </p>

        {/* Revenue leak visualization */}
        <div className="relative rounded-2xl border border-border bg-surface p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mb-2 text-sm text-text-muted">Average SaaS with 200 customers</div>
            <div className="text-4xl font-bold text-white">$50,000 <span className="text-text-muted text-lg font-normal">/mo MRR</span></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Leak labels rewritten as moments (Hormozi Hack #6) */}
            <LeakRow
              label="Coupons your sales team gave out 8 months ago. Still running"
              amount="$900"
              percentage="1.8%"
              color="bg-danger"
              width="72%"
            />
            <LeakRow
              label="Customers using more than they're paying for"
              amount="$650"
              percentage="1.3%"
              color="bg-warning"
              width="52%"
            />
            <LeakRow
              label="Old customers on old prices. New signups pay 40% more"
              amount="$550"
              percentage="1.1%"
              color="bg-orange"
              width="44%"
            />
            <LeakRow
              label="Subscriptions stuck in limbo. Not active, not canceled"
              amount="$400"
              percentage="0.8%"
              color="bg-purple"
              width="32%"
            />
          </div>

          <div className="mt-8 flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 p-4">
            <span className="text-sm text-text-muted">Total monthly revenue leaking</span>
            <span className="text-2xl font-bold text-danger">-$2,500/mo</span>
          </div>
          <div className="mt-2 text-center text-sm text-text-muted">
            That&apos;s <span className="font-semibold text-danger">$30,000/year</span> walking out the door
          </div>
          {/* Status tie — competitors are ahead (Hormozi Hack #7) */}
          <div className="mt-6 text-center text-sm text-text-muted">
            Your competitors who&apos;ve plugged these leaks are reinvesting that{" "}
            <span className="text-white font-semibold">$30,000/year</span> into growth.
          </div>
        </div>
      </div>
    </section>
  );
}

function LeakRow({ label, amount, percentage, color, width }: {
  label: string;
  amount: string;
  percentage: string;
  color: string;
  width: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-dim p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-semibold text-white">{amount}<span className="text-text-muted font-normal">/mo</span></span>
      </div>
      <div className="h-2 rounded-full bg-surface-light">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
      <div className="mt-1 text-right text-xs text-text-muted">{percentage} of MRR</div>
    </div>
  );
}
