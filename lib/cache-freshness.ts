/**
 * Pure "is this cached thing still fresh?" check - pulled out of the
 * three places that were each writing this same comparison inline
 * (CachedSearch's 24h check, NearbyOutingCache's 7-day check), so it's
 * one thing to get right and one thing to unit test, instead of three
 * copies that could quietly drift apart.
 */
export function isFresh(fetchedAt: Date, ttlMs: number, now: number = Date.now()): boolean {
  return now - fetchedAt.getTime() < ttlMs
}
