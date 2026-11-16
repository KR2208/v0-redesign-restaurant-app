"use client"

import { useEffect, useRef, useState } from "react"
import { Sidebar } from "@/components/yelpy/sidebar"
import { MapView } from "@/components/yelpy/map-view"
import { Restaurant } from "@/components/yelpy/types"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

// TODO(sheet-05): saved restaurants are still local-only mock state.
// This goes away once saves are persisted per-user in Postgres.
const mockSaved: Restaurant[] = [
  {
    id: "1",
    name: "Tony's Pizza Napoletana",
    address: "1570 Stockton St, San Francisco, CA 94133, USA",
    rating: 4.5,
    priceLevel: 2,
    types: ["pizza restaurant", "italian restaurant"],
    lat: 37.8003,
    lng: -122.4091,
  },
  {
    id: "4",
    name: "Copper Chimney Indian Restaurant",
    address: "489a 3rd St, San Francisco, CA 94107, USA",
    rating: 4.7,
    priceLevel: 2,
    types: ["indian restaurant"],
    lat: 37.7825,
    lng: -122.3955,
  },
]

export default function YelpyApp() {
  const [results, setResults] = useState<Restaurant[]>([])
  const [saved, setSaved] = useState<Restaurant[]>(mockSaved)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [searchQuery, setSearchQuery] = useState("Italian")
  const [location, setLocation] = useState("San Francisco")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  // Guards against React Strict Mode's dev-only double-invoke of the
  // mount effect below. A ref survives that fake unmount/remount, so the
  // second invocation sees `true` and skips — without this, the very
  // first search on every page load fired two real (billable) Places API
  // calls instead of one, racing each other before either could write to
  // the cache. Production builds don't double-invoke at all; this guard
  // is purely a dev-mode safety net.
  const hasSearchedOnMount = useRef(false)

  const handleSearch = async (query: string, loc: string) => {
    setSearchQuery(query)
    setLocation(loc)
    setIsSearching(true)
    setSearchError(null)

    try {
      const params = new URLSearchParams({ query, location: loc })
      const response = await fetch(`/api/places/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed")
      }

      setResults(data.restaurants)
    } catch (error) {
      console.error("Restaurant search failed:", error)
      setSearchError("Couldn't find grub right now — try again in a bit.")
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Run the default search once on load so the UI isn't empty on first paint.
  useEffect(() => {
    if (hasSearchedOnMount.current) return
    hasSearchedOnMount.current = true
    handleSearch(searchQuery, location)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = (restaurant: Restaurant) => {
    if (!saved.find(r => r.id === restaurant.id)) {
      setSaved([...saved, restaurant])
    }
  }

  const handleRemove = (id: string) => {
    setSaved(saved.filter(r => r.id !== id))
  }

  const handleSelectRestaurant = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant)
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={28} minSize={20} maxSize={45}>
          <Sidebar
            results={results}
            saved={saved}
            onSearch={handleSearch}
            onSave={handleSave}
            onRemove={handleRemove}
            onSelectRestaurant={handleSelectRestaurant}
            selectedRestaurant={selectedRestaurant}
            searchQuery={searchQuery}
            location={location}
            isSearching={isSearching}
            searchError={searchError}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={72}>
          <MapView
            results={results}
            saved={saved}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleSelectRestaurant}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
