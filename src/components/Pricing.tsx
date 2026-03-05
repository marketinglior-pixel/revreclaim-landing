"use client";

import { useState } from "react";
import Link from "next/link";

/* Grand Slam Offer naming ($100M Offers) + value stacking */
const plans = [
  {
    name: "Revenue X-Ray",
    badge: "FREE FOREVER",
    price: "$0",
    period: "",
    description: "See exactly what you're losing. No strings.",
    features: [
      "Full 7-category leak scan",
      "Real customer names & dollar amounts",
      "One-click fix instructions per leak",
      "Billing Health Score (0–100)",
      "One scan per month",
    ],
    cta: "Paste Your Key → Free Report",
    href: "/scan",
    highlighted: false,
    isPaid: false,
    planId: "free",
    valueStack: null,
  },
  {
    name: "Revenue Shield",
    badge: "MOST POPULAR",
    price: "$299",
    period: "/month",
    description: "Continuous protection. Never leak revenue again.",
    features: [
      "Everything in Revenue X-Ray",
      "Unlimited on-demand scans",
      "Weekly automated scans",
      "Instant email alerts for new leaks",
      "Leak trend tracking over time",
      "Priority support (< 4hr response)",
    ],
    cta: "Start Recovering Revenue →",
    href: "#",
    highlighted: true,
    isPaid: true,
    planId: "pro",
    valueStack: { recovery: "$2,340", support: "$500", total: "$2,840", roi: "9x" },
  },
  {
    name: "Revenue Command Center",
    badge: "FOR TEAMS",
    price: "$499",
    period: "/month",
    description: "Full revenue intelligence for scaling SaaS teams.",
    features: [
      "Everything in Revenue Shield",
      "Up to 10 team members",
      "Shared dashboards & reports",
      "Dedicated account manager",
      "Custom leak detection rules",
    ],
    cta: "Get Full Revenue Control →",
    href: "#",
    highlighted: false,
    isPaid: true,
    planId: "team",
    valueStack: { recovery: "$2,340", support: "$1,200", total: "$3,540", roi: "7x" },
  },
];

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Not logged in — redirect to signup with plan redirect
        window.location.href = `/auth/signup?redirect=/${encodeURIComponent(`#pricing`)}`;
        return;
      }

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoadingPlan(null);
        return;
      }

      // Redirect to Lemon Squeezy Checkout
      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <section id="pricing" className="border-t border-[#1A1A1A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[#10B981]">
          Pricing
        </div>
        {/* Headline — ROI math upfront (Hormozi Hack #4: Reason Why) */}
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          The math is simple.{" "}
          <span className="text-[#999] italic">(That&apos;s the point.)</span>
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-[#999]">
          Average recovery: <span className="text-white font-semibold">$2,340/mo</span>.
          Pro plan: <span className="text-white font-semibold">$299/mo</span>.
          That&apos;s an <span className="text-[#10B981] font-semibold">8x return</span>.
          <br />
          If we don&apos;t find at least $1,000/mo in recoverable revenue, you pay nothing.
        </p>

        {error && (
          <div className="mb-8 mx-auto max-w-md rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 px-4 py-3 text-center text-sm text-[#EF4444]">
            {error}
          </div>
        )}

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
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold ${
                  plan.highlighted ? "bg-[#10B981] text-black" : "bg-[#2A2A2A] text-[#999]"
                }`}>
                  {plan.badge}
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

              {/* Value stacking ($100M Offers) */}
              {plan.valueStack && (
                <div className="mb-6 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4 text-xs">
                  <div className="mb-2 font-semibold text-[#999] uppercase tracking-wider">Value you get</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#CCC]">
                      <span>Avg. monthly recovery</span>
                      <span className="font-semibold">{plan.valueStack.recovery}/mo</span>
                    </div>
                    <div className="flex justify-between text-[#CCC]">
                      <span>Priority support</span>
                      <span className="font-semibold">{plan.valueStack.support}/mo</span>
                    </div>
                    <div className="border-t border-[#2A2A2A] my-2" />
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total value</span>
                      <span>{plan.valueStack.total}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#999]">You pay</span>
                      <span className="font-semibold text-[#10B981]">{plan.price}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#999]">Your ROI</span>
                      <span className="font-bold text-[#10B981]">{plan.valueStack.roi}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {plan.isPaid ? (
                <button
                  onClick={() => handleCheckout(plan.planId)}
                  disabled={loadingPlan !== null}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlighted
                      ? "bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "border border-[#2A2A2A] bg-[#1A1A1A] text-white hover:border-[#10B981]/30 hover:bg-[#222]"
                  }`}
                >
                  {loadingPlan === plan.planId ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirecting...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
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
