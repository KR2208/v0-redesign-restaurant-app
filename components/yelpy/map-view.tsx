"use client"

import { Map, Marker, Overlay } from "pigeon-maps"
import { X, Star, MapPin, Coffee } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Restaurant } from "./types"

interface MapViewProps {
  results: Restaurant[]
  saved: Restaurant[]
  selectedRestaurant: Restaurant | null
  onSelectRestaurant: (restaurant: Restaurant | null) => void
}

const foodImages = [
  "/images/retro-burger.jpg",
  "/images/retro-milkshake.jpg", 
  "/images/retro-pie.jpg",
]

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

  const getRestaurantImage = (id: string) => {
    const imageIndex = parseInt(id, 10) % foodImages.length
    return foodImages[imageIndex]
  }

  return (
    <main className="relative flex-1 bg-background">
      {/* Decorative top border */}
      <div className="absolute left-0 right-0 top-0 z-10 flex h-3">
        {[...Array(40)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "flex-1",
              i % 2 === 0 ? "bg-primary" : "bg-secondary"
            )} 
          />
        ))}
      </div>

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
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-4 shadow-lg transition-all duration-200",
                  "hover:scale-110",
                  isSaved
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-primary bg-primary text-primary-foreground",
                  isSelected && "scale-125"
                )}
              >
                <Coffee className="h-5 w-5" />
                {/* Pin point */}
                <div className={cn(
                  "absolute -bottom-2 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent",
                  isSaved ? "border-t-secondary" : "border-t-primary"
                )} />
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
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-secondary bg-secondary text-secondary-foreground shadow-lg transition-all duration-200",
                    "hover:scale-110",
                    isSelected && "scale-125"
                  )}
                >
                  <Coffee className="h-5 w-5" />
                  <div className="absolute -bottom-2 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-secondary" />
                </div>
              </Marker>
            )
          })}

        {/* Popup for selected restaurant */}
        {selectedRestaurant && (
          <Overlay
            anchor={[selectedRestaurant.lat, selectedRestaurant.lng]}
            offset={[0, -55]}
          >
            <div className="animate-in fade-in zoom-in-95 relative w-80 overflow-hidden rounded-none border-4 border-chrome bg-card shadow-xl duration-200">
              {/* Checkered header */}
              <div className="flex h-2">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1",
                      i % 2 === 0 
                        ? savedIds.has(selectedRestaurant.id) ? "bg-secondary" : "bg-primary"
                        : "bg-accent"
                    )} 
                  />
                ))}
              </div>

              {/* Image */}
              <div className="relative h-24 overflow-hidden">
                <Image
                  src={getRestaurantImage(selectedRestaurant.id)}
                  alt={selectedRestaurant.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelectRestaurant(null)}
                className="absolute right-2 top-4 h-8 w-8 rounded-full border-2 border-chrome bg-card/90 text-card-foreground hover:bg-card hover:text-primary"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close popup</span>
              </Button>

              <div className="p-4">
                <h3 className={cn(
                  "font-serif text-lg",
                  savedIds.has(selectedRestaurant.id) ? "text-secondary" : "text-primary"
                )}>
                  {selectedRestaurant.name}
                </h3>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(selectedRestaurant.rating) 
                            ? "fill-accent text-accent" 
                            : "text-chrome/50"
                        )} 
                      />
                    ))}
                    <span className="ml-1 font-mono text-sm text-card-foreground">
                      {selectedRestaurant.rating}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-accent">
                    {"$".repeat(selectedRestaurant.priceLevel)}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-chrome" />
                  <p className="font-mono text-sm text-muted-foreground">
                    {selectedRestaurant.address}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedRestaurant.types.slice(0, 2).map((type) => (
                    <span
                      key={type}
                      className={cn(
                        "rounded-none border px-2 py-0.5 font-mono text-xs uppercase",
                        savedIds.has(selectedRestaurant.id)
                          ? "border-secondary/50 bg-secondary/20 text-secondary"
                          : "border-primary/50 bg-primary/20 text-primary"
                      )}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Overlay>
        )}
      </Map>

      {/* Retro Map Legend */}
      <div className="absolute bottom-6 left-6 overflow-hidden rounded-none border-4 border-chrome bg-card/95 shadow-lg backdrop-blur-sm">
        <div className="flex h-2">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1",
                i % 2 === 0 ? "bg-primary" : "bg-secondary"
              )} 
            />
          ))}
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <Coffee className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <span className="font-mono text-xs uppercase text-card-foreground">Results</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary">
              <Coffee className="h-2.5 w-2.5 text-secondary-foreground" />
            </div>
            <span className="font-mono text-xs uppercase text-card-foreground">Favorites</span>
          </div>
        </div>
      </div>

      {/* Decorative corner badge */}
      <div className="absolute right-6 top-10 rotate-3 rounded-none border-4 border-chrome bg-accent px-4 py-2 shadow-lg">
        <p className="font-serif text-lg text-accent-foreground">Open 24/7</p>
      </div>
    </main>
  )
}
