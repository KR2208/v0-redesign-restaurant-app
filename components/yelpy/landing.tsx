"use client"

import { Coffee, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { authClient } from "@/lib/auth-client"

export function Landing() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-y-auto bg-background">
      {/* Decorative top stripe */}
      <div className="flex h-3 shrink-0">
        {[...Array(60)].map((_, i) => (
          <div key={i} className={cn("flex-1", i % 2 === 0 ? "bg-primary" : "bg-secondary")} />
        ))}
      </div>

      <div className="absolute right-6 top-8">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-chrome bg-primary shadow-lg">
            <Coffee className="h-10 w-10 text-primary-foreground" />
          </div>

          <h1 className="mt-6 font-serif text-6xl leading-tight text-primary">Yelpy&apos;s</h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Diner Finder
          </p>

          <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-foreground/80">
            Real diners, real reviews, found near you. Sign in to search,
            save your favorites, and keep them wherever you go.
          </p>

          <Button
            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}
            className="mt-8 h-14 w-full max-w-xs rounded-none border-2 border-chrome bg-primary text-base font-mono uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            Sign in with Google
          </Button>

          <div className="mt-10 inline-flex items-center gap-2 border-2 border-chrome bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Open 24/7 — good eats guaranteed
          </div>
        </div>
      </div>

      {/* Decorative bottom stripe */}
      <div className="flex h-3 shrink-0">
        {[...Array(60)].map((_, i) => (
          <div key={i} className={cn("flex-1", i % 2 === 0 ? "bg-secondary" : "bg-primary")} />
        ))}
      </div>
    </div>
  )
}
