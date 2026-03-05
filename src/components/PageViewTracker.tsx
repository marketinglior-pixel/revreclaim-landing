"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fire-and-forget page view event on mount.
 * Renders nothing — drop it anywhere in a page component.
 */
export function PageViewTracker({ page }: { page: string }) {
  useEffect(() => {
    trackEvent("page_view", null, { page }).catch(() => {});
  }, [page]);

  return null;
}
