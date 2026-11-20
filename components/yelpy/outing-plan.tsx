"use client"

import { useEffect, useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Restaurant } from "./types"

interface OutingPick {
  id: string
  name: string
  rating: number
  distanceMeters: number
  why: string
}

interface OutingPlanData {
  summary: string
  thingsToDo: OutingPick[]
  moreToEat: OutingPick[]
}

interface OutingPlanProps {
  restaurant: Restaurant | null
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m away`
  return `${(meters / 1000).toFixed(1)}km away`
}

// Replaces the old fake "Ask the Chef" panel - this one calls the real
// route (real Places data, Gemini only narrates it) instead of a
// setTimeout and a hardcoded array.
export function OutingPlan({ restaurant }: OutingPlanProps) {
  const [plan, setPlan] = useState<OutingPlanData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!restaurant) {
      // Intentional: clears the previous restaurant's plan immediately
      // when none is selected, rather than leaving stale data on screen.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlan(null)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams({
      name: restaurant.name,
      lat: String(restaurant.lat),
      lng: String(restaurant.lng),
    })

    fetch(`/api/restaurants/${encodeURIComponent(restaurant.id)}/nearby?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Failed to load outing plan")
        if (!cancelled) setPlan(data.plan)
      })
      .catch((err) => {
        console.error("Failed to load outing plan:", err)
        if (!cancelled) setError("Couldn't put together an outing plan right now.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Deliberately depending on the restaurant's individual fields rather
    // than the whole object - the sidebar re-creates restaurant objects on
    // every search, and we only want to re-fetch when the actual place
    // changes, not on every referentially-new-but-identical object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id, restaurant?.name, restaurant?.lat, restaurant?.lng])

  return (
    <section className="overflow-hidden rounded-none border-4 border-accent">
      {/* Retro header, same treatment the old panel used */}
      <div className="relative h-24 overflow-hidden bg-accent">
        <Image src="/images/retro-milkshake.jpg" alt="Retro milkshake" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/80 to-accent" />
        <div className="relative flex h-full items-center gap-3 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-accent-foreground/30 bg-accent-foreground/10">
            <Sparkles className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-accent-foreground">Make It an Outing</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-accent-foreground/70">
              Real Nearby Places, AI-Curated
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-3">
        {[...Array(24)].map((_, i) => (
          <div key={i} className={cn("flex-1", i % 2 === 0 ? "bg-accent-foreground" : "bg-accent")} />
        ))}
      </div>

      <div className="bg-sidebar-accent p-4">
        {!restaurant && (
          <p className="py-2 text-center font-mono text-sm text-muted-foreground">
            Select a restaurant above to see what&apos;s worth doing nearby.
          </p>
        )}

        {restaurant && isLoading && (
          <div className="flex items-center justify-center gap-2 py-4 font-mono text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Scouting the neighborhood...
          </div>
        )}

        {restaurant && !isLoading && error && (
          <p className="py-2 text-center font-mono text-sm text-destructive">{error}</p>
        )}

        {restaurant && !isLoading && !error && plan && (
          <div className="space-y-4">
            <p className="font-mono text-xs leading-relaxed text-foreground">{plan.summary}</p>

            {plan.thingsToDo.length > 0 && (
              <div>
                <p className="mb-2 font-serif text-sm text-accent">Things to do nearby</p>
                <div className="space-y-2">
                  {plan.thingsToDo.map((pick) => (
                    <OutingCard key={pick.id} pick={pick} />
                  ))}
                </div>
              </div>
            )}

            {plan.moreToEat.length > 0 && (
              <div>
                <p className="mb-2 font-serif text-sm text-accent">More to eat nearby</p>
                <div className="space-y-2">
                  {plan.moreToEat.map((pick) => (
                    <OutingCard key={pick.id} pick={pick} />
                  ))}
                </div>
              </div>
            )}

            {plan.thingsToDo.length === 0 && plan.moreToEat.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground">
                Nothing nearby stood out this time - try a different restaurant.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function OutingCard({ pick }: { pick: OutingPick }) {
  return (
    <article className="rounded-none border-2 border-chrome bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate font-serif text-sm text-foreground">{pick.name}</h3>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {formatDistance(pick.distanceMeters)}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">{pick.why}</p>
    </article>
  )
}
