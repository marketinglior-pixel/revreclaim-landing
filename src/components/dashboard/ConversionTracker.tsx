"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackPurchase, trackSignup } from "@/lib/conversion-tracking";

/**
 * Fires one-time conversion events when users land on the dashboard
 * after completing checkout or signup.
 *
 * Detected via query params:
 *   ?upgraded=true  → Purchase event (from Polar checkout success_url)
 *   ?welcome=true   → Signup event  (from auth callback redirect)
 *
 * Uses sessionStorage to ensure events fire exactly once per session.
 */
export default function ConversionTracker({ plan }: { plan: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Purchase conversion
    if (searchParams.get("upgraded") === "true") {
      const key = "rr_purchase_tracked";
      if (!sessionStorage.getItem(key)) {
        const value = plan === "team" ? 79 : 29;
        trackPurchase(plan, value);
        sessionStorage.setItem(key, "1");
      }
    }

    // Signup conversion
    if (searchParams.get("welcome") === "true") {
      const key = "rr_signup_tracked";
      if (!sessionStorage.getItem(key)) {
        trackSignup();
        sessionStorage.setItem(key, "1");
      }
    }
  }, [searchParams, plan]);

  return null;
}
