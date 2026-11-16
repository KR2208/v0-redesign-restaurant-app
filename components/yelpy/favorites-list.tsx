"use client"

import { RestaurantCard } from "./restaurant-card"
import { Restaurant } from "./types"

interface FavoritesListProps {
  saved: Restaurant[]
  selectedRestaurant: Restaurant | null
  isLoading?: boolean
  onRemove: (id: string) => void
  onSelect: (restaurant: Restaurant) => void
}

export function FavoritesList({ saved, selectedRestaurant, isLoading = false, onRemove, onSelect }: FavoritesListProps) {
  if (isLoading) {
    return (
      <div className="rounded-none border-2 border-dashed border-secondary/50 py-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">Loading your favorites...</p>
      </div>
    )
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-none border-2 border-dashed border-chrome/50 py-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">No favorites yet, sugar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {saved.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          variant="saved"
          onRemove={() => onRemove(restaurant.id)}
          onSelect={() => onSelect(restaurant)}
          isSelected={selectedRestaurant?.id === restaurant.id}
        />
      ))}
    </div>
  )
}
