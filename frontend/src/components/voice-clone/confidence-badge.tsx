/**
 * Confidence score badge component
 */

import { cn } from "@/lib/utils"

interface ConfidenceBadgeProps {
  score: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ConfidenceBadge({
  score,
  showLabel = true,
  size = "md",
  className,
}: ConfidenceBadgeProps) {
  const getColorClass = (score: number) => {
    if (score >= 80) return "bg-green-500/10 text-green-600 border-green-500/20"
    if (score >= 60) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    if (score >= 40) return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    return "bg-red-500/10 text-red-600 border-red-500/20"
  }

  const getLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Work"
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        getColorClass(score),
        sizeClasses[size],
        className
      )}
    >
      <span className="font-bold">{score}</span>
      {showLabel && <span className="opacity-75">- {getLabel(score)}</span>}
    </span>
  )
}
