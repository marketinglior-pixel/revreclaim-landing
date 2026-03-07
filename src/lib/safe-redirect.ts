/**
 * Validate that a redirect URL is safe (relative path, no protocol injection).
 * Prevents open redirect attacks via malicious redirect parameters.
 *
 * @param url    The redirect URL to validate (from query params)
 * @param fallback  Safe default if URL is invalid (default: "/dashboard")
 * @returns      The validated redirect path or the fallback
 */
export function safeRedirect(
  url: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!url) return fallback;

  // Must start with exactly one / (block protocol-relative //evil.com)
  if (!url.startsWith("/") || url.startsWith("//")) return fallback;

  // Block javascript: and data: schemes (case-insensitive)
  const lower = url.toLowerCase();
  if (lower.includes("javascript:")) return fallback;
  if (lower.includes("data:")) return fallback;

  // Block any embedded protocol (e.g., /foo\nhttps://evil.com)
  if (url.includes("://")) return fallback;

  return url;
}
