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
    // Static fallback while loading or if fetch fails
    return (
      <span className="text-white font-semibold">7</span>
    );
  }

  return (
    <span className="text-white font-semibold">{count}+</span>
  );
}
