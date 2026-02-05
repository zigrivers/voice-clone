/**
 * Content library filters component
 */

"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PLATFORMS, ContentStatus } from "@/types"
import { cn } from "@/lib/utils"

export interface ContentFiltersState {
  search: string
  platform: string
  status: string
  voiceCloneId: string
}

interface ContentFiltersProps {
  filters: ContentFiltersState
  onChange: (filters: ContentFiltersState) => void
  voiceClones?: { id: string; name: string }[]
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: ContentStatus.DRAFT, label: "Draft" },
  { value: ContentStatus.READY, label: "Ready" },
  { value: ContentStatus.PUBLISHED, label: "Published" },
  { value: ContentStatus.ARCHIVED, label: "Archived" },
]

export function ContentFilters({
  filters,
  onChange,
  voiceClones = [],
}: ContentFiltersProps) {
  const updateFilter = (key: keyof ContentFiltersState, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onChange({
      search: "",
      platform: "",
      status: "",
      voiceCloneId: "",
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.platform ||
    filters.status ||
    filters.voiceCloneId

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search content..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Platform Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Platform</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter("platform", "")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !filters.platform
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {PLATFORMS.map((platform) => (
            <button
              key={platform.value}
              onClick={() => updateFilter("platform", platform.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.platform === platform.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("status", option.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.status === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Clone Filter */}
      {voiceClones.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice Clone</label>
          <select
            value={filters.voiceCloneId}
            onChange={(e) => updateFilter("voiceCloneId", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Voice Clones</option>
            {voiceClones.map((clone) => (
              <option key={clone.id} value={clone.id}>
                {clone.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
