/**
 * Writing sample list component
 */

"use client"

import { formatDistanceToNow } from "date-fns"
import { FileText, Link2, ClipboardPaste, Trash2 } from "lucide-react"
import type { WritingSample, SourceType } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SampleListProps {
  samples: WritingSample[]
  onDelete?: (id: string) => void
  isDeleting?: boolean
}

const sourceTypeIcons: Record<SourceType, typeof FileText> = {
  paste: ClipboardPaste,
  file: FileText,
  url: Link2,
}

const sourceTypeLabels: Record<SourceType, string> = {
  paste: "Pasted text",
  file: "Uploaded file",
  url: "Web content",
}

export function SampleList({ samples, onDelete, isDeleting }: SampleListProps) {
  if (samples.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No writing samples yet. Add some samples to analyze your voice.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {samples.map((sample) => {
        const Icon = sourceTypeIcons[sample.source_type]
        return (
          <Card key={sample.id}>
            <CardHeader className="py-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {sample.original_filename ||
                        sample.source_url ||
                        sourceTypeLabels[sample.source_type]}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {sample.word_count.toLocaleString()} words
                      {" • "}
                      {formatDistanceToNow(new Date(sample.created_at), {
                        addSuffix: true,
                      })}
                    </CardDescription>
                  </div>
                </div>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(sample.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete sample</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {sample.content.slice(0, 200)}
                {sample.content.length > 200 && "..."}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
