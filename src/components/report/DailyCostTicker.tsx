"use client";

import { useState, useEffect } from "react";

interface DailyCostTickerProps {
  mrrAtRisk: number; // in cents
}

export default function DailyCostTicker({ mrrAtRisk }: DailyCostTickerProps) {
  const [secondsOnPage, setSecondsOnPage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsOnPage((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyLossDollars = Math.round(mrrAtRisk / 100 / 30);
  const costPerSecond = dailyLossDollars / 86400;
  const costSinceOpen = (costPerSecond * secondsOnPage).toFixed(2);

  if (dailyLossDollars <= 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm">
      <svg className="h-4 w-4 shrink-0 text-danger animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-text-muted">
        Every day these leaks stay open:{" "}
        <span className="font-bold text-danger">-${dailyLossDollars.toLocaleString()}/day</span>
        <span className="mx-2 text-text-dim">·</span>
        Cost since opening this report:{" "}
        <span className="font-bold text-danger animate-pulse">${costSinceOpen}</span>
      </span>
    </div>
  );
}
