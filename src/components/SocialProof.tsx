"use client";

import Image from "next/image";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

// ────────────────────────────────────────────────────────
// Social Proof — Leak Types + Founder Story + Industry Data
// ────────────────────────────────────────────────────────

const leakTypes = [
  {
    name: "Expired Coupons",
    desc: "A 20% off code you made for Black Friday is still running in March. Nobody turned it off.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    name: "Never-Expiring Discounts",
    desc: "You gave an early adopter 50% off \"for a few months.\" It's been two years. Still active.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  {
    name: "Failed Payments",
    desc: "Stripe retried a charge 4 times, gave up, but the subscription is still marked \"active.\"",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    name: "Expiring Cards",
    desc: "A customer's card expires next month. No backup on file. You'll lose them silently.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    name: "Ghost Subscriptions",
    desc: "Status says \"active\" but the last successful payment was 3 months ago. Nobody's paying.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    name: "Legacy Pricing",
    desc: "You raised prices 8 months ago. 23 customers are still on the old plan. Stripe won't tell you.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    name: "Missing Payment Method",
    desc: "Active subscription, no card on file. Could be a migration glitch. Either way, no one's paying.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    name: "Unbilled Overages",
    desc: "Customer is using 150% of their plan's limits. You're eating the cost and they don't know.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    name: "Expired Trials",
    desc: "14-day trial ended 3 weeks ago. No conversion. No follow-up. They just... left.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Duplicate Subscriptions",
    desc: "Same customer, same plan, two active subscriptions. Double-charged. They'll notice eventually.",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.5a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
    ),
  },
];

const industryStats = [
  { value: "42%", label: "of SaaS companies experience revenue leakage", source: "MGI Research" },
  { value: "1-5%", label: "of EBITDA lost to billing issues", source: "EY" },
  { value: "$129B", label: "lost annually to failed payments alone (just 1 of 10 leak types)", source: "Recurly, 2024" },
  { value: "3-7%", label: "of top-line revenue erodes every year from billing decay", source: "MGI Research" },
];

export function SocialProof() {
  return (
    <section className="relative py-20 md:py-28">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-brand/[0.03] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* ── Trust stats bar ── */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-white/60">
              <span className="font-bold text-white">10</span> leak types checked
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-white/60">
              <span className="font-bold text-white">Read-only</span> API access
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-white/60">
              <span className="font-bold text-white">90-second</span> scan
            </span>
          </div>
        </div>

        {/* ── What the scan checks ── */}
        <div className="mb-3 text-center text-[13px] text-white/40 font-medium tracking-wide">
          What we scan for
        </div>
        <h2 className="mb-4 text-center font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
          10 leak types most tools miss
        </h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-[15px] text-white/45 leading-relaxed">
          Failed payments get all the attention. But they&apos;re just 1 of 10 ways your Stripe account quietly loses money.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-14">
          {leakTypes.map((leak) => (
            <div
              key={leak.name}
              className="glass-card-hover rounded-xl p-4 flex flex-col"
            >
              <div className="mb-2.5 text-brand/70">{leak.icon}</div>
              <div className="text-sm font-semibold text-white/80 mb-1.5">{leak.name}</div>
              <div className="text-[12px] text-white/40 leading-[1.6]">{leak.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Founder Story ── */}
        <div className="section-divider mb-14" />

        <div className="mb-3 text-[13px] text-white/35 font-medium">
          Why this exists
        </div>
        <h3 className="mb-10 font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
          Why I built this
        </h3>

        <div className="glass-card rounded-2xl p-6 md:p-10 mb-14">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border border-brand/15">
              <Image src="/images/lior-cohen.jpg" alt="Lior Cohen" width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80">Lior Cohen</p>
              <p className="text-[11px] text-white/25">Founder, RevReclaim</p>
              <a
                href="https://www.linkedin.com/in/liorco8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-brand/70 hover:text-brand transition-colors duration-200"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
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
              So I looked for a tool that could do this automatically. Found 21+ options. Every single one did the same thing: dunning (recovering failed payments). That&apos;s 1 out of 10 leak types. Nobody had built a tool that checked for the other 9.
            </p>
            <p className="font-semibold text-white/60">
              So I built one. 10 scanners. 90 seconds. Read-only access. Direct fix links.
            </p>
          </div>
        </div>

        {/* ── Industry data ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          {industryStats.map((stat) => (
            <div key={stat.value} className="glass-card-hover rounded-2xl p-5">
              <div className="text-2xl font-bold text-brand font-display mb-1">{stat.value}</div>
              <p className="text-sm text-white/45 leading-[1.6]">{stat.label}</p>
              <p className="mt-2 text-[11px] text-white/20">{stat.source}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
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
