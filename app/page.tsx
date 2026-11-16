"use client"

import { useEffect, useRef, useState } from "react"
import { Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { Landing } from "@/components/yelpy/landing"
import { Section } from "@/components/yelpy/section"
import { SearchForm } from "@/components/yelpy/search-form"
import { ResultsList } from "@/components/yelpy/results-list"
import { FavoritesList } from "@/components/yelpy/favorites-list"
import { MapView } from "@/components/yelpy/map-view"
import { AIRecommendations } from "@/components/yelpy/ai-recommendations"
import { ThemeToggle } from "@/components/yelpy/theme-toggle"
import { AuthButton } from "@/components/yelpy/auth-button"
import { Restaurant } from "@/components/yelpy/types"
import { authClient } from "@/lib/auth-client"

// TODO(sheet-05): saved restaurants are still local-only mock state.
// This goes away once saves are persisted per-user in Postgres.
const mockSaved: Restaurant[] = [
  {
    id: "1",
    name: "Tony's Pizza Napoletana",
    address: "1570 Stockton St, San Francisco, CA 94133, USA",
    rating: 4.5,
    priceLevel: 2,
    types: ["pizza restaurant", "italian restaurant"],
    lat: 37.8003,
    lng: -122.4091,
  },
  {
    id: "4",
    name: "Copper Chimney Indian Restaurant",
    address: "489a 3rd St, San Francisco, CA 94107, USA",
    rating: 4.7,
    priceLevel: 2,
    types: ["indian restaurant"],
    lat: 37.7825,
    lng: -122.3955,
  },
]

export default function YelpyApp() {
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [results, setResults] = useState<Restaurant[]>([])
  const [saved, setSaved] = useState<Restaurant[]>(mockSaved)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [searchQuery, setSearchQuery] = useState("Italian")
  const [location, setLocation] = useState("San Francisco")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isMapVisible, setIsMapVisible] = useState(true)
  // Guards against React Strict Mode's dev-only double-invoke of the
  // mount effect below. A ref survives that fake unmount/remount, so the
  // second invocation sees `true` and skips — without this, the very
  // first search on every page load fired two real (billable) Places API
  // calls instead of one, racing each other before either could write to
  // the cache. Production builds don't double-invoke at all; this guard
  // is purely a dev-mode safety net.
  const hasSearchedOnMount = useRef(false)
  const mapSectionRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (query: string, loc: string) => {
    setSearchQuery(query)
    setLocation(loc)
    setIsSearching(true)
    setSearchError(null)

    try {
      const params = new URLSearchParams({ query, location: loc })
      const response = await fetch(`/api/places/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed")
      }

      setResults(data.restaurants)
    } catch (error) {
      console.error("Restaurant search failed:", error)
      setSearchError("Couldn't find grub right now — try again in a bit.")
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Run the default search once someone's actually signed in - not on
  // mount unconditionally, since a signed-out visitor only ever sees the
  // landing page below and there's no point quietly calling Google for
  // a search nobody will see.
  useEffect(() => {
    if (!session) return
    if (hasSearchedOnMount.current) return
    hasSearchedOnMount.current = true
    handleSearch(searchQuery, location)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const handleSave = (restaurant: Restaurant) => {
    if (!saved.find(r => r.id === restaurant.id)) {
      setSaved([...saved, restaurant])
    }
  }

  const handleRemove = (id: string) => {
    setSaved(saved.filter(r => r.id !== id))
  }

  const handleSelectRestaurant = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant)
    // Picking a restaurant from a list further up the page should make
    // the map section visible, not leave someone wondering why nothing
    // happened because the map was scrolled out of view (or collapsed).
    if (restaurant) {
      setIsMapVisible(true)
    }
  }

  // Scroll the map into view whenever a restaurant gets selected. Runs
  // after the state updates above have actually painted (rAF, not
  // immediately), so this fires once the map section has already
  // expanded if it was collapsed - scrolling to a still-collapsed
  // section would just land on an empty box.
  useEffect(() => {
    if (!selectedRestaurant) return
    const frame = requestAnimationFrame(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedRestaurant])

  if (isSessionPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Landing />
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Brand header */}
      <header className="relative border-b-4 border-chrome bg-card px-6 py-5">
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-chrome bg-primary shadow-lg">
              <Coffee className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-2xl tracking-wide text-primary">Yelpy&apos;s</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Diner Finder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Decorative checkered banner — CSS, not a photo, so it stays crisp
          at any width instead of stretching a low-res image across a
          wide, short strip (that's what was going blurry here before). */}
      <div className="relative border-b-4 border-chrome bg-card">
        <div className="flex h-3">
          {[...Array(80)].map((_, i) => (
            <div key={i} className={cn("flex-1", i % 2 === 0 ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
        <div className="px-6 py-3 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Open 24 Hours - Good Eats Guaranteed
          </p>
        </div>
      </div>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <Section title="Account" tone="default" description="Signed in with Google - sign out any time.">
          <p className="font-mono text-sm text-foreground">
            Signed in as <span className="text-primary">{session.user.name}</span>
          </p>
        </Section>

        <Section title="What'll it be?" tone="primary">
          <SearchForm
            searchQuery={searchQuery}
            location={location}
            isSearching={isSearching}
            onSearch={handleSearch}
          />
        </Section>

        <Section title="Today's Specials" tone="default" badge={results.length}>
          <ResultsList
            results={results}
            saved={saved}
            selectedRestaurant={selectedRestaurant}
            isSearching={isSearching}
            searchError={searchError}
            onSave={handleSave}
            onSelect={handleSelectRestaurant}
          />
        </Section>

        <Section title="My Favorites" tone="secondary" badge={saved.length}>
          <FavoritesList
            saved={saved}
            selectedRestaurant={selectedRestaurant}
            onRemove={handleRemove}
            onSelect={handleSelectRestaurant}
          />
        </Section>

        <div ref={mapSectionRef}>
          <Section
            title="Map"
            tone="default"
            description="Drag or zoom to see where everything is."
            collapsible
            collapsed={!isMapVisible}
            onToggleCollapse={() => setIsMapVisible((v) => !v)}
          >
            {/* No overflow-hidden here on purpose: the selected-restaurant
                popup is positioned above its marker and gets clipped by
                any ancestor that hides overflow if the marker is near the
                top edge. pigeon-maps already clips its own tiles
                internally, so this wrapper only needs the border. */}
            <div className="h-[480px] border-2 border-chrome">
              <MapView
                results={results}
                saved={saved}
                selectedRestaurant={selectedRestaurant}
                onSelectRestaurant={handleSelectRestaurant}
              />
            </div>
          </Section>
        </div>

        <AIRecommendations />
      </main>

      <footer className="border-t-4 border-chrome bg-card px-4 py-3 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Est. 2024 - Made with Love
        </p>
      </footer>
    </div>
  )
}
