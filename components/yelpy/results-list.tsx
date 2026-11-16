"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RestaurantCard } from "./restaurant-card"
import { Restaurant } from "./types"

interface ResultsListProps {
  results: Restaurant[]
  saved: Restaurant[]
  selectedRestaurant: Restaurant | null
  isSearching?: boolean
  searchError?: string | null
  onSave: (restaurant: Restaurant) => void
  onSelect: (restaurant: Restaurant) => void
}

// Text Search can hand back up to 20 results at once - rendering all of
// them inline made this one section longer than the entire rest of the
// page combined. Show a manageable first page, let "View more" reveal
// the rest instead of forcing a long scroll past them every time.
const INITIAL_VISIBLE_COUNT = 5

export function ResultsList({
  results,
  saved,
  selectedRestaurant,
  isSearching = false,
  searchError = null,
  onSave,
  onSelect,
}: ResultsListProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isSearching) {
    return (
      <div className="rounded-none border-2 border-dashed border-primary/50 py-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">Sizzlin&apos; up some results...</p>
      </div>
    )
  }

  if (searchError) {
    return (
      <div className="rounded-none border-2 border-destructive/50 bg-destructive/10 py-6 text-center">
        <p className="font-mono text-sm text-destructive">{searchError}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="rounded-none border-2 border-dashed border-chrome/50 py-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">No grub found, sugar. Try a different search.</p>
      </div>
    )
  }

  const visibleResults = isExpanded ? results : results.slice(0, INITIAL_VISIBLE_COUNT)
  const remainingCount = results.length - INITIAL_VISIBLE_COUNT

  return (
    <div className="space-y-3">
      {visibleResults.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          variant="result"
          onSave={() => onSave(restaurant)}
          onSelect={() => onSelect(restaurant)}
          isSelected={selectedRestaurant?.id === restaurant.id}
          isSaved={saved.some((r) => r.id === restaurant.id)}
        />
      ))}

      {remainingCount > 0 && (
        <Button
          variant="outline"
          onClick={() => setIsExpanded((v) => !v)}
          className="h-11 w-full rounded-none border-2 border-chrome bg-background font-mono text-xs uppercase tracking-wider"
        >
          {isExpanded ? (
            <>Show fewer <ChevronUp className="ml-1.5 h-3.5 w-3.5" /></>
          ) : (
            <>View {remainingCount} more <ChevronDown className="ml-1.5 h-3.5 w-3.5" /></>
          )}
        </Button>
      )}
    </div>
  )
}
