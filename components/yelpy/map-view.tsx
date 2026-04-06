"use client"

import { Map, Marker, Overlay } from "pigeon-maps"
import { X, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Restaurant } from "./types"

interface MapViewProps {
  results: Restaurant[]
  saved: Restaurant[]
  selectedRestaurant: Restaurant | null
  onSelectRestaurant: (restaurant: Restaurant | null) => void
}

export function MapView({
  results,
  saved,
  selectedRestaurant,
  onSelectRestaurant,
}: MapViewProps) {
  const savedIds = new Set(saved.map(r => r.id))

  // Default center on San Francisco
  const defaultCenter: [number, number] = [37.7749, -122.4194]

  // Calculate center based on selected restaurant or all markers
  const center: [number, number] = selectedRestaurant
    ? [selectedRestaurant.lat, selectedRestaurant.lng]
    : defaultCenter

  return (
    <main className="relative flex-1 bg-background">
      <Map
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        center={center}
        zoom={selectedRestaurant ? 15 : 12}
        attribution={false}
      >
        {/* Result markers */}
        {results.map((restaurant) => {
          const isSaved = savedIds.has(restaurant.id)
          const isSelected = selectedRestaurant?.id === restaurant.id

          return (
            <Marker
              key={restaurant.id}
              anchor={[restaurant.lat, restaurant.lng]}
              onClick={() => onSelectRestaurant(restaurant)}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all duration-200",
                  "hover:scale-110",
                  isSaved
                    ? "bg-saved text-saved-foreground"
                    : "bg-primary text-primary-foreground",
                  isSelected && "scale-125 ring-4 ring-background"
                )}
              >
                <MapPin className="h-4 w-4" />
              </div>
            </Marker>
          )
        })}

        {/* Saved markers (that aren't in results) */}
        {saved
          .filter(r => !results.find(res => res.id === r.id))
          .map((restaurant) => {
            const isSelected = selectedRestaurant?.id === restaurant.id

            return (
              <Marker
                key={`saved-${restaurant.id}`}
                anchor={[restaurant.lat, restaurant.lng]}
                onClick={() => onSelectRestaurant(restaurant)}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full bg-saved text-saved-foreground shadow-lg transition-all duration-200",
                    "hover:scale-110",
                    isSelected && "scale-125 ring-4 ring-background"
                  )}
                >
                  <MapPin className="h-4 w-4" />
                </div>
              </Marker>
            )
          })}

        {/* Popup for selected restaurant */}
        {selectedRestaurant && (
          <Overlay
            anchor={[selectedRestaurant.lat, selectedRestaurant.lng]}
            offset={[0, -45]}
          >
            <div className="animate-in fade-in zoom-in-95 relative w-72 rounded-xl border border-border bg-card p-4 shadow-xl duration-200">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelectRestaurant(null)}
                className="absolute right-2 top-2 h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close popup</span>
              </Button>

              <h3 className="pr-8 font-serif text-base font-semibold text-card-foreground">
                {selectedRestaurant.name}
              </h3>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-medium text-card-foreground">
                    {selectedRestaurant.rating}
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {"$".repeat(selectedRestaurant.priceLevel)}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {selectedRestaurant.address}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedRestaurant.types.slice(0, 2).map((type) => (
                  <span
                    key={type}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      savedIds.has(selectedRestaurant.id)
                        ? "bg-saved/20 text-saved"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </Overlay>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4 rounded-xl border border-border bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs font-medium text-card-foreground">Results</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-saved" />
          <span className="text-xs font-medium text-card-foreground">Saved</span>
        </div>
      </div>
    </main>
  )
}
