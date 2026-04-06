"use client"

import { useState } from "react"
import { Sparkles, MapPin, ChefHat, Loader2, ArrowRight } from "lucide-react"
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
        name: "Burma Superstar",
        cuisine: "Burmese",
        reason: "Famous for their tea leaf salad and rainbow salad - a unique culinary experience",
      },
      {
        name: "State Bird Provisions",
        cuisine: "New American",
        reason: "Michelin-starred dim sum style service with creative seasonal dishes",
      },
      {
        name: "Tartine Manufactory",
        cuisine: "Bakery & Cafe",
        reason: "Perfect for brunch with world-renowned pastries and coffee",
      },
    ])
    
    setIsLoading(false)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-ai/30 bg-gradient-to-br from-ai/10 via-ai/5 to-transparent">
      {/* Header */}
      <div className="border-b border-ai/20 bg-ai/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai">
            <Sparkles className="h-4 w-4 text-ai-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-sidebar-foreground">
              AI Recommendations
            </h2>
            <p className="text-xs text-muted-foreground">
              Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleRecommend} className="space-y-3 p-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ai" />
          <Input
            type="text"
            placeholder="Where? (e.g. Austin TX)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 border-ai/30 bg-sidebar-accent pl-10 text-sidebar-foreground placeholder:text-muted-foreground focus:border-ai focus:ring-ai"
          />
        </div>
        <div className="relative">
          <ChefHat className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ai" />
          <Input
            type="text"
            placeholder="Craving? (optional)"
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
            className="h-10 border-ai/30 bg-sidebar-accent pl-10 text-sidebar-foreground placeholder:text-muted-foreground focus:border-ai focus:ring-ai"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !location.trim()}
          className="h-11 w-full bg-ai font-medium text-ai-foreground transition-all hover:bg-ai/90 hover:shadow-lg hover:shadow-ai/25 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding gems...
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
        <div className="border-t border-ai/20 p-4">
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <article
                key={rec.name}
                className={cn(
                  "group cursor-pointer rounded-xl border border-ai/20 bg-sidebar-accent p-3 transition-all duration-300",
                  "hover:border-ai/40 hover:bg-ai/5 hover:shadow-md hover:shadow-ai/10"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-sm font-semibold text-sidebar-foreground transition-colors group-hover:text-ai">
                      {rec.name}
                    </h3>
                    <span className="mt-0.5 inline-block rounded-md bg-ai/15 px-1.5 py-0.5 text-xs font-medium text-ai">
                      {rec.cuisine}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-ai group-hover:opacity-100" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
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
