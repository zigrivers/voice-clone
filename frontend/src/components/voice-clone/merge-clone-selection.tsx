/**
 * Merge clone selection component
 */

"use client"

import { X } from "lucide-react"
import type { VoiceClone } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfidenceBadge } from "./confidence-badge"
import { cn } from "@/lib/utils"

interface MergeCloneSelectionProps {
  clones: VoiceClone[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  maxSelections?: number
  minSelections?: number
}

export function MergeCloneSelection({
  clones,
  selectedIds,
  onSelect,
  onRemove,
  maxSelections = 5,
  minSelections = 2,
}: MergeCloneSelectionProps) {
  const availableClones = clones.filter(
    (c) => !selectedIds.includes(c.id) && c.current_dna_id
  )
  const selectedClones = clones.filter((c) => selectedIds.includes(c.id))
  const canAddMore = selectedIds.length < maxSelections

  return (
    <div className="space-y-6">
      {/* Selected Clones */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Voice Clones</CardTitle>
          <CardDescription>
            Select {minSelections}-{maxSelections} voice clones to merge.
            Currently selected: {selectedIds.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedClones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No voice clones selected yet. Select from the list below.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedClones.map((clone, index) => (
                <div
                  key={clone.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{clone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {clone.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge
                      score={clone.confidence_score}
                      size="sm"
                      showLabel={false}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(clone.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Clones */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voice Clones</CardTitle>
          <CardDescription>
            Only voice clones with analyzed DNA can be merged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableClones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {clones.filter((c) => !c.current_dna_id).length > 0
                ? "All available clones are selected, or need DNA analysis first."
                : "No voice clones available for merging."}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableClones.map((clone) => (
                <button
                  key={clone.id}
                  onClick={() => canAddMore && onSelect(clone.id)}
                  disabled={!canAddMore}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border text-left transition-colors",
                    canAddMore
                      ? "hover:bg-muted cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div>
                    <p className="font-medium">{clone.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {clone.description || "No description"}
                    </p>
                  </div>
                  <ConfidenceBadge
                    score={clone.confidence_score}
                    size="sm"
                    showLabel={false}
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
