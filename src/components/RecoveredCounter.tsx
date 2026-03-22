"use client";

import { useEffect, useState } from "react";

/**
 * Shows real total MRR at risk found across all scans.
 * Returns null if amount is too low (< $10K), so parent can hide.
 */
export function RecoveredCounter() {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        const totalCents = data.totalRecoveredCents ?? 0;
        const totalDollars = Math.floor(totalCents / 100);
        const roundedK = Math.floor(totalDollars / 1000);
        setAmount(roundedK);
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  // Don't show if amount is too low to be meaningful
  if (amount === null || amount < 10) {
    return null;
  }

  return (
    <span className="font-bold text-white">
      ${amount.toLocaleString()}K+
    </span>
  );
}
