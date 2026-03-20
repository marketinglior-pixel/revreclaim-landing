"use client";

import { useEffect, useState } from "react";

/**
 * Dynamic counter showing total MRR at risk found across all scans.
 * Base offset represents the amount found before we started tracking dynamically.
 * New scans add their mrrAtRisk to this total automatically.
 */
export function RecoveredCounter() {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        // Base: $127,000 (127000 * 100 = 12700000 cents) — amount found before dynamic tracking
        const BASE_OFFSET_CENTS = 12_700_000;
        const totalCents = BASE_OFFSET_CENTS + (data.totalRecoveredCents ?? 0);
        // Convert to dollars and round to nearest thousand
        const totalDollars = Math.floor(totalCents / 100);
        const roundedK = Math.floor(totalDollars / 1000);
        setAmount(roundedK);
      })
      .catch(() => {
        // Silently fail — show static fallback
      });
  }, []);

  return (
    <span className="font-bold text-white">
      ${amount !== null ? `${amount.toLocaleString()}K` : "127K"}+
    </span>
  );
}
