import { describe, it, expect } from "vitest"
import { isFresh } from "./cache-freshness"

describe("isFresh", () => {
  const ttl = 1000 * 60 * 60 // 1 hour

  it("is fresh right when fetched", () => {
    const now = Date.now()
    expect(isFresh(new Date(now), ttl, now)).toBe(true)
  })

  it("is fresh just under the TTL", () => {
    const now = Date.now()
    const fetchedAt = new Date(now - (ttl - 1))
    expect(isFresh(fetchedAt, ttl, now)).toBe(true)
  })

  it("is stale exactly at the TTL boundary", () => {
    const now = Date.now()
    const fetchedAt = new Date(now - ttl)
    expect(isFresh(fetchedAt, ttl, now)).toBe(false)
  })

  it("is stale well past the TTL", () => {
    const now = Date.now()
    const fetchedAt = new Date(now - ttl * 10)
    expect(isFresh(fetchedAt, ttl, now)).toBe(false)
  })
})
