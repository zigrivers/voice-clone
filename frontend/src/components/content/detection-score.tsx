/**
 * AI Detection score display component
 */

"use client"

import { HelpCircle } from "lucide-react"
import type { DetectionBreakdown } from "@/types"
import { cn } from "@/lib/utils"

interface DetectionScoreProps {
  score: number
  breakdown?: DetectionBreakdown
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
}

const breakdownLabels: Record<keyof DetectionBreakdown, string> = {
  sentence_variety: "Sentence Variety",
  vocabulary_diversity: "Vocabulary Diversity",
  specificity: "Specificity",
  transition_naturalness: "Natural Transitions",
  opening_closing: "Opening/Closing",
  punctuation: "Punctuation",
  personality: "Personality",
  structure: "Structure",
}

const breakdownMaxScores: Record<keyof DetectionBreakdown, number> = {
  sentence_variety: 20,
  vocabulary_diversity: 15,
  specificity: 15,
  transition_naturalness: 10,
  opening_closing: 10,
  punctuation: 10,
  personality: 10,
  structure: 10,
}

export function DetectionScore({
  score,
  breakdown,
  showDetails = true,
  size = "md",
}: DetectionScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600"
    if (s >= 60) return "text-yellow-600"
    if (s >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Highly Human"
    if (s >= 60) return "Mostly Human"
    if (s >= 40) return "Mixed Signals"
    return "AI-like"
  }

  const getBarColor = (s: number) => {
    if (s >= 80) return "bg-green-500"
    if (s >= 60) return "bg-yellow-500"
    if (s >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  }

  return (
    <div className="space-y-4">
      {/* Main Score */}
      <div className="text-center">
        <div className={cn("font-bold", sizeClasses[size], getScoreColor(score))}>
          {score}
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <span className={getScoreColor(score)}>{getScoreLabel(score)}</span>
          <HelpCircle className="h-3 w-3" />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Higher = more human-like writing
        </div>
      </div>

      {/* Score Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown */}
      {showDetails && breakdown && (
        <div className="space-y-2 pt-2">
          <div className="text-sm font-medium">Score Breakdown</div>
          <div className="grid gap-2">
            {(Object.entries(breakdown) as [keyof DetectionBreakdown, number][]).map(
              ([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {breakdownLabels[key]}
                    </span>
                    <span>
                      {value}/{breakdownMaxScores[key]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        getBarColor((value / breakdownMaxScores[key]) * 100)
                      )}
                      style={{
                        width: `${(value / breakdownMaxScores[key]) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
