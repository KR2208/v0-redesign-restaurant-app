"use client"

import { useState } from "react"
import { Sidebar } from "@/components/yelpy/sidebar"
import { MapView } from "@/components/yelpy/map-view"
import { Restaurant } from "@/components/yelpy/types"

// Mock data for demonstration
const mockResults: Restaurant[] = [
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
    id: "2",
    name: "Flour + Water",
    address: "2401 Harrison St, San Francisco, CA 94110, USA",
    rating: 4.7,
    priceLevel: 3,
    types: ["italian restaurant", "pasta"],
    lat: 37.7589,
    lng: -122.4128,
  },
  {
    id: "3",
    name: "A16",
    address: "2355 Chestnut St, San Francisco, CA 94123, USA",
    rating: 4.4,
    priceLevel: 3,
    types: ["italian restaurant", "wine bar"],
    lat: 37.8005,
    lng: -122.4380,
  },
]

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
  const [results, setResults] = useState<Restaurant[]>(mockResults)
  const [saved, setSaved] = useState<Restaurant[]>(mockSaved)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [searchQuery, setSearchQuery] = useState("Italian")
  const [location, setLocation] = useState("San Francisco")

  const handleSearch = (query: string, loc: string) => {
    setSearchQuery(query)
    setLocation(loc)
    // In real app, this would call Google Places API
    console.log("[v0] Searching for:", query, "in", loc)
  }

  const handleSave = (restaurant: Restaurant) => {
    if (!saved.find(r => r.id === restaurant.id)) {
      setSaved([...saved, restaurant])
    }
  }

  const handleRemove = (id: string) => {
    setSaved(saved.filter(r => r.id !== id))
  }

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
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
      />
      <MapView
        results={results}
        saved={saved}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
      />
    </div>
  )
}
