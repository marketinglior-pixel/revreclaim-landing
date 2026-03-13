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
          Billing mistakes are invisible.
          <br />
          <span className="text-text-muted">Until you actually look.</span>
        </h2>
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-text-muted">
          You track churn. You track MRR. But nobody tracks the money
          that&apos;s already yours and just... isn&apos;t arriving.
          Stripe tells you &ldquo;payment failed.&rdquo; It doesn&apos;t tell you
          why, or whether it&apos;s worth chasing.
        </p>

        {/* Common leak types — framed as examples, not fake data */}
        <div className="relative rounded-2xl border border-border bg-surface p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mb-2 text-sm text-text-muted">Common leak types we scan for</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LeakRow
              label="Expired coupons still giving discounts"
              percentage="1-3%"
              color="bg-danger"
              width="72%"
            />
            <LeakRow
              label="Failed payments nobody retried"
              percentage="1-2%"
              color="bg-warning"
              width="52%"
            />
            <LeakRow
              label="Old customers on old prices you already raised"
              percentage="0.5-2%"
              color="bg-orange"
              width="44%"
            />
            <LeakRow
              label="Subscriptions stuck in limbo (not active, not canceled)"
              percentage="0.5-1%"
              color="bg-purple"
              width="32%"
            />
          </div>

          <div className="mt-8 rounded-xl border border-border-light bg-surface-dim p-4 text-center">
            <p className="text-sm text-text-muted">
              These add up. For a SaaS doing $50K MRR, even 3-5% means
              <span className="font-semibold text-white"> $1,500 to $2,500 every month</span> that
              should be in your account but isn&apos;t.
            </p>
          </div>
        </div>

        {/* Stripe vs RevReclaim comparison */}
        <div className="mt-10 rounded-2xl border border-info/20 bg-info/5 p-6 md:p-8">
          <div className="mb-5 text-sm font-semibold uppercase tracking-wider text-info">
            What you see vs. what you&apos;re missing
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-dim p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-dim">What Stripe tells you</div>
              <p className="text-sm text-text-muted">&ldquo;Payment failed for customer a***@acmecorp.com&rdquo;</p>
              <div className="mt-3 inline-block rounded-full bg-danger/10 px-3 py-1 text-xs text-danger">No context. No priority.</div>
            </div>
            <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">What RevReclaim tells you</div>
              <p className="text-sm text-text-secondary">&ldquo;Payment failed + customer inactive 52 days + no CRM activity = likely churning. Don&apos;t chase. Write it off.&rdquo;</p>
              <div className="mt-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs text-brand">Context. Priority. Action.</div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-text-muted">
            CRM intelligence available on Pro and Team plans.{" "}
            <a href="#pricing" className="text-brand hover:underline">See pricing &darr;</a>
          </p>
        </div>
      </div>
    </section>
  );
}

function LeakRow({ label, percentage, color, width }: {
  label: string;
  percentage: string;
  color: string;
  width: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-dim p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-semibold text-text-muted">{percentage} of MRR</span>
      </div>
      <div className="h-2 rounded-full bg-surface-light">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}
