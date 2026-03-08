/**
 * Rate limiter with Upstash Redis support (production) and
 * in-memory fallback (development / when Redis is not configured).
 *
 * Redis-backed limiting is distributed across all Vercel instances and
 * survives cold starts. The in-memory fallback still blocks burst abuse
 * within a single warm instance.
 *
 * Upstash setup: https://upstash.com/docs/redis/sdks/ratelimit-ts
 *   Env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createLogger } from "@/lib/logger";

const log = createLogger("RATE_LIMIT");

// ---------------------------------------------------------------------------
// Types (unchanged — all callers use these)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Upstash Redis rate limiter (lazy-initialised, one Ratelimit per config name)
// ---------------------------------------------------------------------------

let redis: Redis | null = null;
const redisLimiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function getRedisLimiter(config: RateLimitConfig): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const cacheKey = `${config.name}:${config.maxRequests}:${config.windowSeconds}`;
  if (!redisLimiters.has(cacheKey)) {
    redisLimiters.set(
      cacheKey,
      new Ratelimit({
        redis: r,
        limiter: Ratelimit.slidingWindow(
          config.maxRequests,
          `${config.windowSeconds} s`
        ),
        prefix: `rl:${config.name}`,
        analytics: true,
      })
    );
  }
  return redisLimiters.get(cacheKey)!;
}

// ---------------------------------------------------------------------------
// In-memory fallback (original implementation)
// ---------------------------------------------------------------------------

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

function inMemoryRateLimit(
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
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfterSeconds: 0,
    };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    retryAfterSeconds: 0,
  };
}

// ---------------------------------------------------------------------------
// Public API  — now async (Redis calls are async)
// ---------------------------------------------------------------------------

/**
 * Rate-limit a request. Uses Upstash Redis when configured,
 * otherwise falls back to in-memory limiting.
 */
export async function rateLimit(
  config: RateLimitConfig,
  key: string
): Promise<RateLimitResult> {
  const limiter = getRedisLimiter(config);

  if (limiter) {
    try {
      const { success, remaining, reset } = await limiter.limit(key);
      return {
        allowed: success,
        remaining,
        retryAfterSeconds: success
          ? 0
          : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
      };
    } catch (err) {
      // Redis failure — fall back to in-memory so we never block legitimate users
      log.error(
        "Redis error, falling back to in-memory:",
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  return inMemoryRateLimit(config, key);
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
