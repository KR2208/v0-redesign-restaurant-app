"use client"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchFormProps {
  searchQuery: string
  location: string
  isSearching?: boolean
  onSearch: (query: string, location: string) => void
}

export function SearchForm({
  searchQuery: initialQuery,
  location: initialLocation,
  isSearching = false,
  onSearch,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chrome" />
        <Input
          type="text"
          placeholder="Burgers, Pizza, Coffee..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-none border-2 border-chrome bg-input pl-10 font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chrome" />
        <Input
          type="text"
          placeholder="Your neighborhood..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12 rounded-none border-2 border-chrome bg-input pl-10 font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
        />
      </div>
      <Button
        type="submit"
        disabled={isSearching}
        className="h-12 w-full rounded-none border-2 border-chrome bg-primary font-mono text-sm uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60"
      >
        {isSearching ? "Cookin'..." : "Find Grub"}
      </Button>
    </form>
  )
}
