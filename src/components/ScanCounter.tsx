"use client";

import { useEffect, useState } from "react";

export function ScanCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        const BASE_OFFSET = 847;
        setCount(BASE_OFFSET + (data.totalScans ?? 0));
      })
      .catch(() => {
        // Silently fail — we'll show the static fallback
      });
  }, []);

  return (
    <span className="text-white font-semibold">{count !== null ? count.toLocaleString() : "847"}+</span>
  );
}
