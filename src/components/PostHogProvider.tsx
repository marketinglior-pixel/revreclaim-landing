"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Initialize PostHog once on the client.
 * - Session recording enabled with input masking (API keys, passwords)
 * - Autocapture for clicks, page views, and form submissions
 * - Respects Do-Not-Track browser setting
 */
if (typeof window !== "undefined" && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // We capture manually to include route changes
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: true, // Never record API keys, passwords, etc.
      maskTextSelector: "[data-ph-mask]", // Opt-in additional masking
    },
    persistence: "localStorage+cookie",
    respect_dnt: true,
  });
}

/**
 * Track Next.js route changes as PostHog pageviews.
 * Wrapped in Suspense because useSearchParams() requires it.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = globalThis.location.origin + pathname;
      const search = searchParams?.toString();
      if (search) url += `?${search}`;
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export default function PostHogProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // If PostHog key is not set, render children without the provider
  if (!POSTHOG_KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
