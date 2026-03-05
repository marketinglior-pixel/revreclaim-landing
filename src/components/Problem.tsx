export function Problem() {
  return (
    <section id="problem" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          The problem
        </div>
        {/* Headline — Show Don't Tell: specific moment (Hormozi Hack #6) */}
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          Right now, there&apos;s a customer in your Stripe who owes you $499.
          <br />
          <span className="text-[#999]">Their card failed 12 days ago. Nobody noticed.</span>
        </h2>
        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-[#999]">
          You track churn. You track MRR. You track CAC.
          But nobody tracks the money that&apos;s already yours and isn&apos;t arriving.
          <br />
          The average SaaS at your stage loses $2,500/month to billing blind spots.
          Not because your product is broken.{" "}
          <span className="text-white">Because Stripe doesn&apos;t alert you.</span>
        </p>

        {/* Revenue leak visualization */}
        <div className="relative rounded-2xl border border-[#2A2A2A] bg-[#111] p-8 md:p-12">
          <div className="mb-8 text-center">
            <div className="mb-2 text-sm text-[#999]">Average SaaS with 200 customers</div>
            <div className="text-4xl font-bold text-white">$50,000 <span className="text-[#999] text-lg font-normal">/mo MRR</span></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Leak labels rewritten as moments (Hormozi Hack #6) */}
            <LeakRow
              label="Coupons your sales team gave out 8 months ago — still running"
              amount="$900"
              percentage="1.8%"
              color="bg-[#EF4444]"
              width="72%"
            />
            <LeakRow
              label="Customers using more than they're paying for"
              amount="$650"
              percentage="1.3%"
              color="bg-[#F59E0B]"
              width="52%"
            />
            <LeakRow
              label="Old customers on old prices — new signups pay 40% more"
              amount="$550"
              percentage="1.1%"
              color="bg-[#F97316]"
              width="44%"
            />
            <LeakRow
              label="Subscriptions stuck in limbo — not active, not canceled"
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
          <div className="mt-2 text-center text-sm text-[#999]">
            That&apos;s <span className="font-semibold text-[#EF4444]">$30,000/year</span> walking out the door
          </div>
          {/* Status tie — competitors are ahead (Hormozi Hack #7) */}
          <div className="mt-6 text-center text-sm text-[#999]">
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
    <div className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-[#CCC]">{label}</span>
        <span className="text-sm font-semibold text-white">{amount}<span className="text-[#999] font-normal">/mo</span></span>
      </div>
      <div className="h-2 rounded-full bg-[#1A1A1A]">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
      <div className="mt-1 text-right text-xs text-[#999]">{percentage} of MRR</div>
    </div>
  );
}
