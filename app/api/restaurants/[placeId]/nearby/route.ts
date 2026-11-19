import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PlacesApiError, distanceMeters, searchNearbyPlaces, type NearbyPlace } from "@/lib/places"
import { GeminiError, generateOutingPlan, type OutingCandidate } from "@/lib/gemini"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { apiError, unauthenticated, API_ERROR_CODES } from "@/lib/api-errors"

// This is the most expensive thing the app does (two Places calls plus
// a Gemini call), so it gets the longest cache window of anything we've
// built - a week, not a day.
const OUTING_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

// Lower than search's 20/hour on purpose - this route costs roughly
// 3x as much per real call (two Places calls plus a Gemini call).
const OUTING_RATE_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 }

const QuerySchema = z.object({
  name: z.string().min(1),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
})

interface OutingPick {
  id: string
  name: string
  rating: number
  distanceMeters: number
  why: string
}

interface OutingPlanResponse {
  summary: string
  thingsToDo: OutingPick[]
  moreToEat: OutingPick[]
}

function toCandidates(places: NearbyPlace[], origin: { lat: number; lng: number }): OutingCandidate[] {
  return places.map((p) => ({
    id: p.id,
    name: p.name,
    types: p.types,
    rating: p.rating,
    distanceMeters: distanceMeters(origin, p),
  }))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return unauthenticated()
  }

  const { placeId } = await params
  const { searchParams } = new URL(request.url)

  const parsedQuery = QuerySchema.safeParse({
    name: searchParams.get("name"),
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
  })

  if (!parsedQuery.success) {
    return apiError(API_ERROR_CODES.VALIDATION_ERROR, "Missing or invalid name/lat/lng")
  }

  const { name, lat, lng } = parsedQuery.data

  // Cache check - an optimization, not a dependency. If the DB read
  // fails, fall through to a live call rather than error out entirely.
  try {
    const cached = await prisma.nearbyOutingCache.findUnique({ where: { placeId } })
    if (cached && Date.now() - cached.fetchedAt.getTime() < OUTING_CACHE_TTL_MS) {
      return NextResponse.json({ plan: cached.plan as unknown as OutingPlanResponse, cached: true })
    }
  } catch (error) {
    console.error("Outing cache read failed, falling back to a live call:", error)
  }

  // Only rate-limit past this point - same reasoning as the search
  // route: a cache hit costs nothing and shouldn't count against a
  // limit meant to protect real spend.
  const rateLimit = await checkRateLimit(session.user.id, "nearby-outing", OUTING_RATE_LIMIT)
  if (!rateLimit.allowed) {
    return apiError(API_ERROR_CODES.RATE_LIMITED, "Too many outing plans requested - try again in a bit")
  }

  try {
    const [attractionPlaces, nearbyRestaurantPlaces] = await Promise.all([
      searchNearbyPlaces(lat, lng, ["tourist_attraction", "museum", "park"], { maxResultCount: 10 }),
      searchNearbyPlaces(lat, lng, ["restaurant", "cafe"], { maxResultCount: 10 }),
    ])

    const attractionCandidates = toCandidates(attractionPlaces, { lat, lng })
    // Don't suggest the restaurant someone is already looking at as
    // somewhere else nearby to eat.
    const restaurantCandidates = toCandidates(
      nearbyRestaurantPlaces.filter((p) => p.id !== placeId),
      { lat, lng }
    )

    const rawPlan = await generateOutingPlan(name, attractionCandidates, restaurantCandidates)

    const byId = new Map(
      [...attractionCandidates, ...restaurantCandidates].map((c) => [c.id, c])
    )
    const toPick = (pick: { placeId: string; why: string }): OutingPick | null => {
      const candidate = byId.get(pick.placeId)
      if (!candidate) return null
      return {
        id: candidate.id,
        name: candidate.name,
        rating: candidate.rating,
        distanceMeters: candidate.distanceMeters,
        why: pick.why,
      }
    }

    const plan: OutingPlanResponse = {
      summary: rawPlan.summary,
      thingsToDo: rawPlan.thingsToDo.map(toPick).filter((p): p is OutingPick => p !== null),
      moreToEat: rawPlan.moreToEat.map(toPick).filter((p): p is OutingPick => p !== null),
    }

    try {
      await prisma.nearbyOutingCache.upsert({
        where: { placeId },
        create: { placeId, plan: plan as unknown as object },
        update: { plan: plan as unknown as object, fetchedAt: new Date() },
      })
    } catch (error) {
      console.error("Outing cache write failed (still returns fine):", error)
    }

    return NextResponse.json({ plan, cached: false })
  } catch (error) {
    console.error(`GET /api/restaurants/${placeId}/nearby failed:`, error)
    const code =
      error instanceof PlacesApiError || error instanceof GeminiError
        ? API_ERROR_CODES.UPSTREAM_ERROR
        : API_ERROR_CODES.INTERNAL_ERROR
    return apiError(code, "Couldn't put together an outing plan right now")
  }
}
