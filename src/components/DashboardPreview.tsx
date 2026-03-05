export function DashboardPreview() {
  return (
    <section className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          Your leak report
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          This is what you&apos;ll see in 2 minutes
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#999]">
          Real numbers. Real customers. Real fixes.
        </p>

        {/* Dashboard mockup */}
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111] p-1">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 rounded-t-xl bg-[#0A0A0A] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#333]" />
              <div className="h-3 w-3 rounded-full bg-[#333]" />
              <div className="h-3 w-3 rounded-full bg-[#333]" />
            </div>
            <div className="ml-4 flex-1 rounded-md bg-[#1A1A1A] px-4 py-1.5 text-xs text-[#999]">
              revreclaim.com/report/a1b2c3d4
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6 md:p-8">
            {/* Top stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              {/* Health Score */}
              <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-5 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-2">
                  <svg width="64" height="64" className="transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#1A1A1A" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeDasharray="175.9" strokeDashoffset="52.8" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#F59E0B]">70</span>
                  </div>
                </div>
                <div className="text-xs text-[#999]">Health Score</div>
              </div>

              <StatCard
                label="MRR at Risk"
                value="$2,340"
                sub="/month"
                highlight
              />
              <StatCard
                label="Leaks Found"
                value="18"
                sub="across 7 checks"
              />
              <StatCard
                label="Annual Recovery"
                value="$28,080"
                sub="/year"
              />
            </div>

            {/* Leak table */}
            <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A]">
              <div className="border-b border-[#2A2A2A] px-5 py-3">
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

              <div className="px-5 py-3 text-center text-xs text-[#999]">
                + 13 more leaks found across all 7 categories
              </div>
            </div>
          </div>
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
    <div className={`rounded-xl border p-5 ${highlight ? "border-[#EF4444]/30 bg-[#EF4444]/5" : "border-[#2A2A2A] bg-[#0A0A0A]"}`}>
      <div className="mb-1 text-xs text-[#999]">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${highlight ? "text-[#EF4444]" : "text-white"}`}>{value}</span>
        <span className="text-sm text-[#999]">{sub}</span>
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
      ? "bg-[#EF4444]/10 text-[#EF4444]"
      : severity === "HIGH"
        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
        : "bg-[#3B82F6]/10 text-[#3B82F6]";

  return (
    <div className="border-b border-[#1A1A1A] px-5 py-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${sevColor}`}>{severity}</span>
        <span className="text-sm font-semibold text-white">{type}</span>
        <span className="text-sm text-[#999] font-mono">{customer}</span>
        <span className="ml-auto text-sm font-bold text-[#EF4444]">{impact}</span>
      </div>
      <p className="mb-2 text-xs text-[#999]">{detail}</p>
      <span className="inline-block rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
        Fix: {fix}
      </span>
    </div>
  );
}
