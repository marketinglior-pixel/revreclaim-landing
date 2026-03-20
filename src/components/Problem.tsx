"use client";

import { useSectionView } from "@/hooks/useSectionView";

export function Problem() {
  const sectionRef = useSectionView("problem");

  return (
    <section ref={sectionRef} id="problem" className="relative py-20 md:py-28">
      <div className="section-divider" />

      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-danger/[0.02] blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 pt-16">
        {/* ── Section B: Problem Agitation ── */}
        <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-danger/80">
          The problem nobody talks about
        </div>
        <h2 className="mb-6 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          You&apos;re probably losing $1,500 to $5,000 every month.
          <br />
          <span className="text-white/40">And you don&apos;t know it.</span>
        </h2>
        <div className="mb-14 max-w-2xl text-[15px] leading-[1.8] text-white/45">
          <p>
            Here&apos;s the thing nobody tells you when you start scaling a SaaS.
          </p>
          <p className="mt-4">
            Your Stripe Dashboard looks green. MRR is growing. Customers are paying. Everything seems fine.
          </p>
          <p className="mt-4">
            But behind that green dashboard, something is quietly going wrong.
          </p>
          <p className="mt-4">
            A coupon you created for a one-time promotion? Still running. Six months later. One founder on Reddit found out the hard way: <span className="font-semibold text-white/70">&ldquo;I ran into that expired coupon thing last year and it cost me like $800/month for 6 months before I caught it. The worst part is Stripe&apos;s dashboard doesn&apos;t make it obvious at all.&rdquo;</span>
          </p>
          <p className="mt-4">
            That&apos;s $4,800. From a single coupon. That nobody was watching.
          </p>
          <p className="mt-4">
            And that&apos;s just one type of leak.
          </p>
        </div>

        {/* Leak types list — glass card */}
        <div className="mb-14 glass-card rounded-2xl p-6 md:p-8">
          <div className="mb-5 text-sm font-semibold text-white/70">
            Here&apos;s what&apos;s actually happening inside most SaaS billing accounts right now:
          </div>
          <ul className="space-y-3 text-sm text-white/45">
            {[
              "Coupons that expired months ago, still giving discounts to customers who should be paying full price",
              "\"Lifetime\" discounts from a launch promotion that are still silently reducing every invoice",
              "Failed payments that Stripe's Smart Retries couldn't recover, sitting in limbo",
              "Credit cards expiring next month with no alert, no fallback, no plan",
              "Ghost subscriptions: customers who stopped using your product months ago but are still marked \"active\" (and when they notice, they'll chargeback)",
              "Legacy pricing from 2 years ago on customers who should be paying your current rates",
              "Trials that expired and never converted, but also never canceled. Just... floating",
              "Duplicate subscriptions that nobody noticed",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger/60 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dollar math — the accumulation */}
        <div className="mb-14 glass-card rounded-2xl p-6 md:p-8 text-center">
          <div className="mb-5 text-sm text-white/40">Sound small? Run the math.</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="text-xs text-white/30 mb-2">$10K MRR</div>
              <div className="text-lg font-bold text-danger font-display">$300/mo</div>
              <div className="text-xs text-white/25 mt-1">= $3,600/year gone</div>
            </div>
            <div className="rounded-xl border border-warning/15 bg-warning/[0.04] p-5">
              <div className="text-xs text-white/30 mb-2">$50K MRR</div>
              <div className="text-xl font-bold text-warning font-display">$1,500/mo</div>
              <div className="text-xs text-white/25 mt-1">= $18,000/year gone</div>
            </div>
            <div className="rounded-xl border border-danger/15 bg-danger/[0.04] p-5">
              <div className="text-xs text-white/30 mb-2">$100K MRR</div>
              <div className="text-2xl font-bold text-danger font-display">$4,000/mo</div>
              <div className="text-xs text-white/25 mt-1">= $48,000/year gone</div>
            </div>
          </div>
          <p className="mt-6 text-sm text-white/40">
            That&apos;s not a rounding error. That&apos;s a hire. That&apos;s a marketing budget. That&apos;s runway.
          </p>
          <p className="mt-2 text-sm text-white/30">
            And it compounds. Every month you don&apos;t check, the number grows. Silently.
          </p>
        </div>

        {/* ── Section C: The Villain Reveal ── */}
        <div className="section-divider mb-14" />

        <h3 className="mb-6 font-display text-2xl font-bold text-white md:text-3xl lg:text-4xl">
          This isn&apos;t your fault.
          <br />
          <span className="text-white/40">But it is your problem.</span>
        </h3>

        <div className="mb-10 max-w-2xl text-[15px] leading-[1.8] text-white/45">
          <p>
            Look, you didn&apos;t miss these leaks because you&apos;re bad at running a business. You missed them because of something nobody talks about.
          </p>
          <p className="mt-5">
            <span className="font-semibold text-brand">We call it The Silent Billing Decay.</span>
          </p>
          <p className="mt-5">
            Stripe is incredible at processing payments. That&apos;s their job, and they do it really well. But billing health? Checking whether your coupons are still valid, whether your pricing is current, whether you have ghost subscriptions eating your MRR? <span className="font-semibold text-white/60">That&apos;s not Stripe&apos;s job.</span> They don&apos;t check it. They don&apos;t alert you. And honestly, they don&apos;t have much reason to.
          </p>
          <p className="mt-5">
            So who&apos;s watching? Nobody.
          </p>
          <p className="mt-5">
            You probably thought: &ldquo;If I was losing money, I&apos;d know.&rdquo; Most founders think that. 42% of SaaS companies are leaking revenue right now, according to MGI Research. Most of them have no idea.
          </p>
        </div>

        {/* The dunning gap — key insight */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border-brand/10">
          <p className="text-sm text-white/45 leading-[1.8]">
            And here&apos;s what makes it worse. You might think: &ldquo;I have a dunning tool. I&apos;m covered.&rdquo;
          </p>
          <p className="mt-4 text-sm text-white/45 leading-[1.8]">
            Actually, you&apos;re not. Your dunning tool handles failed payments. That&apos;s <span className="font-bold text-white/70">1 type</span> of billing leak.
          </p>
          <p className="mt-4 text-2xl font-bold text-brand font-display">
            There are 10.
          </p>
          <p className="mt-4 text-sm text-white/40 leading-[1.8]">
            Expired coupons. Never-expiring discounts. Ghost subscriptions. Legacy pricing. Missing payment methods. Unbilled overages. Expired trials. Duplicate subscriptions. And more.
          </p>
          <p className="mt-4 text-sm text-white/40 leading-[1.8]">
            Every dunning tool in the market, all 21+ of them (Baremetrics Recover, Churnkey, Churn Buster, Stunning, Butter, Gravy), does the same thing: recover failed payments. That&apos;s it.
          </p>
          <p className="mt-5 text-sm font-semibold text-white/70 leading-[1.8]">
            8 out of 10 leak types have zero automated tools checking them. Zero. Not a single product in the market.
          </p>
          <p className="mt-4 text-sm text-white/40 leading-[1.8]">
            That&apos;s why nothing has worked. You weren&apos;t ignoring the problem. The tools you trusted were only covering a fraction of it.
          </p>
        </div>
      </div>
    </section>
  );
}
