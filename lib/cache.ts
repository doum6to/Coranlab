import { Redis } from "@upstash/redis";

/**
 * Shared Redis client — automatically enabled when both env vars are set.
 * Falls back to a no-op in-memory cache when not configured, so the app
 * still runs locally without Upstash.
 *
 * Use this for cross-instance cache (unstable_cache only shares within
 * a single Vercel serverless container). Ideal for:
 *   - leaderboard snapshots (shared by all users)
 *   - global course structure
 *   - rate limiting
 */

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback (per-container) so local dev works without Upstash
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (redis) {
    return (await redis.get<T>(key)) ?? null;
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
};

export const cacheSet = async <T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> => {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const cacheDelete = async (key: string): Promise<void> => {
  if (redis) {
    await redis.del(key);
    return;
  }
  memoryCache.delete(key);
};

/**
 * Memoize an async function across requests and across Vercel instances
 * (when Upstash is configured). Similar to unstable_cache but uses Redis
 * for shared storage.
 */
export const cached = <Args extends unknown[], Ret>(
  fn: (...args: Args) => Promise<Ret>,
  opts: {
    key: (...args: Args) => string;
    ttlSeconds: number;
  }
) => {
  return async (...args: Args): Promise<Ret> => {
    const key = opts.key(...args);
    const hit = await cacheGet<Ret>(key);
    if (hit !== null) return hit;
    const value = await fn(...args);
    await cacheSet(key, value, opts.ttlSeconds);
    return value;
  };
};

export const isRedisEnabled = () => hasUpstash;
