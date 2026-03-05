"use client";

import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

interface RecoveryBannerProps {
  recoveryPotential: number; // in cents
}

export default function RecoveryBanner({ recoveryPotential }: RecoveryBannerProps) {
  const dollars = Math.round(recoveryPotential / 100);
  const animatedDollars = useAnimatedNumber(dollars, 1500, 200);

  if (recoveryPotential <= 0) return null;

  return (
    <div className="rounded-2xl border border-[#10B981]/20 bg-gradient-to-r from-[#10B981]/10 via-[#10B981]/5 to-transparent p-6 md:p-8 glow-green animate-fade-in-up">
      <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div>
          <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
            <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
              Recoverable Revenue Found
            </span>
          </div>
          <p className="text-3xl font-bold text-white md:text-4xl">
            ${animatedDollars.toLocaleString()}
            <span className="text-lg font-medium text-[#10B981]">/year</span>
          </p>
          <p className="mt-1 text-sm text-[#999]">
            This is money you&apos;re losing right now. Fix these leaks to recover it.
          </p>
        </div>
        <a
          href="#leak-table"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#34D399] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] md:mt-0"
        >
          Fix these leaks
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
