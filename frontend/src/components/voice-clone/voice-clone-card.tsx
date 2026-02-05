/**
 * Voice clone card component for grid/list display
 */

"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Pencil, Trash2, GitMerge } from "lucide-react"
import type { VoiceClone } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfidenceBadge } from "./confidence-badge"

interface VoiceCloneCardProps {
  clone: VoiceClone
  onDelete?: (id: string) => void
}

export function VoiceCloneCard({ clone, onDelete }: VoiceCloneCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <Link href={`/voice-clones/${clone.id}`}>
              <CardTitle className="text-lg hover:underline truncate">
                {clone.name}
              </CardTitle>
            </Link>
            <CardDescription className="line-clamp-2">
              {clone.description || "No description"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/voice-clones/${clone.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(clone.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConfidenceBadge score={clone.confidence_score} size="sm" />
            {clone.is_merged && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <GitMerge className="h-3 w-3" />
                Merged
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(clone.created_at), { addSuffix: true })}
          </span>
        </div>
        {clone.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {clone.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {clone.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{clone.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
