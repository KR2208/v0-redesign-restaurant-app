"use client"

import { Star, Bookmark, BookmarkCheck, X, MapPin } from "lucide-react"
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

  return (
    <article
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-300",
        "hover:shadow-lg",
        variant === "saved"
          ? "border-saved/30 bg-saved/5 hover:border-saved/50 hover:shadow-saved/10"
          : "border-sidebar-border bg-sidebar-accent hover:border-primary/30 hover:shadow-primary/10",
        isSelected && variant === "saved" && "border-saved ring-2 ring-saved/30",
        isSelected && variant === "result" && "border-primary ring-2 ring-primary/30"
      )}
    >
      {/* Accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 transition-all",
          variant === "saved" ? "bg-saved" : "bg-primary",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-base font-semibold text-sidebar-foreground transition-colors group-hover:text-primary">
              {restaurant.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium text-sidebar-foreground">
                  {restaurant.rating}
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {priceDisplay}
              </span>
            </div>
          </div>

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
                "h-9 w-9 shrink-0 rounded-lg transition-all",
                isSaved
                  ? "bg-saved/20 text-saved"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
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
              className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove from saved</span>
            </Button>
          )}
        </div>

        {/* Address */}
        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{restaurant.address}</span>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.types.slice(0, 2).map((type) => (
            <span
              key={type}
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium",
                variant === "saved"
                  ? "bg-saved/10 text-saved"
                  : "bg-primary/10 text-primary"
              )}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
