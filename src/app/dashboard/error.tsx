"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 bg-[#EF4444]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Error</h1>
        <p className="text-[#999] mb-8">
          Something went wrong loading your dashboard. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex justify-center px-6 py-3 border border-[#2A2A2A] hover:border-[#10B981]/30 text-white font-medium rounded-lg transition cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex justify-center px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-lg transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
