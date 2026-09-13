import "server-only";

import { headers } from "next/headers";

/**
 * Best-effort in-memory rate limiter. It lives in the Node process's memory,
 * so it resets on redeploy/restart and is NOT shared across multiple
 * serverless instances — on Vercel that means a determined attacker spread
 * across instances can exceed these limits. It still stops the common case
 * (a single script hammering one endpoint) and costs nothing to run.
 *
 * For guaranteed protection under real traffic, replace this with a shared
 * store such as Upstash Redis (Vercel's free-tier integration) — the
 * `checkRateLimit` call signature below is designed to be a drop-in swap.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map never grows unbounded between requests.
function pruneExpired(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP for rate-limit keying in Server Actions (which don't
 * receive a Request object). Trusts `x-forwarded-for` / `x-real-ip`, which is
 * fine behind Vercel's proxy but is attacker-controllable input on a
 * self-hosted deployment without a trusted reverse proxy in front of it.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headerList.get("x-real-ip") ?? "unknown";
}

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number, message = "Too many attempts. Please try again shortly.") {
    super(message);
    this.name = "RateLimitError";
  }
}
