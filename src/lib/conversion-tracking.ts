/**
 * Client-side conversion tracking for GA4 + LinkedIn Insight Tag + Meta Pixel.
 *
 * Call these functions alongside the existing internal trackEvent() calls
 * to also fire events to external ad platforms for campaign optimisation.
 *
 * All functions are safe to call even if a platform is not configured —
 * they silently no-op when the global objects don't exist.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    lintrk?: (action: string, data: Record<string, unknown>) => void;
    fbq?: (...args: any[]) => void;
  }
}

// ─── GA4 helpers ──────────────────────────────────────────────────────────

function ga4Event(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

// ─── LinkedIn Insight Tag helpers ─────────────────────────────────────────
// LinkedIn uses conversion IDs created in Campaign Manager.
// Set these env vars to map events to LinkedIn conversion IDs:
//   NEXT_PUBLIC_LI_CONV_SCAN      — Scan completed conversion ID
//   NEXT_PUBLIC_LI_CONV_SIGNUP    — Signup conversion ID
//   NEXT_PUBLIC_LI_CONV_PURCHASE  — Purchase conversion ID
//   NEXT_PUBLIC_LI_CONV_LEAD      — Lead/newsletter conversion ID

const LI_CONV_SCAN = process.env.NEXT_PUBLIC_LI_CONV_SCAN;
const LI_CONV_SIGNUP = process.env.NEXT_PUBLIC_LI_CONV_SIGNUP;
const LI_CONV_PURCHASE = process.env.NEXT_PUBLIC_LI_CONV_PURCHASE;
const LI_CONV_LEAD = process.env.NEXT_PUBLIC_LI_CONV_LEAD;

function linkedInConversion(conversionId: string | undefined) {
  if (typeof window !== "undefined" && window.lintrk && conversionId) {
    window.lintrk("track", { conversion_id: conversionId });
  }
}

// ─── Meta Pixel helpers (kept for future use) ────────────────────────────

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
  linkedInConversion(LI_CONV_SCAN);
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
  linkedInConversion(LI_CONV_PURCHASE);
  metaEvent("Purchase", {
    content_name: plan,
    value,
    currency: "USD",
  });
}

/** User signed up (created account) */
export function trackSignup(method = "email") {
  ga4Event("sign_up", { method });
  linkedInConversion(LI_CONV_SIGNUP);
  metaEvent("Lead", { content_name: "signup" });
}

/** CTA click (generic, with location context) */
export function trackCTAClick(location: string, action: string) {
  ga4Event("cta_click", { location, action });
  metaCustomEvent("CTAClick", { location, action });
}

/** Newsletter signup */
export function trackNewsletterSignup() {
  ga4Event("generate_lead", { content: "newsletter" });
  linkedInConversion(LI_CONV_LEAD);
  metaEvent("Lead", { content_name: "newsletter" });
}
