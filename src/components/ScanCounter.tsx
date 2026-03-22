"use client";

import { useEffect, useState } from "react";

/**
 * Shows real scan count from the API. Returns null if count is too low
 * to display (< 50), so parent components can hide the counter entirely.
 */
export function ScanCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        const realCount = data.totalScans ?? 0;
        setCount(realCount);
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  // Don't show if count is too low to be meaningful
  if (count === null || count < 50) {
    return null;
  }

  return (
    <span className="text-white font-semibold">{count.toLocaleString()}</span>
  );
}
