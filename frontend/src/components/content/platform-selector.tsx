/**
 * Platform selector for content generation
 */

"use client"

import { Check } from "lucide-react"
import { PLATFORMS } from "@/types"
import { cn } from "@/lib/utils"

interface PlatformSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PLATFORMS.map((platform) => (
        <button
          key={platform.value}
          type="button"
          onClick={() => onChange(platform.value)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors",
            value === platform.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted hover:bg-muted"
          )}
        >
          {platform.label}
          {value === platform.value && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  )
}
