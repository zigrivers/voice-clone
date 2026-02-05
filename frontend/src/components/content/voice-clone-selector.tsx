/**
 * Voice clone selector dropdown for content generation
 */

"use client"

import { ChevronDown, Check } from "lucide-react"
import { useVoiceClones } from "@/hooks/use-voice-clones"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfidenceBadge } from "@/components/voice-clone/confidence-badge"
import { cn } from "@/lib/utils"

interface VoiceCloneSelectorProps {
  value?: string
  onChange: (value: string) => void
}

export function VoiceCloneSelector({
  value,
  onChange,
}: VoiceCloneSelectorProps) {
  const { data, isLoading } = useVoiceClones()
  const clones = data?.items ?? []

  const selectedClone = clones.find((c) => c.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            "Loading..."
          ) : selectedClone ? (
            <span className="flex items-center gap-2">
              <span className="truncate">{selectedClone.name}</span>
              <ConfidenceBadge
                score={selectedClone.confidence_score}
                size="sm"
                showLabel={false}
              />
            </span>
          ) : (
            "Select a voice clone"
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]">
        {clones.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No voice clones available.
            <br />
            Create one first!
          </div>
        ) : (
          clones.map((clone) => (
            <DropdownMenuItem
              key={clone.id}
              onClick={() => onChange(clone.id)}
              className={cn(
                "flex items-center justify-between",
                value === clone.id && "bg-accent"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{clone.name}</span>
                {clone.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {clone.description}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge
                  score={clone.confidence_score}
                  size="sm"
                  showLabel={false}
                />
                {value === clone.id && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
