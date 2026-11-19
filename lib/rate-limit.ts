import { prisma } from "@/lib/prisma"

interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
}

/**
 * Fixed-window rate limiting, backed by Postgres (see the schema comment
 * on RateLimit for why not in-memory). "Fixed window" means every
 * request within the same time bucket (e.g. the same hour) shares one
 * counter - simpler than a sliding window, at the cost of being able to
 * burst up to 2x the limit right at a window boundary. Fine for this
 * app's purpose, which is "stop a bug or abuse from running up a real
 * bill," not precise traffic shaping.
 *
 * `identifier` is normally a userId - every route this guards is already
 * behind a sign-in check, so we always have one.
 */
export async function checkRateLimit(
  identifier: string,
  route: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs)
  const key = `${identifier}:${route}:${windowStart.getTime()}`

  // The increment itself is atomic in Postgres (translates to
  // `count = count + 1`), so concurrent requests in the same window
  // can't race each other into under-counting.
  const row = await prisma.rateLimit.upsert({
    where: { key },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  })

  return {
    allowed: row.count <= limit,
    remaining: Math.max(0, limit - row.count),
    limit,
  }
}
