/**
 * Simple in-memory rate limiter for serverless.
 *
 * Works per-instance (each cold start resets). For stronger guarantees
 * upgrade to Upstash Redis: https://upstash.com/docs/redis/sdks/ratelimit-ts
 *
 * Still effective because:
 * - Vercel reuses warm instances for many requests
 * - Blocks burst abuse within a warm window
 * - Zero external dependencies
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Auto-cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Unique name for this limiter (e.g., "scan", "subscribe") */
  name: string;
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  if (!stores.has(config.name)) {
    stores.set(config.name, new Map());
  }
  const store = stores.get(config.name)!;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — reset
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfterSeconds: 0,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Limit exceeded
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
    };
  }

  // Increment
  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Extract client IP from request headers.
 * Works on Vercel (x-forwarded-for) and locally.
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
