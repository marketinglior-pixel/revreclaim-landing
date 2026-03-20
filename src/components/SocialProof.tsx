"use client";

import { ScanCounter } from "@/components/ScanCounter";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

// ────────────────────────────────────────────────────────
// Social Proof — Founder Story (G1) + Industry Data (G2)
// Replaces fake testimonials with honest positioning
// ────────────────────────────────────────────────────────

const industryStats = [
  { value: "42%", label: "of SaaS companies experience revenue leakage", source: "MGI Research" },
  { value: "1-5%", label: "of EBITDA lost to billing issues", source: "EY" },
  { value: "$129B", label: "lost annually to failed payments alone (just 1 of 10 leak types)", source: "Recurly, 2024" },
  { value: "3-7%", label: "of top-line revenue erodes every year from billing decay", source: "MGI Research" },
];

const productFacts = [
  "10 scanner types covering leak categories that zero other tools check",
  "90-second scan on real Stripe/Polar/Paddle data, not estimates",
  "Risk-adjusted amounts, never inflated. Our MRR number matches your Stripe Dashboard exactly",
  "Every leak is verifiable. Click through to Stripe and confirm it yourself",
  "Read-only API key. We literally cannot change anything in your account",
];

export function SocialProof() {
  return (
    <section className="relative py-20 md:py-28">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-brand/[0.03] blur-[150px]" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* ── G1: Founder Story ── */}
        <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-brand/80">
          Why this exists
        </div>
        <h2 className="mb-10 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Why I built this
        </h2>

        <div className="glass-card rounded-2xl p-6 md:p-10 mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-brand/30 to-emerald-600/20 flex items-center justify-center border border-brand/15">
              <span className="text-lg font-bold text-brand font-display">L</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Lior Cohen</p>
              <p className="text-[11px] text-white/25">Founder, RevReclaim</p>
            </div>
          </div>

          <div className="space-y-4 text-sm md:text-[15px] text-white/45 leading-[1.8]">
            <p>
              I&apos;ll be honest with you. I built RevReclaim because I was the guy losing money.
            </p>
            <p>
              I was running my SaaS, watching MRR grow, feeling pretty good about things. Then one afternoon, honestly just out of boredom, I clicked into the coupons section of my Stripe dashboard. And there it was. A coupon I&apos;d created for a one-time promotion. Still running. For four months.
            </p>
            <p>
              I spent the next 3 hours digging through Stripe manually. Found a ghost subscription. An expiring card with no fallback. A legacy customer paying 40% less than my current rate. The deeper I dug, the worse it got.
            </p>
            <p>
              So I looked for a tool that could do this automatically. Found 21+ options. Every single one did the same thing: dunning (recovering failed payments). That&apos;s 1 out of 10 leak types.
            </p>
            <p>
              Nobody, and I mean nobody, had built a tool that checked for expired coupons, ghost subscriptions, legacy pricing, never-expiring discounts, or any of the other 8 types of silent billing decay.
            </p>
            <p className="font-semibold text-white/60">
              So I built one.
            </p>
            <p>
              10 scanners. 90 seconds. Read-only access. Direct fix links.
            </p>
            <p>
              I ran it on my own account first. Found 7 leaks. Fixed 5 of them that evening. The money came back the next month.
            </p>
            <p>
              If I, a technical founder who actually understands Stripe, missed these things for months, I kept thinking, what about the 42% of SaaS companies that MGI Research says are leaking revenue without knowing?
            </p>
            <p className="font-semibold text-white/60">
              That&apos;s why RevReclaim exists. Not because I&apos;m a billing expert. But because I&apos;m a founder who got tired of leaking money.
            </p>
          </div>
        </div>

        {/* ── G2: Industry Data (honest positioning) ── */}
        <div className="section-divider mb-14" />

        <h3 className="mb-4 font-display text-2xl font-bold text-white md:text-3xl">
          The numbers don&apos;t lie
        </h3>
        <p className="mb-10 max-w-2xl text-[15px] text-white/40 leading-relaxed">
          We&apos;re a new tool. Let&apos;s be upfront about that. We don&apos;t have 500 testimonials and a fancy case study page. But here&apos;s what we do have:
        </p>

        {/* Industry stats grid */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {industryStats.map((stat) => (
            <div key={stat.value} className="glass-card-hover rounded-2xl p-5">
              <div className="text-2xl font-bold text-brand font-display mb-1">{stat.value}</div>
              <p className="text-sm text-white/45 leading-[1.6]">{stat.label}</p>
              <p className="mt-2 text-[11px] text-white/20">{stat.source}</p>
            </div>
          ))}
        </div>

        {/* Product facts */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-10">
          <div className="mb-5 text-sm font-semibold text-white/70">
            And what RevReclaim specifically does:
          </div>
          <ul className="space-y-3">
            {productFacts.map((fact) => (
              <li key={fact} className="flex items-start gap-3 text-sm text-white/45">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <p className="mb-10 text-[15px] text-white/40 leading-relaxed">
          We&apos;re not asking you to trust a marketing page. We&apos;re asking you to run a free scan and see for yourself.
        </p>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: <ScanCounter />, label: "Scans completed", accent: true },
            { value: "10", label: "Leak types checked" },
            { value: "90s", label: "Average scan time" },
            { value: "3", label: "Platforms supported" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-xl px-5 py-4 text-center transition-all duration-300 ${
                i === 0
                  ? "border border-brand/15 bg-brand/[0.04]"
                  : "border border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]"
              }`}
            >
              <div className="text-2xl font-bold text-white md:text-3xl font-display">
                {stat.value}
              </div>
              <div className="mt-1 text-[11px] text-white/30">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="/scan"
            onClick={() => {
              trackEvent("cta_clicked", null, { location: "social_proof", action: "scan" }).catch(() => {});
              trackCTAClick("social_proof", "scan");
            }}
            className="btn-shimmer group inline-flex items-center gap-2.5 rounded-xl bg-brand px-8 py-4 text-base font-bold text-black min-h-[52px] transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
          >
            Show Me My Leaks
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-white/30">
            Free. 90 seconds. Judge us by the results.
          </p>
        </div>
      </div>
    </section>
  );
}
