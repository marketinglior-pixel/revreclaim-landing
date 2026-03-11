"use client";

import Link from "next/link";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface RecoveryBannerProps {
  recoveryPotential: number; // in cents
  isLoggedIn?: boolean;
  pendingActionsCount?: number;
}

export default function RecoveryBanner({
  recoveryPotential,
  isLoggedIn = false,
  pendingActionsCount = 0,
}: RecoveryBannerProps) {
  const dollars = Math.round(recoveryPotential / 100);
  const animatedDollars = useAnimatedNumber(dollars, 1500, 200);

  if (recoveryPotential <= 0) return null;

  const hasActions = isLoggedIn && pendingActionsCount > 0;

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-6 md:p-8 glow-green animate-fade-in-up">
      {/* Free fix callout for non-logged-in users */}
      {!isLoggedIn && (
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
              Recoverable Revenue Found
            </span>
          </div>
          <p className="text-3xl font-bold text-white md:text-4xl">
            ${animatedDollars.toLocaleString()}
            <span className="text-lg font-medium text-brand">/year</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {hasActions
              ? "We generated recovery actions you can execute with one click."
              : "This is money you\u2019re losing right now. Fix these leaks to recover it."}
          </p>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row md:mt-0">
          {hasActions ? (
            <>
              <Link
                href="/dashboard/actions"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Auto-Fix {pendingActionsCount} Leak{pendingActionsCount !== 1 ? "s" : ""}
              </Link>
              <a
                href="#leak-table"
                className="inline-flex items-center gap-1 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm font-medium text-brand transition hover:bg-brand/10"
              >
                View details
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </>
          ) : (
            <a
              href="#leak-table"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black transition-all hover:bg-brand-light hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Fix these leaks
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
