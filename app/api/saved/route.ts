import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiError, unauthenticated, API_ERROR_CODES } from "@/lib/api-errors"
import type { Restaurant } from "@/components/yelpy/types"

// Same shape as the Restaurant the frontend already works with - the
// client never needs to know this gets stored under a different field
// name (placeId) than what it calls it (id).
const SaveRestaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  rating: z.number(),
  priceLevel: z.number(),
  types: z.array(z.string()),
  lat: z.number(),
  lng: z.number(),
})

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return unauthenticated()
  }

  const rows = await prisma.savedRestaurant.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const saved: Restaurant[] = rows.map((row) => ({
    id: row.placeId,
    name: row.name,
    address: row.address,
    rating: row.rating,
    priceLevel: row.priceLevel,
    types: row.types,
    lat: row.lat,
    lng: row.lng,
  }))

  return NextResponse.json({ saved })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return unauthenticated()
  }

  const body = await request.json()
  const parsed = SaveRestaurantSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(API_ERROR_CODES.VALIDATION_ERROR, "Invalid restaurant data")
  }

  const { id: placeId, ...rest } = parsed.data

  // Upsert, not create - saving something already saved is a no-op,
  // not a duplicate row or a 500 from the unique constraint.
  await prisma.savedRestaurant.upsert({
    where: { userId_placeId: { userId: session.user.id, placeId } },
    create: { userId: session.user.id, placeId, ...rest },
    update: {},
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
