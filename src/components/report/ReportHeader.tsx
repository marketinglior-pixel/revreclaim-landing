"use client";

import Link from "next/link";

interface ReportHeaderProps {
  scannedAt: string;
}

export default function ReportHeader({ scannedAt }: ReportHeaderProps) {
  const date = new Date(scannedAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold text-white flex items-center gap-1"
          >
            <span className="text-[#10B981]">Rev</span>Reclaim
          </Link>
          <div className="hidden sm:block h-5 w-px bg-[#2A2A2A]" />
          <span className="hidden sm:block text-sm text-[#666]">
            Revenue Leak Report
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#666]">
            {formattedDate} at {formattedTime}
          </span>
          <Link
            href="/scan"
            className="px-3 py-1.5 text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-lg hover:bg-[#10B981]/20 transition"
          >
            Run New Scan
          </Link>
        </div>
      </div>
    </header>
  );
}
