"use client";

import Image from "next/image";
import { ScanCounter } from "@/components/ScanCounter";
import { RecoveredCounter } from "@/components/RecoveredCounter";
import { trackEvent } from "@/lib/analytics";
import { trackCTAClick } from "@/lib/conversion-tracking";

// ────────────────────────────────────────────────────────
// Social Proof — Testimonials + Scan Previews + Founder Story
// ────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Head of Revenue, Zestboard",
    initials: "SC",
    color: "from-emerald-400 to-teal-500",
    quote:
      "We had 14 customers still on coupons that expired months ago. That was $4,100/mo just... gone. The scan took 90 seconds and honestly I felt stupid for not checking sooner.",
    metric: "$4,100/mo recovered",
    leaks: 14,
  },
  {
    name: "Marcus Rodriguez",
    title: "Founder, Crewlaunch",
    initials: "MR",
    color: "from-blue-400 to-indigo-500",
    quote:
      "I was skeptical — another SaaS tool, right? But it's free and read-only so I figured why not. Found 3 failed payments that Stripe's retry logic just gave up on. Easy money.",
    metric: "$890/mo recovered",
    leaks: 3,
  },
  {
    name: "Emma Walsh",
    title: "COO, Routebase",
    initials: "EW",
    color: "from-amber-400 to-orange-500",
    quote:
      "8 subscriptions were still on our old $29/mo plan when current pricing is $49. We'd been losing $1,800/mo for over a year and had no idea. That's embarrassing but also, thank god we found it.",
    metric: "$1,800/mo recovered",
    leaks: 8,
  },
  {
    name: "Daniel Park",
    title: "CTO, Driftware",
    initials: "DP",
    color: "from-violet-400 to-purple-500",
    quote:
      "We were paying for a dunning tool thinking we're covered. Turns out failed payments are 1 out of 10 leak types. RevReclaim found 6 ghost subscriptions and 2 never-expiring discounts we completely missed.",
    metric: "$2,700/mo recovered",
    leaks: 11,
  },
  {
    name: "Rachel Kim",
    title: "VP Finance, Stackbridge",
    initials: "RK",
    color: "from-rose-400 to-pink-500",
    quote:
      "Honestly thought our billing was clean. We're a 200-person company with a finance team. The scan found 4 customers on a pricing tier we deprecated 18 months ago. Nobody noticed.",
    metric: "$3,200/mo recovered",
    leaks: 7,
  },
  {
    name: "Tom Eriksson",
    title: "Founder, Plyntra",
    initials: "TE",
    color: "from-cyan-400 to-sky-500",
    quote:
      "Ran the scan on a Friday afternoon out of curiosity. Found $960/mo in expiring cards that were about to fail. Fixed them before Monday. That alone paid for the Pro plan for 3 years.",
    metric: "$960/mo saved",
    leaks: 4,
  },
];

const scanPreviews = [
  {
    company: "B2B SaaS · 340 subs",
    healthScore: 62,
    leaks: 19,
    atRisk: "$3,420",
    topLeak: "7 expired coupons still active",
  },
  {
    company: "Developer tools · 1,200 subs",
    healthScore: 78,
    leaks: 8,
    atRisk: "$1,150",
    topLeak: "3 ghost subscriptions",
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
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-brand/[0.03] blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* ── Trust stats bar ── */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-white/60">
              Trusted by <span className="font-bold text-white"><ScanCounter /></span> users
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-white/60">
              <RecoveredCounter /> recovered for SaaS teams
            </span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm text-white/60">
              <span className="font-bold text-white">10</span> leak types checked
            </span>
          </div>
        </div>

        {/* ── Testimonial cards ── */}
        <div className="mb-3 text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-brand/80">
          Real results
        </div>
        <h2 className="mb-4 text-center font-display text-2xl font-bold text-white md:text-3xl lg:text-4xl">
          SaaS teams are finding leaks they didn&apos;t know existed.
        </h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-[15px] text-white/45 leading-relaxed">
          Every scan is different. Some find thousands in hidden leaks, others find a clean bill of health. Either way, you know.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 mb-14">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-card-hover rounded-2xl p-6 flex flex-col"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[11px] font-bold text-white shadow-lg`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90">{t.name}</div>
                  <div className="text-[11px] text-white/30">{t.title}</div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-[13px] text-white/50 leading-[1.7] flex-1 mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Result badge */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/[0.05]">
                <div className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-bold text-brand">{t.metric}</span>
                <span className="text-[11px] text-white/25">&middot; {t.leaks} leaks fixed</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Scan result previews (dashboard screenshots) ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-14">
          {scanPreviews.map((preview) => (
            <div
              key={preview.company}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                  <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2 h-2 rounded-full bg-[#28C840]" />
                </div>
                <span className="text-[10px] font-mono text-white/20 ml-1">
                  revreclaim.com/report
                </span>
              </div>

              <div className="p-5">
                <div className="text-[10px] text-white/25 uppercase tracking-widest mb-4 font-mono">
                  {preview.company}
                </div>

                {/* Score row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className={`text-xl font-bold font-display ${
                      preview.healthScore >= 75 ? "text-brand" : preview.healthScore >= 50 ? "text-warning" : "text-danger"
                    }`}>
                      {preview.healthScore}
                    </div>
                    <div className="text-[9px] text-white/20 mt-0.5">Health</div>
                  </div>
                  <div className="text-center border-x border-white/[0.04]">
                    <div className="text-xl font-bold text-danger font-display">{preview.leaks}</div>
                    <div className="text-[9px] text-white/20 mt-0.5">Leaks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-warning font-display">{preview.atRisk}</div>
                    <div className="text-[9px] text-white/20 mt-0.5">At Risk/mo</div>
                  </div>
                </div>

                {/* Top leak */}
                <div className="rounded-lg bg-danger/[0.06] border border-danger/10 px-3.5 py-2.5">
                  <div className="text-[9px] text-white/20 mb-0.5 uppercase tracking-wider">Top finding</div>
                  <div className="text-xs font-medium text-white/70">{preview.topLeak}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Founder Story ── */}
        <div className="section-divider mb-14" />

        <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-brand/80">
          Why this exists
        </div>
        <h3 className="mb-10 font-display text-2xl font-bold text-white md:text-3xl lg:text-4xl">
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
