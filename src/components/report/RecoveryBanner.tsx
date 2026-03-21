"use client";

import Link from "next/link";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface RecoveryBannerProps {
  mrrAtRisk: number; // in cents (weighted, monthly)
  isLoggedIn?: boolean;
  isDemo?: boolean;
  pendingActionsCount?: number;
  actionableLeakCount?: number; // total leaks with auto-fix available (for demo)
  recoveryPotential?: number; // kept for backwards compat, not displayed
}

export default function RecoveryBanner({
  mrrAtRisk,
  isLoggedIn = false,
  isDemo = false,
  pendingActionsCount = 0,
  actionableLeakCount = 0,
}: RecoveryBannerProps) {
  // Show monthly at-risk amount (more believable, easier to verify)
  const monthlyDollars = Math.round(mrrAtRisk / 100);
  const animatedDollars = useAnimatedNumber(monthlyDollars, 1500, 200);

  if (mrrAtRisk <= 0) return null;

  const hasActions = isLoggedIn && pendingActionsCount > 0;
  const demoFixCount = actionableLeakCount || 0;

  const scrollToAgent = () => {
    document.getElementById("agent-simulation")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToLeaks = () => {
    document.getElementById("leak-table")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 md:p-8 glow-green animate-fade-in-up">
      {/* Free fix callout for non-logged-in, non-demo users */}
      {!isLoggedIn && !isDemo && (
        <div className="mb-4 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-center text-sm text-text-secondary">
          <span className="font-semibold text-brand">Your first recovery action is free.</span>{" "}
          Pick your biggest leak. Hit Fix. Done.
        </div>
      )}
      <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
          <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
            <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Monthly Revenue at Risk
            </span>
          </div>
          <p className="text-3xl font-bold text-white md:text-4xl">
            ${animatedDollars.toLocaleString()}
            <span className="text-lg font-medium text-brand">/mo</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {hasActions || (isDemo && demoFixCount > 0)
              ? "We generated recovery actions you can execute with one click."
              : "Based on typical recovery rates for each leak type."}
          </p>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row md:mt-0">
          {isDemo && demoFixCount > 0 ? (
            /* Demo: Auto-Fix button scrolls to AgentSimulation */
            <>
              <button
                onClick={scrollToAgent}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black transition-all hover:bg-brand-light hover:brightness-110 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Auto-Fix {demoFixCount} Leak{demoFixCount !== 1 ? "s" : ""}
              </button>
              <button
                onClick={scrollToLeaks}
                className="inline-flex items-center gap-1 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm font-medium text-brand transition hover:bg-brand/10 cursor-pointer"
              >
                View details
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </>
          ) : hasActions ? (
            /* Real user with pending actions: link to actions page */
            <>
              <Link
                href="/dashboard/actions"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black transition-all hover:bg-brand-light hover:brightness-110"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Auto-Fix {pendingActionsCount} Leak{pendingActionsCount !== 1 ? "s" : ""}
              </Link>
              <button
                onClick={scrollToLeaks}
                className="inline-flex items-center gap-1 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm font-medium text-brand transition hover:bg-brand/10 cursor-pointer"
              >
                View details
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </>
          ) : !isLoggedIn ? (
            /* Not logged in: CTA to sign up for auto-fix */
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black transition-all hover:bg-brand-light hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Auto-Fix These Leaks
            </Link>
          ) : (
            /* Logged in, no pending actions */
            <button
              onClick={scrollToLeaks}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black transition-all hover:bg-brand-light hover:brightness-110 cursor-pointer"
            >
              View Leak Details
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
