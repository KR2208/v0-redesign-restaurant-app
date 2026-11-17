import { z } from "zod"
import type { Restaurant } from "@/components/yelpy/types"

/**
 * Field mask for Text Search (New).
 *
 * Keep this list deliberate — each field belongs to a billing tier
 * (Essentials / Pro / Enterprise), and the priciest field in the mask
 * decides what the whole call bills as. `rating` and `priceLevel` are
 * Enterprise-tier fields (1,000 free calls/month), everything else
 * here is Pro-tier (5,000 free calls/month). We need rating + price
 * for the UI, so we accept the Enterprise rate rather than drop them.
 *
 * https://developers.google.com/maps/documentation/places/web-service/data-fields
 */
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.priceLevel",
  "places.types",
].join(",")

const PRICE_LEVELS = [
  "PRICE_LEVEL_UNSPECIFIED",
  "PRICE_LEVEL_FREE",
  "PRICE_LEVEL_INEXPENSIVE",
  "PRICE_LEVEL_MODERATE",
  "PRICE_LEVEL_EXPENSIVE",
  "PRICE_LEVEL_VERY_EXPENSIVE",
] as const

// Places API (New) returns an enum string, not the 1-4 number our UI expects.
const PRICE_LEVEL_TO_NUMBER: Record<(typeof PRICE_LEVELS)[number], number> = {
  PRICE_LEVEL_UNSPECIFIED: 2,
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

// Never trust an external API's shape blindly — validate before anything
// downstream touches it.
const PlaceSchema = z.object({
  id: z.string(),
  displayName: z.object({ text: z.string() }),
  formattedAddress: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  rating: z.number().optional(),
  priceLevel: z.enum(PRICE_LEVELS).optional(),
  types: z.array(z.string()).optional(),
})

// Same places[] shape for both Text Search and Nearby Search responses.
const PlacesResponseSchema = z.object({
  places: z.array(PlaceSchema).default([]),
})

function toRestaurant(place: z.infer<typeof PlaceSchema>): Restaurant {
  return {
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress ?? "Address unavailable",
    rating: place.rating ?? 0,
    priceLevel: place.priceLevel ? PRICE_LEVEL_TO_NUMBER[place.priceLevel] : 2,
    types: place.types ?? [],
    lat: place.location.latitude,
    lng: place.location.longitude,
  }
}

export class PlacesApiError extends Error {}

/**
 * Text Search (New) — searches by a free-text query like
 * "Italian restaurants in San Francisco".
 *
 * Server-only: reads GOOGLE_PLACES_API_KEY directly, never pass this
 * key to the client.
 */
export async function searchRestaurants(
  query: string,
  location: string
): Promise<Restaurant[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    throw new PlacesApiError("GOOGLE_PLACES_API_KEY is not set on the server")
  }

  const textQuery = location ? `${query} restaurants in ${location}` : `${query} restaurants`

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery }),
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new PlacesApiError(`Places API responded ${response.status}: ${body}`)
  }

  const json = await response.json()
  const parsed = PlacesResponseSchema.safeParse(json)

  if (!parsed.success) {
    console.error("Places API response failed validation:", parsed.error.flatten())
    throw new PlacesApiError("Places API returned an unexpected response shape")
  }

  return parsed.data.places.map(toRestaurant)
}

// Same shape as Restaurant — a nearby attraction or a nearby restaurant
// is, data-wise, just another place. Named separately so Sheet 06's code
// reads clearly even though it's the identical type.
export type NearbyPlace = Restaurant

/**
 * Nearby Search (New) — places within a radius of a point, filtered by
 * type. Used for both of Sheet 06's categories ("nearby to explore" with
 * tourist_attraction/museum/park, "more to eat nearby" with restaurant)
 * - same endpoint, different includedTypes.
 */
export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  includedTypes: string[],
  options: { radiusMeters?: number; maxResultCount?: number } = {}
): Promise<NearbyPlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    throw new PlacesApiError("GOOGLE_PLACES_API_KEY is not set on the server")
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: options.maxResultCount ?? 10,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: options.radiusMeters ?? 2000,
        },
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new PlacesApiError(`Places API responded ${response.status}: ${body}`)
  }

  const json = await response.json()
  const parsed = PlacesResponseSchema.safeParse(json)

  if (!parsed.success) {
    console.error("Places API nearby response failed validation:", parsed.error.flatten())
    throw new PlacesApiError("Places API returned an unexpected response shape")
  }

  return parsed.data.places.map(toRestaurant)
}

/**
 * Real walking-ish distance between two points, in meters (Haversine
 * formula over the Earth's surface - not an actual walking route, but
 * close enough to sort "steps away" from "worth the trip"). We compute
 * this ourselves rather than asking Gemini to estimate it from names and
 * addresses - that's exactly the kind of thing a model can get
 * confidently wrong.
 */
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * R * Math.asin(Math.sqrt(h))
}
