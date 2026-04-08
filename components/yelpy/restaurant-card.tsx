"use client"

import { Star, Heart, HeartOff, MapPin } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Restaurant } from "./types"

interface RestaurantCardProps {
  restaurant: Restaurant
  variant: "result" | "saved"
  onSave?: () => void
  onRemove?: () => void
  onSelect: () => void
  isSelected?: boolean
  isSaved?: boolean
}

const foodImages = [
  "/images/retro-burger.jpg",
  "/images/retro-milkshake.jpg", 
  "/images/retro-pie.jpg",
]

export function RestaurantCard({
  restaurant,
  variant,
  onSave,
  onRemove,
  onSelect,
  isSelected,
  isSaved,
}: RestaurantCardProps) {
  const priceDisplay = "$".repeat(restaurant.priceLevel)
  
  // Deterministic image based on restaurant id
  const imageIndex = parseInt(restaurant.id, 10) % foodImages.length
  const foodImage = foodImages[imageIndex]

  return (
    <article
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all duration-300",
        "rounded-none border-2",
        variant === "saved"
          ? "border-secondary bg-sidebar-accent hover:border-secondary hover:shadow-lg hover:shadow-secondary/20"
          : "border-chrome bg-sidebar-accent hover:border-primary hover:shadow-lg hover:shadow-primary/20",
        isSelected && variant === "saved" && "border-secondary ring-2 ring-secondary/50 shadow-lg shadow-secondary/20",
        isSelected && variant === "result" && "border-primary ring-2 ring-primary/50 shadow-lg shadow-primary/20"
      )}
    >
      {/* Checkered top border */}
      <div className="flex h-2">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "flex-1",
              i % 2 === 0 
                ? variant === "saved" ? "bg-secondary" : "bg-primary"
                : "bg-transparent"
            )} 
          />
        ))}
      </div>

      <div className="flex gap-3 p-3">
        {/* Food Image */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border-2 border-chrome">
          <Image
            src={foodImage}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "truncate font-serif text-base transition-colors",
              variant === "saved" 
                ? "text-secondary group-hover:text-secondary"
                : "text-sidebar-foreground group-hover:text-primary"
            )}>
              {restaurant.name}
            </h3>

            {/* Action button */}
            {variant === "result" && onSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onSave()
                }}
                disabled={isSaved}
                className={cn(
                  "h-8 w-8 shrink-0 rounded-none border-2 transition-all",
                  isSaved
                    ? "border-secondary bg-secondary/20 text-secondary"
                    : "border-chrome text-chrome hover:border-primary hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                <span className="sr-only">{isSaved ? "Saved" : "Save restaurant"}</span>
              </Button>
            )}

            {variant === "saved" && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="h-8 w-8 shrink-0 rounded-none border-2 border-chrome text-chrome transition-all hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <HeartOff className="h-4 w-4" />
                <span className="sr-only">Remove from saved</span>
              </Button>
            )}
          </div>

          {/* Rating and Price */}
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(restaurant.rating) 
                      ? "fill-accent text-accent" 
                      : "text-chrome/50"
                  )} 
                />
              ))}
              <span className="ml-1 font-mono text-xs text-sidebar-foreground">
                {restaurant.rating}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-accent">
              {priceDisplay}
            </span>
          </div>

          {/* Address */}
          <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-1 font-mono">{restaurant.address}</span>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {restaurant.types.slice(0, 2).map((type) => (
              <span
                key={type}
                className={cn(
                  "rounded-none border px-1.5 py-0.5 font-mono text-xs uppercase",
                  variant === "saved"
                    ? "border-secondary/50 bg-secondary/10 text-secondary"
                    : "border-primary/50 bg-primary/10 text-primary"
                )}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
