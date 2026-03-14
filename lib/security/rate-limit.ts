import "server-only";
import { NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
}

function createRateLimiter(name: string, options: RateLimiterOptions) {
  const { limit, windowMs } = options;
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup of stale entries (every 5 minutes)
  let lastCleanup = Date.now();
  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 5 * 60 * 1000) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }

  return {
    check(
      req: Request,
      userId?: string
    ): NextResponse | null {
      cleanup();

      const key =
        userId ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const now = Date.now();
      const entry = store.get(key) || { timestamps: [] };

      // Remove timestamps outside the window
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

      if (entry.timestamps.length >= limit) {
        const oldestInWindow = entry.timestamps[0];
        const retryAfter = Math.ceil(
          (oldestInWindow + windowMs - now) / 1000
        );

        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      entry.timestamps.push(now);
      store.set(key, entry);

      return null;
    },
  };
}

/** 20 requests per 60 seconds — for AI generation endpoints */
export const aiRateLimiter = createRateLimiter("ai", {
  limit: 20,
  windowMs: 60 * 1000,
});

/** 30 requests per 60 seconds — for website fetching endpoints */
export const websiteRateLimiter = createRateLimiter("website", {
  limit: 30,
  windowMs: 60 * 1000,
});
