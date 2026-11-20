import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { searchRestaurants, searchNearbyPlaces, distanceMeters, PlacesApiError } from "./places"

describe("distanceMeters", () => {
  it("is zero for the same point", () => {
    expect(distanceMeters({ lat: 37.8, lng: -122.4 }, { lat: 37.8, lng: -122.4 })).toBe(0)
  })

  it("matches the well-known ~111.32km per degree of latitude", () => {
    const meters = distanceMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })
    expect(meters).toBeGreaterThan(111_000)
    expect(meters).toBeLessThan(111_700)
  })
})

describe("searchRestaurants / searchNearbyPlaces", () => {
  const originalFetch = global.fetch
  const originalKey = process.env.GOOGLE_PLACES_API_KEY

  beforeEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = "test-key"
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.GOOGLE_PLACES_API_KEY = originalKey
  })

  it("throws before ever calling fetch if the API key is missing", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY
    const fetchSpy = vi.fn()
    global.fetch = fetchSpy as unknown as typeof fetch

    await expect(searchRestaurants("pizza", "SF")).rejects.toThrow(PlacesApiError)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("maps a valid response, converting the priceLevel enum to a number", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          {
            id: "place-1",
            displayName: { text: "Tony's Pizza" },
            formattedAddress: "123 Main St",
            location: { latitude: 37.8, longitude: -122.4 },
            rating: 4.5,
            priceLevel: "PRICE_LEVEL_EXPENSIVE",
            types: ["pizza_restaurant"],
          },
        ],
      }),
    }) as unknown as typeof fetch

    const results = await searchRestaurants("pizza", "SF")

    expect(results).toEqual([
      {
        id: "place-1",
        name: "Tony's Pizza",
        address: "123 Main St",
        rating: 4.5,
        priceLevel: 3, // PRICE_LEVEL_EXPENSIVE -> 3
        types: ["pizza_restaurant"],
        lat: 37.8,
        lng: -122.4,
      },
    ])
  })

  it("defaults missing optional fields instead of crashing", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        places: [
          {
            id: "place-2",
            displayName: { text: "Mystery Diner" },
            location: { latitude: 1, longitude: 2 },
            // no formattedAddress, rating, priceLevel, or types at all
          },
        ],
      }),
    }) as unknown as typeof fetch

    const results = await searchRestaurants("diner", "")

    expect(results[0]).toEqual({
      id: "place-2",
      name: "Mystery Diner",
      address: "Address unavailable",
      rating: 0,
      priceLevel: 2,
      types: [],
      lat: 1,
      lng: 2,
    })
  })

  it("throws PlacesApiError when Google responds with a non-ok status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "PERMISSION_DENIED",
    }) as unknown as typeof fetch

    await expect(searchRestaurants("pizza", "SF")).rejects.toThrow(PlacesApiError)
  })

  it("throws PlacesApiError when the response doesn't match the expected shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ places: [{ totally: "not a real place" }] }),
    }) as unknown as typeof fetch

    await expect(searchRestaurants("pizza", "SF")).rejects.toThrow(PlacesApiError)
  })

  it("searchNearbyPlaces sends includedTypes and a location circle in the request body", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ places: [] }),
    })
    global.fetch = fetchSpy as unknown as typeof fetch

    await searchNearbyPlaces(37.8, -122.4, ["museum", "park"], { radiusMeters: 500 })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe("https://places.googleapis.com/v1/places:searchNearby")
    const body = JSON.parse(options.body)
    expect(body.includedTypes).toEqual(["museum", "park"])
    expect(body.locationRestriction.circle).toEqual({
      center: { latitude: 37.8, longitude: -122.4 },
      radius: 500,
    })
  })
})
