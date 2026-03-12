"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useSectionView } from "@/hooks/useSectionView";
import { trackCheckoutStarted } from "@/lib/conversion-tracking";

/* Grand Slam Offer naming ($100M Offers) + value stacking */
const plans = [
  {
    name: "Revenue X-Ray",
    badge: "FREE $2,847 AUDIT",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualMonthly: "$0",
    period: "",
    description: "See exactly how much you could recover. No strings.",
    features: [
      "Full 10-scanner revenue audit ($500 value)",
      "Customer-level leak report with names & amounts",
      "Billing Health Score with industry comparison",
      "1 AI recovery action: auto-fix your biggest leak",
      "Step-by-step fix instructions for every leak found",
      "PDF & CSV export to share with your team",
    ],
    cta: "Get My Free $2,847 Audit",
    href: "/scan",
    highlighted: false,
    isPaid: false,
    planId: "free",
    valueStack: null,
    freeValueStack: [
      { name: "10-Scanner Revenue Audit", value: "$500" },
      { name: "Customer-Level Leak Report", value: "$800" },
      { name: "Billing Health Score", value: "$200" },
      { name: "Fix Playbook", value: "$300" },
      { name: "1 AI Recovery Action", value: "$297" },
      { name: "PDF/CSV Export", value: "$150" },
      { name: "Industry Benchmarks", value: "$200" },
    ],
  },
  {
    name: "Leak Watch",
    badge: "SMART START",
    monthlyPrice: "$79",
    annualPrice: "$790",
    annualMonthly: "$66",
    period: "/month",
    description: "Your billing gets checked every month. You get alerts. No surprises.",
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
    valueStack: { recovery: "$2,340", support: "$200", total: "$2,540", roi: "30x" },
  },
  {
    name: "Revenue Shield",
    badge: "MOST POPULAR",
    monthlyPrice: "$299",
    annualPrice: "$2,990",
    annualMonthly: "$249",
    period: "/month",
    description: "Runs in the background. You build, it watches your billing.",
    features: [
      "Everything in Leak Watch",
      "Weekly scans (not just monthly)",
      "Auto-recovery on failed payments",
      "Pre-churn alerts on expiring cards",
      "Privacy Mode: customers stay anonymous",
      "Slack + email alerts",
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
    monthlyPrice: "$499",
    annualPrice: "$4,990",
    annualMonthly: "$416",
    period: "/month",
    description: "Everything your revenue team needs in one dashboard.",
    features: [
      "Everything in Revenue Shield",
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
    valueStack: { recovery: "$2,340", support: "$1,200", total: "$3,540", roi: "7x" },
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
        {/* Headline — ROI math upfront (Hormozi Hack #4: Reason Why) */}
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Choose how much money you want back.
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-text-muted">
          The free audit finds your leaks. Paid plans watch and fix them automatically.
          <br />
          Average recovery: <span className="text-white font-semibold">$2,340/mo</span>.
          Start monitoring for <span className="text-white font-semibold">{billing === "annual" ? "$66" : "$79"}/mo</span> or
          auto-recover for <span className="text-white font-semibold">{billing === "annual" ? "$249" : "$299"}/mo</span>.
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
                <p className="mb-6 text-sm text-text-muted">{plan.description}</p>
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

                {/* Free plan value stack — Hormozi Grand Slam: show perceived value */}
                {(plan as typeof plans[0] & { freeValueStack?: { name: string; value: string }[] }).freeValueStack && (
                  <div className="mb-6 rounded-lg border border-brand/20 bg-brand/5 p-3 sm:p-4 text-xs md:text-sm">
                    <div className="mb-2 font-semibold text-brand uppercase tracking-wider text-xs">What you get for free</div>
                    <div className="space-y-1.5">
                      {(plan as typeof plans[0] & { freeValueStack?: { name: string; value: string }[] }).freeValueStack!.map((item) => (
                        <div key={item.name} className="flex justify-between gap-2 text-text-secondary">
                          <span className="truncate">{item.name}</span>
                          <span className="font-semibold shrink-0 line-through text-text-dim">{item.value}</span>
                        </div>
                      ))}
                      <div className="border-t border-brand/20 my-2" />
                      <div className="flex justify-between gap-2 text-white font-semibold">
                        <span>Total value</span>
                        <span className="shrink-0 line-through text-text-dim">$2,847</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-text-muted">You pay</span>
                        <span className="font-bold text-brand text-lg">$0</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Value stacking ($100M Offers) */}
                {plan.valueStack && (
                  <div className="mb-6 rounded-lg border border-border bg-surface-dim p-3 sm:p-4 text-xs md:text-sm">
                    <div className="mb-2 font-semibold text-text-muted uppercase tracking-wider text-xs">Value you get</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between gap-2 text-text-secondary">
                        <span className="truncate">Avg. monthly recovery</span>
                        <span className="font-semibold shrink-0">{plan.valueStack.recovery}/mo</span>
                      </div>
                      <div className="flex justify-between gap-2 text-text-secondary">
                        <span className="truncate">Priority support</span>
                        <span className="font-semibold shrink-0">{plan.valueStack.support}/mo</span>
                      </div>
                      <div className="border-t border-border my-2" />
                      <div className="flex justify-between gap-2 text-white font-semibold">
                        <span>Total value</span>
                        <span className="shrink-0">{plan.valueStack.total}/mo</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-text-muted">You pay</span>
                        <span className="font-semibold text-brand shrink-0">{displayPrice}/mo</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-text-muted">Your ROI</span>
                        <span className="font-bold text-brand">{plan.valueStack.roi}</span>
                      </div>
                    </div>
                  </div>
                )}

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
                    {/* $1,000/mo guarantee — Hormozi risk reversal at decision point */}
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
      </div>
    </section>
  );
}
