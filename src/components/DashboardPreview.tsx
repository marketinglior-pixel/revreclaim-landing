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
            <div className="ml-4 flex-1 rounded-md bg-[#1A1A1A] px-4 py-1.5 text-xs text-[#666]">
              app.revreclaim.com/audit/acme-saas
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6 md:p-8">
            {/* Top stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <StatCard
                label="Total Revenue Leaking"
                value="$2,340"
                sub="/month"
                highlight
              />
              <StatCard
                label="Leaks Found"
                value="14"
                sub="across 4 categories"
              />
              <StatCard
                label="Potential Annual Recovery"
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
                severity="HIGH"
                type="Zombie Discount"
                customer="Acme Corp"
                impact="$320/mo"
                detail="50% discount active since 2023. Promo expired 14 months ago."
                fix="Remove discount"
              />
              <LeakTableRow
                severity="HIGH"
                type="Unbilled Overage"
                customer="StartupXYZ"
                impact="$280/mo"
                detail="Using 12,000 API calls/mo. Plan limit: 5,000. No overage billing."
                fix="Enable overage billing"
              />
              <LeakTableRow
                severity="MED"
                type="Legacy Pricing"
                customer="DataFlow Inc"
                impact="$150/mo"
                detail="On $99/mo plan (2022 pricing). Current price: $249/mo."
                fix="Migrate to current plan"
              />
              <LeakTableRow
                severity="MED"
                type="Ghost Subscriber"
                customer="OldClient LLC"
                impact="$0/mo"
                detail="Active subscription. Last login: 11 months ago. 0 API calls."
                fix="Review and reach out"
              />

              <div className="px-5 py-3 text-center text-xs text-[#666]">
                + 10 more leaks found
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
      <div className="mb-1 text-xs text-[#666]">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${highlight ? "text-[#EF4444]" : "text-white"}`}>{value}</span>
        <span className="text-sm text-[#666]">{sub}</span>
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
  const sevColor = severity === "HIGH" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]";

  return (
    <div className="border-b border-[#1A1A1A] px-5 py-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${sevColor}`}>{severity}</span>
        <span className="text-sm font-semibold text-white">{type}</span>
        <span className="text-sm text-[#666]">{customer}</span>
        <span className="ml-auto text-sm font-bold text-[#EF4444]">{impact}</span>
      </div>
      <p className="mb-2 text-xs text-[#999]">{detail}</p>
      <span className="inline-block rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
        Fix: {fix}
      </span>
    </div>
  );
}
