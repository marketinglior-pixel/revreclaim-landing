"use client";

import { useEffect, useRef, useState } from "react";
import { getVariant } from "@/lib/ab-testing";
import { trackEvent } from "@/lib/analytics";

/**
 * Client-side hook for A/B testing.
 * Assigns a variant on mount, fires an "ab_view" event once,
 * and provides a trackConversion helper.
 */
export function useExperiment(experimentName: string) {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const viewTracked = useRef(false);

  useEffect(() => {
    const v = getVariant(experimentName);
    setVariant(v);
    setIsLoading(false);

    if (v && !viewTracked.current) {
      viewTracked.current = true;
      trackEvent("ab_view", null, {
        experiment: experimentName,
        variant: v,
      }).catch(() => {});
    }
  }, [experimentName]);

  const trackConversion = (conversionType: string) => {
    if (!variant) return;
    trackEvent("ab_conversion", null, {
      experiment: experimentName,
      variant,
      conversionType,
    }).catch(() => {});
  };

  return { variant, isLoading, trackConversion };
}
