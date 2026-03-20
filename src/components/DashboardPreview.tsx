"use client";

// ────────────────────────────────────────────────────────
// Dashboard Preview — 3D perspective mockup with glass UI
// 3 key stats + 4 leak rows, refined visual quality
// ────────────────────────────────────────────────────────

export function DashboardPreview() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-danger/[0.02] blur-[120px]" />

      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-3 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-brand/80">
          Imagine this tomorrow morning
        </div>
        <h2 className="mb-4 text-center font-display text-3xl font-bold text-white md:text-4xl">
          You open your dashboard. You see exactly what&apos;s wrong.
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-center text-[15px] text-white/45 leading-relaxed">
          Seven leaks. $2,340 per month. Each one with a name, an amount, and a link to fix it.
          You click the first one. It takes you straight to the customer&apos;s page in Stripe.
          You fix the expired coupon. Done. That&apos;s $280/month recovered.
        </p>
        <p className="mx-auto mb-14 max-w-2xl text-center text-[15px] text-white/40 leading-relaxed">
          By the time you finish your coffee, you&apos;ve recovered $1,400 in monthly recurring revenue.
          Revenue that was yours all along. Just sitting there, leaking, waiting for someone to notice.
        </p>

        {/* Dashboard mockup — 3D perspective tilt */}
        <div className="perspective-container">
          <div className="perspective-tilt">
            <div className="relative glass-card rounded-2xl p-1 shadow-[0_30px_100px_rgba(0,0,0,0.5),0_0_80px_rgba(16,185,129,0.03)]">
              {/* Browser chrome — realistic */}
              <div className="flex items-center gap-2 rounded-t-xl bg-white/[0.03] px-4 py-3 border-b border-white/[0.04]">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.3)]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.3)]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.3)]" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-white/[0.04] px-4 py-1.5 text-xs text-white/25 font-mono flex items-center gap-2">
                  <svg className="h-3 w-3 text-brand/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V7a4 4 0 0 1 8 0v4" /><path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" /></svg>
                  revreclaim.com/report/a1b2c3d4
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 md:p-8">
                {/* Top stats — 3 cards */}
                <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
                  {/* Health Score */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg width="56" height="56" className="transform -rotate-90">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset="45.2" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-warning font-display">70</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-white/30 uppercase tracking-wider">Health Score</div>
                      <div className="text-sm text-white/60 mt-0.5">Needs attention</div>
                    </div>
                  </div>

                  {/* Leaks Found */}
                  <div className="rounded-xl border border-danger/15 bg-danger/[0.04] p-5">
                    <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">Leaks Found</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-danger font-display">23</span>
                      <span className="text-xs text-white/25">across 10 checks</span>
                    </div>
                  </div>

                  {/* MRR at Risk */}
                  <div className="rounded-xl border border-warning/15 bg-warning/[0.04] p-5">
                    <div className="text-[11px] text-white/30 mb-1 uppercase tracking-wider">MRR at Risk</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-warning font-display">$2,340</span>
                      <span className="text-xs text-white/25">/month</span>
                    </div>
                  </div>
                </div>

                {/* Leak table */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
                  <div className="border-b border-white/[0.04] px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/80">Top Leaks Found</span>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider font-mono">Priority</span>
                  </div>

                  <LeakRow
                    severity="CRITICAL"
                    type="Failed Payment"
                    customer="a***@acmecorp.com"
                    impact="$499/mo"
                    detail="Invoice #INV-2847 unpaid for 12 days"
                    fix="Retry payment"
                  />
                  <LeakRow
                    severity="CRITICAL"
                    type="Missing Payment"
                    customer="j***@startupxyz.io"
                    impact="$299/mo"
                    detail="No valid payment method on active subscription"
                    fix="Contact customer"
                  />
                  <LeakRow
                    severity="HIGH"
                    type="Expired Coupon"
                    customer="s***@cloudapp.io"
                    impact="$150/mo"
                    detail="50% discount expired 3 months ago, still active"
                    fix="Remove discount"
                  />
                  <LeakRow
                    severity="HIGH"
                    type="Legacy Pricing"
                    customer="r***@bigco.com"
                    impact="$100/mo"
                    detail="Paying $149/mo vs current $249/mo"
                    fix="Migrate plan"
                  />

                  <div className="px-5 py-3 text-center text-[11px] text-white/20">
                    + 19 more leaks found across all 10 categories
                  </div>
                </div>
              </div>

              {/* Fade overlay */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-2xl bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="/scan"
            className="btn-shimmer group inline-flex items-center gap-2.5 rounded-xl bg-brand px-8 py-4 text-base font-bold text-black min-h-[52px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-white/30">
            Or <a href="/demo" className="text-brand hover:text-brand-light transition-colors duration-300">explore the demo</a> with sample data first.
          </p>
        </div>
      </div>
    </section>
  );
}

function LeakRow({ severity, type, customer, impact, detail, fix }: {
  severity: string;
  type: string;
  customer: string;
  impact: string;
  detail: string;
  fix: string;
}) {
  const sevColor =
    severity === "CRITICAL"
      ? "bg-danger/10 text-danger border-danger/20"
      : severity === "HIGH"
        ? "bg-warning/10 text-warning border-warning/20"
        : "bg-info/10 text-info border-info/20";

  return (
    <div className="border-b border-white/[0.03] px-5 py-4 transition-colors duration-200 hover:bg-white/[0.01]">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sevColor}`}>{severity}</span>
        <span className="text-sm font-semibold text-white/80">{type}</span>
        <span className="text-sm text-white/25 font-mono">{customer}</span>
        <span className="ml-auto text-sm font-bold text-danger">{impact}</span>
      </div>
      <p className="mb-2 text-xs text-white/30">{detail}</p>
      <span className="inline-block rounded-full bg-brand/[0.08] border border-brand/15 px-3 py-1 text-[11px] font-semibold text-brand">
        Fix: {fix}
      </span>
    </div>
  );
}
