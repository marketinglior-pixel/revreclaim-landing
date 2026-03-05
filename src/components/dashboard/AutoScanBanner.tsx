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
    <div className="rounded-xl border border-[#2A2A2A] border-dashed bg-[#111] px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            Enable weekly auto-scans
          </p>
          <p className="text-xs text-[#999]">
            Get a fresh report every week — catch new leaks before they add up.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/settings"
        className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black text-xs font-bold rounded-lg transition"
      >
        Set Up
      </Link>
    </div>
  );
}
