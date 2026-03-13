"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useSectionView } from "@/hooks/useSectionView";
import { trackCheckoutStarted } from "@/lib/conversion-tracking";

const plans = [
  {
    name: "Revenue X-Ray",
    badge: "FREE FOREVER",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualMonthly: "$0",
    period: "",
    description: "Your complete billing audit. Every leak, every dollar amount, every fix. In 90 seconds.",
    features: [
      "Full 10-category revenue audit",
      "Customer-level leak report with amounts",
      "Billing Health Score",
      "1 auto-fix action on your biggest leak",
      "Step-by-step fix instructions for every leak",
      "PDF & CSV export to share with your team",
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
    name: "Leak Watch",
    badge: "SMART START",
    monthlyPrice: "$79",
    annualPrice: "$790",
    annualMonthly: "$66",
    period: "/month",
    description: "We check your billing every month so you don't have to. New leaks show up in your inbox.",
    features: [
      "Everything in Revenue X-Ray",
      "Monthly automated re-scan",
      "Email alerts when new leaks appear",
      "Leak trend tracking over time",
      "Priority email support (< 24hr)",
    ],
    cta: "Start Watching My Revenue →",
    href: "#",
    highlighted: false,
    isPaid: true,
    planId: "watch",
    valueStack: null,
  },
  {
    name: "Revenue Shield",
    badge: "MOST POPULAR",
    monthlyPrice: "$299",
    annualPrice: "$2,990",
    annualMonthly: "$249",
    period: "/month",
    description: "Set it and forget it. We find leaks, fix what we can automatically, and alert you about the rest.",
    features: [
      "Everything in Leak Watch",
      "Weekly scans (not just monthly)",
      "Auto-recovery on failed payments",
      "Pre-churn alerts on expiring cards",
      "HubSpot CRM integration (see WHY each leak matters)",
      "Leak priority ranking based on customer activity",
      "Privacy Mode: customers stay anonymous",
      "Slack + email alerts",
      "Priority support (< 4hr response)",
    ],
    cta: "Start Recovering Revenue →",
    href: "#",
    highlighted: true,
    isPaid: true,
    planId: "pro",
    valueStack: null,
  },
  {
    name: "Revenue Command Center",
    badge: "FOR TEAMS",
    monthlyPrice: "$499",
    annualPrice: "$4,990",
    annualMonthly: "$416",
    period: "/month",
    description: "One dashboard for your entire revenue team. Everyone sees the same leaks. Nobody drops the ball.",
    features: [
      "Everything in Revenue Shield",
      "HubSpot CRM integration for every team member",
      "Multi-user team access",
      "One dashboard. Everyone aligned on revenue health",
      "Pipe revenue alerts into your existing tools",
      "Full audit trail for board reporting & compliance",
    ],
    cta: "Get Full Revenue Control →",
    href: "#",
    highlighted: false,
    isPaid: true,
    planId: "team",
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
      trackCheckoutStarted(planId, planId === "watch" ? 79 : planId === "pro" ? 299 : 499);

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
        <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-brand">
          Pricing
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          The scan is free. The recovery is optional.
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-text-muted">
          Run a free scan. See your leaks. Fix the easy ones yourself (we show you how).
          If you want automated recovery, pick a plan.
          <br />
          Find less than $1,000/mo? Every paid plan is free.
        </p>

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
                className={`relative rounded-2xl border p-5 sm:p-8 ${
                  plan.highlighted
                    ? "border-brand/50 bg-brand/5 backdrop-blur-sm shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                    : "border-border/50 bg-surface/80 backdrop-blur-sm"
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
                {(plan.planId === "pro" || plan.planId === "team") && (
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-info/20 bg-info/5 px-3 py-1 text-xs font-semibold text-info">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Now with HubSpot CRM intelligence
                  </div>
                )}
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
                      className={`block w-full rounded-lg py-3 text-center text-sm font-semibold min-h-[44px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.highlighted
                          ? "bg-brand text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
                    {/* $1,000/mo guarantee */}
                    <p className="mt-3 text-center text-xs text-text-muted">
                      Find less than $1,000/mo? You pay nothing. Cancel anytime.
                    </p>
                  </>
                ) : (
                  <Link
                    href={plan.href}
                    onClick={() => { trackEvent("cta_clicked", null, { location: "pricing", action: "scan" }).catch(() => {}); }}
                    className={`block w-full rounded-lg py-3 text-center text-sm font-semibold min-h-[44px] transition-all ${
                      plan.highlighted
                        ? "bg-brand text-black hover:bg-brand-light hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
