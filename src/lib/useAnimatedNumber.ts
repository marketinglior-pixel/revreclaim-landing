"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Animates a number from 0 to `target` using requestAnimationFrame.
 * Cubic ease-out curve for a satisfying deceleration effect.
 * Respects prefers-reduced-motion — returns target immediately when enabled.
 *
 * @param target  - The final value to animate to
 * @param duration - Animation duration in ms (default 1200)
 * @param delay   - Delay before animation starts in ms (default 0)
 * @returns The current animated integer value
 */
export function useAnimatedNumber(
  target: number,
  duration = 1200,
  delay = 0
): number {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(prefersReducedMotion ? target : 0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    if (target === 0) {
      setValue(0);
      return;
    }

    // Ease-out cubic: 1 - (1 - t)^3
    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed < delay) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min((elapsed - delay) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = Math.round(easedProgress * target);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, delay, prefersReducedMotion]);

  return value;
}
