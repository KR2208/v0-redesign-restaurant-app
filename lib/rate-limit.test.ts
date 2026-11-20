import { describe, it, expect, vi, beforeEach } from "vitest"
import { checkRateLimit } from "./rate-limit"

// A tiny in-memory stand-in for the one Prisma call checkRateLimit makes,
// replicating real upsert semantics (create at 1, increment on repeat)
// so the test exercises the actual window/key/limit logic without a
// real database. vi.mock calls are hoisted above imports by Vitest
// automatically, so this still mocks the module the static import above
// resolves to - no need for a dynamic import workaround.
const store = new Map<string, number>()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimit: {
      upsert: vi.fn(async ({ where, create }: { where: { key: string }; create: { windowStart: Date } }) => {
        const current = store.get(where.key) ?? 0
        const count = current + 1
        store.set(where.key, count)
        return { key: where.key, count, windowStart: create.windowStart }
      }),
    },
  },
}))

describe("checkRateLimit", () => {
  beforeEach(() => {
    store.clear()
  })

  it("allows requests up to the limit", async () => {
    const limit = 3
    const windowMs = 60_000

    const first = await checkRateLimit("user-1", "test-route", { limit, windowMs })
    const second = await checkRateLimit("user-1", "test-route", { limit, windowMs })
    const third = await checkRateLimit("user-1", "test-route", { limit, windowMs })

    expect([first.allowed, second.allowed, third.allowed]).toEqual([true, true, true])
    expect(third.remaining).toBe(0)
  })

  it("blocks the request right after the limit is reached", async () => {
    const limit = 2
    const windowMs = 60_000

    await checkRateLimit("user-2", "test-route", { limit, windowMs })
    await checkRateLimit("user-2", "test-route", { limit, windowMs })
    const third = await checkRateLimit("user-2", "test-route", { limit, windowMs })

    expect(third.allowed).toBe(false)
    expect(third.remaining).toBe(0)
  })

  it("keeps separate counters per user", async () => {
    const limit = 1
    const windowMs = 60_000

    const userA = await checkRateLimit("user-a", "test-route", { limit, windowMs })
    const userB = await checkRateLimit("user-b", "test-route", { limit, windowMs })

    expect(userA.allowed).toBe(true)
    expect(userB.allowed).toBe(true)
  })

  it("keeps separate counters per route for the same user", async () => {
    const limit = 1
    const windowMs = 60_000

    const search = await checkRateLimit("user-3", "places-search", { limit, windowMs })
    const outing = await checkRateLimit("user-3", "nearby-outing", { limit, windowMs })

    expect(search.allowed).toBe(true)
    expect(outing.allowed).toBe(true)
  })
})
