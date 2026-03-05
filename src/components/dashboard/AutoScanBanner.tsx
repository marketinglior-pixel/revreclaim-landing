"use client";

import Link from "next/link";

export default function AutoScanBanner({
  hasConfig,
  isActive,
  nextScanAt,
  frequency,
}: {
  hasConfig: boolean;
  isActive: boolean;
  nextScanAt: string | null;
  frequency: string;
}) {
  if (hasConfig && isActive) {
    const nextDate = nextScanAt ? new Date(nextScanAt) : null;
    return (
      <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <div>
            <p className="text-sm font-medium text-white">
              Auto-scan is active
            </p>
            <p className="text-xs text-[#999]">
              {frequency === "weekly" ? "Weekly" : frequency === "daily" ? "Daily" : "Monthly"} scans
              {nextDate && (
                <>
                  {" "}· Next scan: {nextDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-xs text-[#10B981] hover:text-[#34D399] transition font-medium"
        >
          Manage
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            You&apos;re checking manually. Leaks happen between checks.
          </p>
          <p className="text-xs text-[#999]">
            Unlock weekly auto-scans &mdash; catch leaks before they cost you.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/settings"
        className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black text-xs font-bold rounded-lg transition whitespace-nowrap"
      >
        Enable Auto-Scans &rarr;
      </Link>
    </div>
  );
}
