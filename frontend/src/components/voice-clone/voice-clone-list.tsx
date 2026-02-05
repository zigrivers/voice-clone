/**
 * Voice clone list component with grid/list view and filtering
 */

"use client"

import { useState, useMemo } from "react"
import { Grid3X3, List, Search, Plus } from "lucide-react"
import Link from "next/link"
import type { VoiceClone } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoiceCloneCard } from "./voice-clone-card"
import { cn } from "@/lib/utils"

interface VoiceCloneListProps {
  clones: VoiceClone[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

type ViewMode = "grid" | "list"

export function VoiceCloneList({
  clones,
  isLoading,
  onDelete,
}: VoiceCloneListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Extract all unique tags from clones
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    clones.forEach((clone) => clone.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [clones])

  // Filter clones based on search and tags
  const filteredClones = useMemo(() => {
    return clones.filter((clone) => {
      const matchesSearch =
        !searchQuery ||
        clone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clone.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => clone.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [clones, searchQuery, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with search and view toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search voice clones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
          <Button asChild>
            <Link href="/voice-clones/new">
              <Plus className="mr-2 h-4 w-4" />
              New Clone
            </Link>
          </Button>
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground py-1">Filter:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors",
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredClones.length} of {clones.length} voice clone
        {clones.length !== 1 ? "s" : ""}
      </div>

      {/* Clone grid/list */}
      {filteredClones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            {clones.length === 0
              ? "No voice clones yet. Create your first one!"
              : "No voice clones match your filters."}
          </p>
          {clones.length === 0 && (
            <Button asChild>
              <Link href="/voice-clones/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Voice Clone
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          )}
        >
          {filteredClones.map((clone) => (
            <VoiceCloneCard key={clone.id} clone={clone} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
