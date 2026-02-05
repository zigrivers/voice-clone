/**
 * Twitter Thread Editor - Edit and manage multi-tweet threads
 */

"use client"

import { useState, useCallback } from "react"
import {
  Plus,
  Trash2,
  GripVertical,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Tweet {
  id: string
  content: string
}

interface TwitterThreadEditorProps {
  initialContent?: string
  onChange?: (tweets: string[]) => void
  onSave?: (tweets: string[]) => Promise<void>
  isSaving?: boolean
  maxTweets?: number
}

const MAX_TWEET_LENGTH = 280

export function TwitterThreadEditor({
  initialContent = "",
  onChange,
  onSave,
  isSaving,
  maxTweets = 25,
}: TwitterThreadEditorProps) {
  const [tweets, setTweets] = useState<Tweet[]>(() => {
    // Parse initial content into tweets
    if (!initialContent) {
      return [{ id: crypto.randomUUID(), content: "" }]
    }

    // Try to split by common thread markers
    const parts = initialContent
      .split(/\n{2,}|(?:^|\n)(?:\d+[.\/)]|\[\d+\]|Thread:)/gi)
      .map((s) => s.trim())
      .filter(Boolean)

    if (parts.length > 1) {
      return parts.map((content) => ({
        id: crypto.randomUUID(),
        content,
      }))
    }

    // If no markers, try to split intelligently at sentence boundaries near 280 chars
    const sentences = initialContent.match(/[^.!?]+[.!?]+/g) || [initialContent]
    const smartTweets: Tweet[] = []
    let current = ""

    for (const sentence of sentences) {
      if ((current + sentence).length <= MAX_TWEET_LENGTH) {
        current += sentence
      } else {
        if (current) {
          smartTweets.push({ id: crypto.randomUUID(), content: current.trim() })
        }
        current = sentence
      }
    }
    if (current) {
      smartTweets.push({ id: crypto.randomUUID(), content: current.trim() })
    }

    return smartTweets.length > 0 ? smartTweets : [{ id: crypto.randomUUID(), content: initialContent }]
  })

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const updateTweets = useCallback(
    (newTweets: Tweet[]) => {
      setTweets(newTweets)
      onChange?.(newTweets.map((t) => t.content))
    },
    [onChange]
  )

  const handleTweetChange = (id: string, content: string) => {
    updateTweets(tweets.map((t) => (t.id === id ? { ...t, content } : t)))
  }

  const addTweet = (afterIndex: number) => {
    if (tweets.length >= maxTweets) return
    const newTweets = [...tweets]
    newTweets.splice(afterIndex + 1, 0, { id: crypto.randomUUID(), content: "" })
    updateTweets(newTweets)
  }

  const removeTweet = (id: string) => {
    if (tweets.length <= 1) return
    updateTweets(tweets.filter((t) => t.id !== id))
  }

  const copyTweet = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newTweets = [...tweets]
    const [dragged] = newTweets.splice(draggedIndex, 1)
    newTweets.splice(index, 0, dragged)
    setDraggedIndex(index)
    updateTweets(newTweets)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const splitTweet = (id: string) => {
    const tweet = tweets.find((t) => t.id === id)
    if (!tweet || tweet.content.length <= MAX_TWEET_LENGTH) return

    // Split at sentence boundary closest to middle
    const content = tweet.content
    const midpoint = Math.floor(content.length / 2)
    const sentenceBreaks = [...content.matchAll(/[.!?]\s+/g)]

    let bestBreak = midpoint
    let minDiff = Infinity

    for (const match of sentenceBreaks) {
      const pos = match.index! + match[0].length
      const diff = Math.abs(pos - midpoint)
      if (diff < minDiff) {
        minDiff = diff
        bestBreak = pos
      }
    }

    const index = tweets.findIndex((t) => t.id === id)
    const newTweets = [...tweets]
    newTweets[index] = { ...tweet, content: content.slice(0, bestBreak).trim() }
    newTweets.splice(index + 1, 0, {
      id: crypto.randomUUID(),
      content: content.slice(bestBreak).trim(),
    })
    updateTweets(newTweets)
  }

  const totalCharacters = tweets.reduce((sum, t) => sum + t.content.length, 0)
  const overLimitCount = tweets.filter((t) => t.content.length > MAX_TWEET_LENGTH).length

  return (
    <div className="space-y-4">
      {/* Thread Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            {tweets.length} tweet{tweets.length !== 1 ? "s" : ""}
          </span>
          <span className="text-muted-foreground">
            {totalCharacters} total characters
          </span>
        </div>
        {overLimitCount > 0 && (
          <div className="flex items-center gap-1 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>{overLimitCount} over limit</span>
          </div>
        )}
      </div>

      {/* Tweet List */}
      <div className="space-y-3">
        {tweets.map((tweet, index) => {
          const charCount = tweet.content.length
          const isOverLimit = charCount > MAX_TWEET_LENGTH
          const percentage = Math.min((charCount / MAX_TWEET_LENGTH) * 100, 100)

          return (
            <div
              key={tweet.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group relative border rounded-lg transition-all",
                draggedIndex === index && "opacity-50",
                isOverLimit && "border-destructive"
              )}
            >
              {/* Drag Handle & Tweet Number */}
              <div className="absolute left-2 top-3 flex items-center gap-1">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <span className="text-xs font-medium text-muted-foreground">
                  {index + 1}/{tweets.length}
                </span>
              </div>

              {/* Tweet Content */}
              <div className="pl-16 pr-4 pt-2 pb-2">
                <Textarea
                  value={tweet.content}
                  onChange={(e) => handleTweetChange(tweet.id, e.target.value)}
                  placeholder={index === 0 ? "Start your thread..." : "Continue..."}
                  rows={3}
                  className="resize-none border-0 shadow-none focus-visible:ring-0 p-0"
                />

                {/* Character Counter */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {/* Progress Ring */}
                    <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${percentage * 0.5} 50`}
                        className={cn(
                          isOverLimit ? "text-destructive" : "text-primary"
                        )}
                      />
                    </svg>
                    <span
                      className={cn(
                        "text-xs",
                        isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
                      )}
                    >
                      {charCount}/{MAX_TWEET_LENGTH}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOverLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => splitTweet(tweet.id)}
                        className="h-7 text-xs"
                      >
                        Split
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyTweet(tweet.content, tweet.id)}
                    >
                      {copiedId === tweet.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    {tweets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeTweet(tweet.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Tweet Button */}
              {index < tweets.length - 1 && (
                <button
                  onClick={() => addTweet(index)}
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Tweet at End */}
      {tweets.length < maxTweets && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => addTweet(tweets.length - 1)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tweet
        </Button>
      )}

      {/* Save Button */}
      {onSave && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => onSave(tweets.map((t) => t.content))}
            disabled={isSaving || overLimitCount > 0}
          >
            {isSaving ? "Saving..." : "Save Thread"}
          </Button>
        </div>
      )}
    </div>
  )
}

// Utility to format thread for posting
export function formatThreadForPosting(tweets: string[]): string {
  return tweets
    .map((tweet, i) => `${i + 1}/${tweets.length}\n\n${tweet}`)
    .join("\n\n---\n\n")
}

// Utility to estimate reading time
export function estimateThreadReadTime(tweets: string[]): number {
  const totalWords = tweets.join(" ").split(/\s+/).length
  return Math.ceil(totalWords / 200) // ~200 words per minute
}
