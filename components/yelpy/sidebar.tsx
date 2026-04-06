"use client"

import { useState } from "react"
import { Search, MapPin, Utensils } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RestaurantCard } from "./restaurant-card"
import { AIRecommendations } from "./ai-recommendations"
import { ThemeToggle } from "./theme-toggle"
import { Restaurant } from "./types"

interface SidebarProps {
  results: Restaurant[]
  saved: Restaurant[]
  onSearch: (query: string, location: string) => void
  onSave: (restaurant: Restaurant) => void
  onRemove: (id: string) => void
  onSelectRestaurant: (restaurant: Restaurant) => void
  selectedRestaurant: Restaurant | null
  searchQuery: string
  location: string
}

export function Sidebar({
  results,
  saved,
  onSearch,
  onSave,
  onRemove,
  onSelectRestaurant,
  selectedRestaurant,
  searchQuery: initialQuery,
  location: initialLocation,
}: SidebarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location)
  }

  return (
    <aside className="flex h-full w-full max-w-md flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Utensils className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-sidebar-foreground">
              Yelpy
            </h1>
            <p className="text-xs text-muted-foreground">Discover exceptional dining</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-3 border-b border-sidebar-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cuisine or restaurant name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 border-sidebar-border bg-sidebar-accent pl-10 text-sidebar-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 border-sidebar-border bg-sidebar-accent pl-10 text-sidebar-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
          />
        </div>
        <Button 
          type="submit" 
          className="h-11 w-full bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
        >
          Search Restaurants
        </Button>
      </form>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Search Results */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-sidebar-foreground">
                Results
              </h2>
              <span className="text-sm text-muted-foreground">
                {results.length} found
              </span>
            </div>
            <div className="space-y-3">
              {results.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  variant="result"
                  onSave={() => onSave(restaurant)}
                  onSelect={() => onSelectRestaurant(restaurant)}
                  isSelected={selectedRestaurant?.id === restaurant.id}
                  isSaved={saved.some(r => r.id === restaurant.id)}
                />
              ))}
            </div>
          </section>

          {/* Saved Restaurants */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-sidebar-foreground">
                Saved
              </h2>
              <span className="rounded-full bg-saved/20 px-2.5 py-0.5 text-sm font-medium text-saved">
                {saved.length}
              </span>
            </div>
            <div className="space-y-3">
              {saved.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  variant="saved"
                  onRemove={() => onRemove(restaurant.id)}
                  onSelect={() => onSelectRestaurant(restaurant)}
                  isSelected={selectedRestaurant?.id === restaurant.id}
                />
              ))}
              {saved.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No saved restaurants yet
                </p>
              )}
            </div>
          </section>

          {/* AI Recommendations */}
          <AIRecommendations />
        </div>
      </ScrollArea>
    </aside>
  )
}
