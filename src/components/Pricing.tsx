"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useSectionView } from "@/hooks/useSectionView";
import { trackCheckoutStarted } from "@/lib/conversion-tracking";

const plans = [
  {
    name: "Free Scan",
    badge: "FREE FOREVER",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualMonthly: "$0",
    period: "",
    description: "One-time scan. See your top 3 leaks with full details and fix links.",
    features: [
      "Full 10-category revenue audit",
      "Customer-level leak report with amounts",
      "Billing Health Score",
      "1 auto-fix action on your biggest leak",
      "Fix instructions for top 3 leaks",
    ],
    cta: "Run a Free Scan",
    href: "/scan",
    highlighted: false,
    isPaid: false,
    planId: "free",
    valueStack: null,
    freeValueStack: null,
  },
  {
    name: "Pro",
    badge: "MOST POPULAR",
    monthlyPrice: "$49",
    annualPrice: "$490",
    annualMonthly: "$41",
    period: "/month",
    description: "See all your leaks. Auto-fix them. Get alerts when new ones appear.",
    features: [
      "Everything in Free Scan",
      "All leaks visible (not just top 3)",
      "Auto-fix for every leak type",
      "Monthly automated re-scan",
      "PDF & CSV export",
      "Leak degradation alerts",
      "Email alerts when new leaks appear",
      "Priority email support (< 24hr)",
    ],
    cta: "Start Fixing Leaks →",
    href: "#",
    highlighted: true,
    isPaid: true,
    planId: "watch",
    valueStack: null,
  },
  {
    name: "Team",
    badge: "FOR GROWING TEAMS",
    monthlyPrice: "$149",
    annualPrice: "$1,490",
    annualMonthly: "$124",
    period: "/month",
    description: "Weekly scans, auto-recovery, multi-user access. Built for teams that take billing seriously.",
    features: [
      "Everything in Pro",
      "Weekly scans (not just monthly)",
      "Auto-recovery on failed payments",
      "Pre-churn alerts on expiring cards",
      "Multi-user team access",
      "Slack + email alerts",
      "Privacy Mode: customers stay anonymous",
      "Priority support (< 4hr response)",
    ],
    cta: "Get Team Access →",
    href: "#",
    highlighted: false,
    isPaid: true,
    planId: "pro",
    valueStack: null,
  },
];

export function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const sectionRef = useSectionView("pricing");

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billing }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Not logged in — redirect to signup with plan redirect
        globalThis.location.assign(`/auth/signup?redirect=${encodeURIComponent("/#pricing")}`);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoadingPlan(null);
        return;
      }

      // Track checkout event (fire-and-forget)
      trackEvent("checkout_started", null, { plan: planId, billing }).catch(() => {});
      trackCheckoutStarted(planId, planId === "watch" ? 49 : planId === "pro" ? 149 : 49);

      // Redirect to Polar Checkout
      globalThis.location.assign(data.url);
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <section ref={sectionRef} id="pricing" className="border-t border-border-light py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand/80">
          Pricing
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          What you get (and what it&apos;s actually worth)
        </h2>
        <div className="mx-auto mb-10 max-w-2xl text-center text-sm text-text-muted space-y-3">
          <p>
            <span className="font-semibold text-white/70">Manual billing audit:</span> 4-8 hours of your time. You&apos;re a founder. Your time is worth, conservatively, $150/hour. That&apos;s $600-$1,200 per audit. And you&apos;ll cover maybe 3-5 leak types.
          </p>
          <p>
            <span className="font-semibold text-white/70">A fractional RevOps hire:</span> $3,000-$8,000/month. They&apos;ll check billing alongside 47 other things.
          </p>
          <p>
            <span className="font-semibold text-white/70">Doing nothing:</span> $1,500-$5,000/month leaking. Every month. Compounding.
          </p>
          <p>
            <span className="font-semibold text-brand">RevReclaim:</span> All 10 leak types. 90 seconds. Fix links. Direct to Stripe. Start with a one-time audit or set up ongoing monitoring.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBilling("monthly")}
            className={`text-sm font-medium transition cursor-pointer ${
              billing === "monthly" ? "text-white" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
              billing === "annual" ? "bg-brand" : "bg-border"
            }`}
            aria-label="Toggle annual billing"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                billing === "annual" ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              billing === "annual" ? "text-white" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Annual
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
              Save 17%
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-8 mx-auto max-w-md rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-center text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan) => {
            const displayPrice = billing === "annual" && plan.isPaid
              ? plan.annualMonthly
              : plan.isPaid
                ? plan.monthlyPrice
                : "$0";
            const displayPeriod = plan.isPaid
              ? billing === "annual"
                ? "/mo"
                : "/month"
              : "";

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-5 sm:p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "glass-card-elevated border-brand/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:scale-[1.01]"
                    : "border border-border/50 bg-surface/80 backdrop-blur-sm hover:border-white/[0.08]"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold ${
                    plan.highlighted ? "bg-brand text-black" : "bg-border text-text-muted"
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold text-white">{plan.name}</h3>
                <p className="mb-3 text-sm text-text-muted">{plan.description}</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white">{displayPrice}</span>
                  <span className="text-text-muted">{displayPeriod}</span>
                </div>
                {billing === "annual" && plan.isPaid && (
                  <p className="mb-5 text-xs text-text-muted">
                    Billed as {plan.annualPrice}/year{" "}
                    <span className="text-text-dim line-through">{plan.monthlyPrice}/mo</span>
                  </p>
                )}
                {(!plan.isPaid || billing === "monthly") && <div className="mb-6" />}
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.isPaid ? (
                  <>
                    <button
                      onClick={() => { trackEvent("cta_clicked", null, { location: "pricing", action: "upgrade", billing }).catch(() => {}); handleCheckout(plan.planId); }}
                      disabled={loadingPlan !== null}
                      className={`block w-full rounded-xl py-4 text-center text-base font-bold min-h-[52px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.highlighted
                          ? "bg-brand text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
                          : "border border-border bg-surface-light text-white hover:border-brand/30 hover:bg-surface-lighter"
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
                    {/* Guarantee text */}
                    <p className="mt-3 text-center text-xs text-text-muted">
                      Find less than $1,000/mo? You pay nothing. Cancel anytime.
                    </p>
                  </>
                ) : (
                  <Link
                    href={plan.href}
                    onClick={() => { trackEvent("cta_clicked", null, { location: "pricing", action: "scan" }).catch(() => {}); }}
                    className={`block w-full rounded-xl py-4 text-center text-base font-bold min-h-[52px] transition-all ${
                      plan.highlighted
                        ? "bg-brand text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
                        : "border border-border bg-surface-light text-white hover:border-brand/30 hover:bg-surface-lighter"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Guarantee banner */}
        <div className="mt-10 rounded-2xl border border-brand/30 bg-brand/5 p-6 md:p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-lg font-bold text-white">The $1,000/mo Revenue Guarantee</span>
          </div>
          <p className="text-sm text-text-muted">
            We find at least $1,000/month in recoverable revenue, or every paid plan is free.
            No fine print. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
