"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SectionProps {
  title: string
  tone?: "default" | "primary" | "secondary" | "accent"
  badge?: number
  description?: string
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  children: React.ReactNode
}

const toneClasses: Record<NonNullable<SectionProps["tone"]>, string> = {
  default: "bg-card",
  primary: "bg-primary/25",
  secondary: "bg-secondary/25",
  accent: "bg-accent/35",
}

export function Section({
  title,
  tone = "default",
  badge,
  description,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  children,
}: SectionProps) {
  return (
    <section className="w-full border-4 border-chrome bg-card">
      <header
        className={cn(
          "flex items-center justify-between gap-3 border-b-4 border-chrome px-5 py-4",
          toneClasses[tone]
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl text-foreground">{title}</h2>
            {typeof badge === "number" && (
              <span className="flex h-6 min-w-6 items-center justify-center border-2 border-chrome bg-background px-1.5 font-mono text-xs text-foreground">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {collapsible && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCollapse}
            className="shrink-0 rounded-none border-2 border-chrome bg-background font-mono text-xs uppercase tracking-wider"
          >
            {collapsed ? "Expand" : "Collapse"}
            {collapsed ? <ChevronDown className="ml-1.5 h-3.5 w-3.5" /> : <ChevronUp className="ml-1.5 h-3.5 w-3.5" />}
          </Button>
        )}
      </header>

      {!collapsed && <div className="p-5">{children}</div>}
    </section>
  )
}
