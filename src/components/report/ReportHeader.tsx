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
            className="text-lg font-bold text-white flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            RevReclaim
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
