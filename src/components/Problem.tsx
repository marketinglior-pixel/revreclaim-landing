export function Problem() {
  return (
    <section id="problem" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          The problem
        </div>
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          The money you&apos;re not collecting
        </h2>
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-[#999]">
          Every growing SaaS has revenue leaking through the cracks.
          Not because of churn. Not because of failed payments. Because of
          billing blind spots nobody is watching.
        </p>

        {/* Revenue leak visualization */}
        <div className="relative rounded-2xl border border-[#2A2A2A] bg-[#111] p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mb-2 text-sm text-[#666]">Average SaaS with 200 customers</div>
            <div className="text-4xl font-bold text-white">$50,000 <span className="text-[#666] text-lg font-normal">/mo MRR</span></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LeakRow
              label="Zombie Discounts"
              amount="$900"
              percentage="1.8%"
              color="bg-[#EF4444]"
              width="72%"
            />
            <LeakRow
              label="Unbilled Overages"
              amount="$650"
              percentage="1.3%"
              color="bg-[#F59E0B]"
              width="52%"
            />
            <LeakRow
              label="Legacy Pricing"
              amount="$550"
              percentage="1.1%"
              color="bg-[#F97316]"
              width="44%"
            />
            <LeakRow
              label="Ghost Subscribers"
              amount="$400"
              percentage="0.8%"
              color="bg-[#A855F7]"
              width="32%"
            />
          </div>

          <div className="mt-8 flex items-center justify-between rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-4">
            <span className="text-sm text-[#999]">Total monthly revenue leaking</span>
            <span className="text-2xl font-bold text-[#EF4444]">-$2,500/mo</span>
          </div>
          <div className="mt-2 text-center text-sm text-[#666]">
            That&apos;s <span className="font-semibold text-[#EF4444]">$30,000/year</span> walking out the door
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
    <div className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-[#CCC]">{label}</span>
        <span className="text-sm font-semibold text-white">{amount}<span className="text-[#666] font-normal">/mo</span></span>
      </div>
      <div className="h-2 rounded-full bg-[#1A1A1A]">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
      <div className="mt-1 text-right text-xs text-[#666]">{percentage} of MRR</div>
    </div>
  );
}
