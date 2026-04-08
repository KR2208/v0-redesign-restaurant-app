"use client"

import { useState } from "react"
import { Sparkles, MapPin, Utensils, Loader2, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Recommendation {
  name: string
  cuisine: string
  reason: string
}

export function AIRecommendations() {
  const [location, setLocation] = useState("")
  const [craving, setCraving] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim()) return

    setIsLoading(true)
    
    // Simulate API call to Gemini AI
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setRecommendations([
      {
        name: "Mel's Drive-In",
        cuisine: "Classic American",
        reason: "Iconic 50s diner with the best burgers and shakes in town",
      },
      {
        name: "The Breakfast Club",
        cuisine: "Brunch Spot",
        reason: "Legendary pancakes and bottomless coffee since 1952",
      },
      {
        name: "Johnny Rockets",
        cuisine: "Burgers & Fries",
        reason: "Authentic jukebox experience with hand-spun milkshakes",
      },
    ])
    
    setIsLoading(false)
  }

  return (
    <section className="overflow-hidden rounded-none border-4 border-accent">
      {/* Retro Header with image */}
      <div className="relative h-24 overflow-hidden bg-accent">
        <Image
          src="/images/retro-milkshake.jpg"
          alt="Retro milkshake"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/80 to-accent" />
        <div className="relative flex h-full items-center gap-3 px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-accent-foreground/30 bg-accent-foreground/10">
            <Sparkles className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-accent-foreground">
              Ask the Chef
            </h2>
            <p className="font-mono text-xs uppercase tracking-wider text-accent-foreground/70">
              AI-Powered Picks
            </p>
          </div>
        </div>
      </div>

      {/* Checkered divider */}
      <div className="flex h-3">
        {[...Array(24)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "flex-1",
              i % 2 === 0 ? "bg-accent-foreground" : "bg-accent"
            )} 
          />
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleRecommend} className="space-y-3 bg-sidebar-accent p-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <Input
            type="text"
            placeholder="Where ya at? (e.g. Austin TX)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11 rounded-none border-2 border-accent/50 bg-sidebar pl-10 font-mono text-sidebar-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent"
          />
        </div>
        <div className="relative">
          <Utensils className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <Input
            type="text"
            placeholder="What sounds good?"
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
            className="h-11 rounded-none border-2 border-accent/50 bg-sidebar pl-10 font-mono text-sidebar-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !location.trim()}
          className="h-12 w-full rounded-none border-2 border-accent-foreground bg-accent font-mono text-sm uppercase tracking-wider text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cooking up ideas...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get Recommendations
            </>
          )}
        </Button>
      </form>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t-4 border-accent bg-sidebar p-4">
          <p className="mb-3 text-center font-serif text-sm text-accent">
            Chef recommends...
          </p>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <article
                key={rec.name}
                className={cn(
                  "group cursor-pointer rounded-none border-2 border-chrome bg-sidebar-accent p-3 transition-all duration-300",
                  "hover:border-accent hover:shadow-md hover:shadow-accent/20"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent/20 font-mono text-xs font-bold text-accent">
                        {index + 1}
                      </span>
                      <h3 className="truncate font-serif text-sm text-sidebar-foreground transition-colors group-hover:text-accent">
                        {rec.name}
                      </h3>
                    </div>
                    <span className="mt-1 inline-block rounded-none border border-accent/50 bg-accent/10 px-1.5 py-0.5 font-mono text-xs uppercase text-accent">
                      {rec.cuisine}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-chrome transition-all group-hover:translate-x-1 group-hover:text-accent" />
                </div>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {rec.reason}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
