/**
 * Content generation results view with editing and actions
 */

"use client"

import { useState } from "react"
import { Copy, Check, Save, RefreshCw, Loader2 } from "lucide-react"
import type { GenerationResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DetectionScore } from "./detection-score"
import { useToast } from "@/hooks/use-toast"

interface ContentResultsProps {
  result: GenerationResponse
  onSave?: (text: string) => Promise<void>
  onRegenerate?: (feedback?: string) => Promise<void>
  isSaving?: boolean
  isRegenerating?: boolean
}

export function ContentResults({
  result,
  onSave,
  onRegenerate,
  isSaving,
  isRegenerating,
}: ContentResultsProps) {
  const { toast } = useToast()
  const [content, setContent] = useState(result.content_text)
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)

  const hasChanges = content !== result.content_text

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(content)
      setIsEditing(false)
    }
  }

  const handleRegenerate = async () => {
    if (onRegenerate) {
      await onRegenerate(feedback || undefined)
      setFeedback("")
      setShowFeedback(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Content */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Platform: {result.platform}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {onSave && hasChanges && (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
              />
            ) : (
              <div
                className="prose prose-sm max-w-none cursor-pointer hover:bg-muted/50 p-4 rounded-md -m-4 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <p className="whitespace-pre-wrap">{content}</p>
              </div>
            )}
            {isEditing && (
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setContent(result.content_text)
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 text-right">
              Click to edit
            </p>
          </CardContent>
        </Card>

        {/* Regenerate Section */}
        {onRegenerate && (
          <Card>
            <CardContent className="pt-6">
              {showFeedback ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="What would you like to change? (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Regenerate
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowFeedback(false)
                        setFeedback("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowFeedback(true)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate with Feedback
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detection Score Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Detection Score</CardTitle>
            <CardDescription>
              How human-like does this content appear?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DetectionScore
              score={result.detection_score ?? 0}
              breakdown={result.detection_breakdown}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
