"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    name: "Free Audit",
    price: "$0",
    period: "",
    description: "See exactly what you're losing right now",
    features: [
      "Full Revenue Leak Report",
      "All 7 leak types scanned",
      "Actionable fix list per leak",
      "One-time scan",
    ],
    cta: "Scan Now — Free",
    href: "/scan",
    highlighted: false,
    waitlist: false,
    planId: "free",
  },
  {
    name: "Monthly Monitor",
    price: "$299",
    period: "/month",
    description: "Continuous protection against revenue leaks",
    features: [
      "Everything in Free Audit",
      "Weekly automated scans",
      "Real-time leak alerts",
      "Leak trend tracking",
      "Slack & email notifications",
      "Priority support",
    ],
    cta: "Get Early Access",
    href: "#",
    highlighted: true,
    waitlist: true,
    planId: "monthly_monitor",
  },
  {
    name: "Growth",
    price: "$499",
    period: "/month",
    description: "Full revenue intelligence for scaling SaaS",
    features: [
      "Everything in Monthly Monitor",
      "Per-customer margin analysis",
      "Revenue optimization suggestions",
      "Dedicated account manager",
      "Custom leak rules",
    ],
    cta: "Get Early Access",
    href: "#",
    highlighted: false,
    waitlist: true,
    planId: "growth",
  },
];

export function Pricing() {
  const [activeWaitlist, setActiveWaitlist] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleWaitlistSubmit(e: React.FormEvent, planId: string) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: planId }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleCtaClick(plan: typeof plans[number]) {
    if (plan.waitlist) {
      setActiveWaitlist(activeWaitlist === plan.planId ? null : plan.planId);
      setStatus("idle");
      setEmail("");
    }
  }

  return (
    <section id="pricing" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          Pricing
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Start with a free audit. Upgrade when it pays for itself.
        </h2>
        <p className="mb-16 text-center text-lg text-[#999]">
          If we don&apos;t find at least $1,000/month in leaked revenue, you pay nothing.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-[#10B981]/50 bg-[#10B981]/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                  : "border-[#2A2A2A] bg-[#111]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#10B981] px-4 py-1 text-xs font-bold text-black">
                  RECOMMENDED
                </div>
              )}
              <h3 className="mb-1 text-lg font-bold text-white">{plan.name}</h3>
              <p className="mb-6 text-sm text-[#999]">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-[#999]">{plan.period}</span>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#CCC]">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button or Waitlist Form */}
              {plan.waitlist ? (
                <div>
                  {activeWaitlist === plan.planId && status === "success" ? (
                    <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 p-4 text-center">
                      <svg className="mx-auto mb-2 h-6 w-6 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm font-semibold text-[#10B981]">You&apos;re on the list!</p>
                      <p className="mt-1 text-xs text-[#999]">We&apos;ll notify you when {plan.name} launches.</p>
                    </div>
                  ) : activeWaitlist === plan.planId ? (
                    <form onSubmit={(e) => handleWaitlistSubmit(e, plan.planId)} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        autoFocus
                        className="w-full rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-[#666] outline-none transition-colors focus:border-[#10B981]/50"
                      />
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                          plan.highlighted
                            ? "bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            : "border border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#10B981]/30 hover:bg-[#222]"
                        }`}
                      >
                        {status === "loading" ? "Joining..." : "Join Waitlist"}
                      </button>
                      {status === "error" && (
                        <p className="text-xs text-[#EF4444] text-center">Something went wrong. Please try again.</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveWaitlist(null)}
                        className="w-full text-xs text-[#666] hover:text-[#999] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => handleCtaClick(plan)}
                      className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all cursor-pointer ${
                        plan.highlighted
                          ? "bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                          : "border border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#10B981]/30 hover:bg-[#222]"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              ) : (
                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "border border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#10B981]/30 hover:bg-[#222]"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
