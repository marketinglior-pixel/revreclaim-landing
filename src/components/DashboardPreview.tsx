"use client";

import { useState } from "react";

export function DashboardPreview() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <section className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-danger">
          Real example
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          This is what $2,340/month of leaked revenue looks like.
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-text-muted">
          23 billing leaks across 10 categories. Expired coupons, failed payments,
          legacy pricing, duplicate subscriptions. All hiding in plain sight.
        </p>

        {/* Dashboard mockup */}
        <div className="relative rounded-2xl border border-border bg-surface p-1 shadow-[0_0_60px_rgba(16,185,129,0.06)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 rounded-t-xl bg-surface-dim px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-danger/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-brand/60" />
            </div>
            <div className="ml-4 flex-1 rounded-md bg-surface-light px-4 py-1.5 text-xs text-text-muted">
              <svg className="inline-block h-3 w-3 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V7a4 4 0 0 1 8 0v4" /><path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" /></svg>{" "}revreclaim.com/report/a1b2c3d4
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6 md:p-8">
            {/* Top stats */}
            <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-5">
              {/* Health Score */}
              <div className="rounded-xl border border-border bg-surface-dim p-5 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-2">
                  <svg width="64" height="64" className="transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#1A1A1A" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeDasharray="175.9" strokeDashoffset="52.8" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-warning">70</span>
                  </div>
                </div>
                <div className="text-xs text-text-muted">Health Score</div>
              </div>

              <StatCard
                label="MRR at Risk"
                value="$2,340"
                sub="/month"
                highlight
              />
              <StatCard
                label="Leaks Found"
                value="23"
                sub="across 10 checks"
              />
              <StatCard
                label="Annual Recovery"
                value="$28,080"
                sub="/year"
              />
              <StatCard
                label="Recovered MRR"
                value="$840"
                sub="/mo tracked"
                info
              />
            </div>

            {/* Leak table */}
            <div className="rounded-xl border border-border bg-surface-dim">
              <div className="border-b border-border px-5 py-3">
                <span className="text-sm font-semibold text-white">Top Leaks Found</span>
              </div>

              <LeakTableRow
                index={0}
                expanded={expandedRow === 0}
                onToggle={() => setExpandedRow(expandedRow === 0 ? null : 0)}
                severity="CRITICAL"
                type="Failed Payment"
                customer="a***@acmecorp.com"
                impact="$499/mo"
                detail="Invoice #INV-2847 unpaid for 12 days. Payment attempted but failed."
                fix="Retry payment or contact customer"
                fixSteps={["Open Stripe dashboard", "Go to Invoices > #INV-2847", "Click 'Retry payment'", "If fails again, send dunning email to customer"]}
                crmInsight="Inactive 52 days, likely churning"
              />
              <LeakTableRow
                index={1}
                expanded={expandedRow === 1}
                onToggle={() => setExpandedRow(expandedRow === 1 ? null : 1)}
                severity="CRITICAL"
                type="Missing Payment"
                customer="j***@startupxyz.io"
                impact="$299/mo"
                detail="Active subscription has no valid payment method. Next billing will fail."
                fix="Contact customer to add card"
              />
              <LeakTableRow
                index={2}
                expanded={expandedRow === 2}
                onToggle={() => setExpandedRow(expandedRow === 2 ? null : 2)}
                severity="HIGH"
                type="Expiring Card"
                customer="m***@dataflow.com"
                impact="$199/mo"
                detail="Card ending in 4242 (Visa) expires 04/2026. Subscription at risk."
                fix="Send card update reminder"
              />
              <LeakTableRow
                index={3}
                expanded={expandedRow === 3}
                onToggle={() => setExpandedRow(expandedRow === 3 ? null : 3)}
                severity="HIGH"
                type="Expired Coupon"
                customer="s***@cloudapp.io"
                impact="$150/mo"
                detail="50% discount coupon expired 3 months ago but still active on subscription."
                fix="Remove expired discount"
              />
              <LeakTableRow
                index={4}
                expanded={expandedRow === 4}
                onToggle={() => setExpandedRow(expandedRow === 4 ? null : 4)}
                severity="MED"
                type="Legacy Pricing"
                customer="r***@bigco.com"
                impact="$100/mo"
                detail="Paying $149/mo (2023 pricing). Current price: $249/mo. 40% below rate."
                fix="Migrate to current plan"
                crmInsight="Active, 2 open deals. Upsell candidate"
              />
              <LeakTableRow
                index={5}
                expanded={expandedRow === 5}
                onToggle={() => setExpandedRow(expandedRow === 5 ? null : 5)}
                severity="HIGH"
                type="Duplicate Subscription"
                customer="t***@growthco.com"
                impact="$199/mo"
                detail="Customer has 2 active subscriptions for the same product. Old plan not canceled after upgrade."
                fix="Cancel duplicate & refund overlap"
                crmInsight="Last activity: 3 days ago. Reach out now"
              />

              <div className="px-5 py-3 text-center text-xs text-text-muted">
                + 17 more leaks found across all 10 categories
              </div>
            </div>
          </div>

          {/* Fade overlay at bottom */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-2xl bg-gradient-to-t from-surface-dim to-transparent" />
        </div>

        {/* CTA below preview */}
        <div className="mt-8 text-center">
          <a
            href="/scan"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-bold text-black min-h-[52px] transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-3 text-sm text-text-muted">
            Or <a href="/demo" className="text-brand hover:underline">explore the demo</a> with sample data first.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, highlight, info }: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  info?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-danger/30 bg-danger/5" : info ? "border-info/30 bg-info/5" : "border-border bg-surface-dim"}`}>
      <div className="mb-1 text-xs text-text-muted">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${highlight ? "text-danger" : info ? "text-info" : "text-white"}`}>{value}</span>
        <span className="text-sm text-text-muted">{sub}</span>
      </div>
    </div>
  );
}

function LeakTableRow({ severity, type, customer, impact, detail, fix, fixSteps, crmInsight, expanded, onToggle }: {
  index: number;
  severity: string;
  type: string;
  customer: string;
  impact: string;
  detail: string;
  fix: string;
  fixSteps?: string[];
  crmInsight?: string;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const sevColor =
    severity === "CRITICAL"
      ? "bg-danger/10 text-danger"
      : severity === "HIGH"
        ? "bg-warning/10 text-warning"
        : "bg-info/10 text-info";

  return (
    <div
      className={`border-b border-border-light px-5 py-4 transition cursor-pointer hover:bg-surface-light/30 ${expanded ? "bg-surface-light/20" : ""}`}
      onClick={onToggle}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${sevColor}`}>{severity}</span>
        <span className="text-sm font-semibold text-white">{type}</span>
        <span className="text-sm text-text-muted font-mono">{customer}</span>
        <span className="ml-auto text-sm font-bold text-danger">{impact}</span>
        <svg className={`h-4 w-4 text-text-dim transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <p className="mb-2 text-xs text-text-muted">{detail}</p>
      <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
        Fix: {fix}
      </span>
      {(severity === "CRITICAL" || severity === "HIGH") && (
        <span className="ml-2 inline-block rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand border border-brand/30">
          Auto-Fix (Free)
        </span>
      )}
      {crmInsight && (
        <span className="ml-2 inline-block rounded-full bg-info/10 px-3 py-1 text-xs font-semibold text-info border border-info/20">
          CRM: {crmInsight}
        </span>
      )}
      {expanded && (
        <div className="mt-3 rounded-lg bg-surface-dim border border-border p-4" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-semibold text-text-secondary mb-2">How to fix this:</p>
          {fixSteps ? (
            <ol className="space-y-1.5 text-xs text-text-muted list-decimal list-inside">
              {fixSteps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          ) : (
            <p className="text-xs text-text-muted">{fix}. Click through to your billing platform for step-by-step instructions.</p>
          )}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-text-dim italic">
              This is sample data. <a href="/scan" className="text-brand hover:text-brand-light underline">See YOUR leaks</a> by running a free scan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
