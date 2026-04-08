"use client"

import { useState } from "react"
import { Search, MapPin, Coffee } from "lucide-react"
import Image from "next/image"
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
    <aside className="flex h-full w-full max-w-md flex-col border-r-4 border-chrome bg-sidebar">
      {/* Retro Header */}
      <header className="relative border-b-4 border-chrome bg-gradient-to-b from-sidebar-accent to-sidebar px-6 py-5">
        {/* Decorative top stripe */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-chrome bg-primary shadow-lg">
              <Coffee className="h-7 w-7 text-primary-foreground" />
              {/* Neon glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" />
            </div>
            <div>
              <h1 className="font-serif text-3xl tracking-wide text-primary drop-shadow-lg">
                {"Yelpy's"}
              </h1>
              <p className="font-mono text-xs uppercase tracking-widest text-chrome">
                Diner Finder
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-32 overflow-hidden border-b-4 border-chrome">
        <Image
          src="/images/diner-hero.jpg"
          alt="Retro diner interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="font-mono text-xs uppercase tracking-wider text-chrome">
            Open 24 Hours - Good Eats Guaranteed
          </p>
        </div>
      </div>

      {/* Search Form - Styled like a menu board */}
      <form onSubmit={handleSubmit} className="space-y-3 border-b-4 border-chrome bg-sidebar-accent/50 p-4">
        <div className="mb-2 text-center">
          <span className="font-serif text-lg text-primary">What&apos;ll it be?</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chrome" />
          <Input
            type="text"
            placeholder="Burgers, Pizza, Coffee..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-none border-2 border-chrome bg-sidebar pl-10 font-mono text-sidebar-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chrome" />
          <Input
            type="text"
            placeholder="Your neighborhood..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12 rounded-none border-2 border-chrome bg-sidebar pl-10 font-mono text-sidebar-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
          />
        </div>
        <Button 
          type="submit" 
          className="h-12 w-full rounded-none border-2 border-chrome bg-primary font-mono text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
        >
          Find Grub
        </Button>
      </form>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Search Results */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-chrome/50" />
              <h2 className="font-serif text-xl text-primary">
                Today&apos;s Specials
              </h2>
              <div className="h-px flex-1 bg-chrome/50" />
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
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-secondary/50" />
              <h2 className="font-serif text-xl text-secondary">
                My Favorites
              </h2>
              <span className="rounded-full border-2 border-secondary bg-secondary/20 px-3 py-0.5 font-mono text-sm text-secondary">
                {saved.length}
              </span>
              <div className="h-px flex-1 bg-secondary/50" />
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
                <div className="rounded-none border-2 border-dashed border-chrome/50 py-6 text-center">
                  <p className="font-mono text-sm text-muted-foreground">
                    No favorites yet, sugar!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* AI Recommendations */}
          <AIRecommendations />
        </div>
      </ScrollArea>

      {/* Footer */}
      <footer className="border-t-4 border-chrome bg-sidebar-accent/50 px-4 py-3 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-chrome">
          Est. 2024 - Made with Love
        </p>
      </footer>
    </aside>
  )
}
