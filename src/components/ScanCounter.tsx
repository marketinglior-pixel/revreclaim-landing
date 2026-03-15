"use client";

import { useEffect, useState } from "react";

export function ScanCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalScans > 0) {
          setCount(data.totalScans);
        }
      })
      .catch(() => {
        // Silently fail — we'll show the static fallback
      });
  }, []);

  if (count === null) {
    // Show nothing while loading — avoid fabricated numbers
    return null;
  }

  return (
    <span className="text-white font-semibold">{count}+</span>
  );
}
