/**
 * UTM parameter capture and persistence.
 *
 * On first visit, extracts UTM parameters from the URL and stores them
 * in sessionStorage. These are later sent with analytics events and
 * attached to conversion tracking so we can attribute campaigns.
 *
 * Supported parameters:
 *   utm_source, utm_medium, utm_campaign, utm_content, utm_term
 *
 * Also captures:
 *   ref (referral code), gclid (Google Ads click ID), fbclid (Meta click ID)
 */

const UTM_STORAGE_KEY = "rr_utm";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  captured_at?: string;
}

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
  "gclid",
  "fbclid",
] as const;

/**
 * Capture UTM params from the current URL and persist to sessionStorage.
 * Only captures on first visit — does not overwrite existing params.
 * Call this once in a top-level client component (e.g., layout or PageViewTracker).
 */
export function captureUTMParams(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite existing attribution
  try {
    if (sessionStorage.getItem(UTM_STORAGE_KEY)) return;
  } catch {
    return; // sessionStorage unavailable
  }

  const url = new URL(window.location.href);
  const params: UTMParams = {};
  let hasAny = false;

  for (const key of TRACKED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) {
      params[key] = value;
      hasAny = true;
    }
  }

  // Always capture landing page for attribution
  params.landing_page = window.location.pathname;
  params.captured_at = new Date().toISOString();

  // Also capture document.referrer if no UTM params (organic/direct)
  if (!hasAny && document.referrer) {
    try {
      const referrerHost = new URL(document.referrer).hostname;
      // Don't store self-referrals
      if (referrerHost !== window.location.hostname) {
        params.utm_source = referrerHost;
        params.utm_medium = "referral";
        hasAny = true;
      }
    } catch {
      // Invalid referrer URL — ignore
    }
  }

  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // sessionStorage full or unavailable
  }
}

/**
 * Get the stored UTM params. Returns null if none captured.
 */
export function getUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UTMParams) : null;
  } catch {
    return null;
  }
}
