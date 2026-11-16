"use client"

import { LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full border-2 border-chrome bg-sidebar-accent" />
    )
  }

  if (session) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => authClient.signOut()}
        title={`Signed in as ${session.user.name} — click to sign out`}
        className="h-10 w-10 rounded-full border-2 border-chrome bg-sidebar-accent text-chrome transition-all hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Sign out ({session.user.name})</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}
      title="Sign in with Google"
      className="h-10 w-10 rounded-full border-2 border-chrome bg-sidebar-accent text-chrome transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
    >
      <LogIn className="h-5 w-5" />
      <span className="sr-only">Sign in with Google</span>
    </Button>
  )
}
