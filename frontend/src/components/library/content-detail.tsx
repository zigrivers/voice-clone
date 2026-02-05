/**
 * Content detail modal component
 */

"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Copy, Check, Pencil, Save, X, Loader2 } from "lucide-react"
import type { Content, ContentStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DetectionScore } from "@/components/content/detection-score"
import { useToast } from "@/hooks/use-toast"

interface ContentDetailProps {
  content: Content | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (id: string, text: string) => Promise<void>
  onStatusChange?: (id: string, status: ContentStatus) => Promise<void>
  isSaving?: boolean
}

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  facebook: "Facebook",
  instagram: "Instagram",
  email: "Email",
  blog: "Blog",
  sms: "SMS",
}

export function ContentDetail({
  content,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: ContentDetailProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState("")
  const [copied, setCopied] = useState(false)

  if (!content) return null

  const handleStartEdit = () => {
    setEditedText(content.content_text)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedText("")
  }

  const handleSave = async () => {
    if (onSave && editedText !== content.content_text) {
      await onSave(content.id, editedText)
    }
    setIsEditing(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content.content_text)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Content Details</DialogTitle>
          <DialogDescription>
            {platformLabels[content.platform] || content.platform} •{" "}
            {formatDistanceToNow(new Date(content.created_at), {
              addSuffix: true,
            })}
            {content.voice_clone_name && ` • Voice: ${content.voice_clone_name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Content Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Content</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {!isEditing && onSave && (
                  <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap text-sm">
                  {content.content_text}
                </p>
              </div>
            )}
          </div>

          {/* Detection Score */}
          {content.detection_score !== undefined && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">AI Detection Score</h4>
              <div className="p-4 border rounded-lg">
                <DetectionScore
                  score={content.detection_score}
                  breakdown={content.detection_breakdown}
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Original Input */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Original Input</h4>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {content.input_text}
              </p>
            </div>
          </div>

          {/* Properties Used */}
          {content.properties_used && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Generation Properties</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {content.properties_used.length && (
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="capitalize">
                      {content.properties_used.length}
                    </span>
                  </div>
                )}
                {content.properties_used.tone_override && (
                  <div>
                    <span className="text-muted-foreground">Tone: </span>
                    <span>{content.properties_used.tone_override}</span>
                  </div>
                )}
                {content.properties_used.target_audience && (
                  <div>
                    <span className="text-muted-foreground">Audience: </span>
                    <span>{content.properties_used.target_audience}</span>
                  </div>
                )}
                {content.properties_used.cta_style && (
                  <div>
                    <span className="text-muted-foreground">CTA Style: </span>
                    <span>{content.properties_used.cta_style}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
