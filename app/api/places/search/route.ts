import { NextRequest, NextResponse } from "next/server"
import { PlacesApiError, searchRestaurants } from "@/lib/places"

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

  try {
    const restaurants = await searchRestaurants(query, location)
    return NextResponse.json({ restaurants })
  } catch (error) {
    console.error("GET /api/places/search failed:", error)
    const status = error instanceof PlacesApiError ? 502 : 500
    return NextResponse.json(
      { error: "Couldn't search restaurants right now" },
      { status }
    )
  }
}
