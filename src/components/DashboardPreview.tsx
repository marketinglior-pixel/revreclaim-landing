export function DashboardPreview() {
  return (
    <section className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          Your leak report
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          In 90 seconds, this will be your screen.
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-text-muted">
          Not a sample report. Not demo data. This is what an actual RevReclaim scan
          looks like: real customer emails, real dollar amounts,
          and a direct link to fix each one in your billing dashboard.
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
            <div className="mb-6 grid gap-4 md:grid-cols-4">
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
            </div>

            {/* Leak table */}
            <div className="rounded-xl border border-border bg-surface-dim">
              <div className="border-b border-border px-5 py-3">
                <span className="text-sm font-semibold text-white">Top Leaks Found</span>
              </div>

              <LeakTableRow
                severity="CRITICAL"
                type="Failed Payment"
                customer="a***@acmecorp.com"
                impact="$499/mo"
                detail="Invoice #INV-2847 unpaid for 12 days. Payment attempted but failed."
                fix="Retry payment or contact customer"
              />
              <LeakTableRow
                severity="CRITICAL"
                type="Missing Payment"
                customer="j***@startupxyz.io"
                impact="$299/mo"
                detail="Active subscription has no valid payment method. Next billing will fail."
                fix="Contact customer to add card"
              />
              <LeakTableRow
                severity="HIGH"
                type="Expiring Card"
                customer="m***@dataflow.com"
                impact="$199/mo"
                detail="Card ending in 4242 (Visa) expires 04/2026. Subscription at risk."
                fix="Send card update reminder"
              />
              <LeakTableRow
                severity="HIGH"
                type="Expired Coupon"
                customer="s***@cloudapp.io"
                impact="$150/mo"
                detail="50% discount coupon expired 3 months ago but still active on subscription."
                fix="Remove expired discount"
              />
              <LeakTableRow
                severity="MED"
                type="Legacy Pricing"
                customer="r***@bigco.com"
                impact="$100/mo"
                detail="Paying $149/mo (2023 pricing). Current price: $249/mo. 40% below rate."
                fix="Migrate to current plan"
              />

              <LeakTableRow
                severity="HIGH"
                type="Duplicate Subscription"
                customer="t***@growthco.com"
                impact="$199/mo"
                detail="Customer has 2 active subscriptions for the same product. Old plan not canceled after upgrade."
                fix="Cancel duplicate & refund overlap"
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
            See what YOUR report looks like &rarr;
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-3 text-sm text-text-muted">
            Free. Takes 90 seconds. Those are real dollars waiting for you.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, highlight }: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-danger/30 bg-danger/5" : "border-border bg-surface-dim"}`}>
      <div className="mb-1 text-xs text-text-muted">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${highlight ? "text-danger" : "text-white"}`}>{value}</span>
        <span className="text-sm text-text-muted">{sub}</span>
      </div>
    </div>
  );
}

function LeakTableRow({ severity, type, customer, impact, detail, fix }: {
  severity: string;
  type: string;
  customer: string;
  impact: string;
  detail: string;
  fix: string;
}) {
  const sevColor =
    severity === "CRITICAL"
      ? "bg-danger/10 text-danger"
      : severity === "HIGH"
        ? "bg-warning/10 text-warning"
        : "bg-info/10 text-info";

  return (
    <div className="border-b border-border-light px-5 py-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-bold ${sevColor}`}>{severity}</span>
        <span className="text-sm font-semibold text-white">{type}</span>
        <span className="text-sm text-text-muted font-mono">{customer}</span>
        <span className="ml-auto text-sm font-bold text-danger">{impact}</span>
      </div>
      <p className="mb-2 text-xs text-text-muted">{detail}</p>
      <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
        Fix: {fix}
      </span>
    </div>
  );
}
