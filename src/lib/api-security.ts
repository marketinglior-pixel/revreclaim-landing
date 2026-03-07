import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Validate that the request Origin matches the server Host.
 * Prevents CSRF attacks from cross-origin pages.
 *
 * Requests without an Origin header (same-origin browser requests, curl, etc.)
 * are allowed — browsers always send Origin on cross-origin POST/DELETE.
 */
export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  // No Origin header = same-origin request (browser) or non-browser client
  if (!origin) return true;
  if (!host) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * Validate that the request Content-Type is application/json.
 * Prevents unexpected parsing errors from non-JSON payloads.
 */
export function validateContentType(req: Request): boolean {
  const ct = req.headers.get("content-type");
  return ct?.includes("application/json") ?? false;
}

/**
 * Combined guard for POST/DELETE API routes.
 * Returns a NextResponse error if validation fails, or null if OK.
 *
 * Usage:
 * ```ts
 * const guard = guardMutation(req);
 * if (guard) return guard;
 * ```
 */
export function guardMutation(req: Request): NextResponse | null {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (req.method !== "DELETE" && !validateContentType(req)) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Verify cron job secret using timing-safe comparison.
 * Prevents timing attacks that could leak the secret value.
 */
export function verifyCronSecret(authHeader: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !authHeader) return false;

  const expected = `Bearer ${cronSecret}`;

  // timingSafeEqual requires equal-length buffers
  if (authHeader.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
  } catch {
    return false;
  }
}
