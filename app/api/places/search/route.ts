import { NextRequest, NextResponse } from "next/server"
import { PlacesApiError, searchRestaurants } from "@/lib/places"
import { prisma } from "@/lib/prisma"
import type { Restaurant } from "@/components/yelpy/types"
import type { Prisma } from "@/lib/generated/prisma/client"

// Text Search results don't change minute to minute — cache them so two
// people (or one person hitting refresh) searching "Italian in San
// Francisco" within the same day doesn't bill Google twice.
const SEARCH_CACHE_TTL_MS = 24 * 60 * 60 * 1000

function cacheKeyFor(query: string, location: string): string {
  return `${query.trim().toLowerCase()}|${location.trim().toLowerCase()}`
}

async function readCache(key: string): Promise<Restaurant[] | null> {
  try {
    const cached = await prisma.cachedSearch.findUnique({ where: { key } })
    if (!cached) return null

    const age = Date.now() - cached.fetchedAt.getTime()
    if (age > SEARCH_CACHE_TTL_MS) return null

    return cached.results as unknown as Restaurant[]
  } catch (error) {
    // The cache is an optimization, not a dependency — if the database is
    // unreachable, fall back to calling Places directly instead of failing
    // the whole search.
    console.error("Cache read failed, falling back to a live search:", error)
    return null
  }
}

async function writeCache(key: string, results: Restaurant[]): Promise<void> {
  try {
    await prisma.cachedSearch.upsert({
      where: { key },
      create: { key, results: results as unknown as Prisma.InputJsonValue },
      update: { results: results as unknown as Prisma.InputJsonValue, fetchedAt: new Date() },
    })
  } catch (error) {
    console.error("Cache write failed (search still returns fine):", error)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")?.trim()
  const location = searchParams.get("location")?.trim() ?? ""

  if (!query) {
    return NextResponse.json(
      { error: "Missing required 'query' search param" },
      { status: 400 }
    )
  }

  const key = cacheKeyFor(query, location)

  const cached = await readCache(key)
  if (cached) {
    return NextResponse.json({ restaurants: cached, cached: true })
  }

  try {
    const restaurants = await searchRestaurants(query, location)
    await writeCache(key, restaurants)
    return NextResponse.json({ restaurants, cached: false })
  } catch (error) {
    console.error("GET /api/places/search failed:", error)
    const status = error instanceof PlacesApiError ? 502 : 500
    return NextResponse.json(
      { error: "Couldn't search restaurants right now" },
      { status }
    )
  }
}
