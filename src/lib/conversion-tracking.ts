/**
 * Client-side conversion tracking for GA4 + Meta Pixel.
 *
 * Call these functions alongside the existing internal trackEvent() calls
 * to also fire events to Google Analytics 4 and Meta Pixel for ad optimisation.
 *
 * All functions are safe to call even if GA4/Meta are not configured —
 * they silently no-op when the global objects don't exist.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

// ─── GA4 helpers ──────────────────────────────────────────────────────────

function ga4Event(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

// ─── Meta Pixel helpers ──────────────────────────────────────────────────

function metaEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, params);
  }
}

function metaCustomEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", name, params);
  }
}

// ─── Public conversion events ────────────────────────────────────────────

/** User initiated a scan (entered API key and submitted) */
export function trackScanStarted(platform: string) {
  ga4Event("scan_started", { platform });
  metaCustomEvent("ScanStarted", { platform });
}

/** Scan completed — the main value moment */
export function trackScanCompleted(leaksFound: number, mrrAtRisk: number) {
  ga4Event("scan_completed", {
    leaks_found: leaksFound,
    mrr_at_risk: mrrAtRisk,
    value: mrrAtRisk,
    currency: "USD",
  });
  metaEvent("CompleteRegistration", {
    content_name: "scan",
    value: mrrAtRisk,
    currency: "USD",
  });
}

/** User clicked checkout (initiated upgrade flow) */
export function trackCheckoutStarted(plan: string, value: number) {
  ga4Event("begin_checkout", {
    currency: "USD",
    value,
    items: [{ item_name: plan }],
  });
  metaEvent("InitiateCheckout", {
    content_name: plan,
    value,
    currency: "USD",
  });
}

/** Subscription confirmed (paid) — the money event */
export function trackPurchase(plan: string, value: number) {
  ga4Event("purchase", {
    currency: "USD",
    value,
    transaction_id: `${plan}_${Date.now()}`,
    items: [{ item_name: plan }],
  });
  metaEvent("Purchase", {
    content_name: plan,
    value,
    currency: "USD",
  });
}

/** User signed up (created account) */
export function trackSignup(method = "email") {
  ga4Event("sign_up", { method });
  metaEvent("Lead", { content_name: "signup" });
}

/** CTA click (generic, with location context) */
export function trackCTAClick(location: string, action: string) {
  ga4Event("cta_click", { location, action });
  // Meta: no standard event, using custom
  metaCustomEvent("CTAClick", { location, action });
}

/** Newsletter signup */
export function trackNewsletterSignup() {
  ga4Event("generate_lead", { content: "newsletter" });
  metaEvent("Lead", { content_name: "newsletter" });
}
