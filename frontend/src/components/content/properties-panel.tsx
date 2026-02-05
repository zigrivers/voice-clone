/**
 * Collapsible properties panel for content generation options
 */

"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ContentProperties {
  length: "short" | "medium" | "long"
  tone_override?: string
  target_audience?: string
  cta_style?: string
}

interface PropertiesPanelProps {
  value: ContentProperties
  onChange: (value: ContentProperties) => void
}

const LENGTH_OPTIONS = [
  { value: "short" as const, label: "Short", description: "1-2 paragraphs" },
  { value: "medium" as const, label: "Medium", description: "3-4 paragraphs" },
  { value: "long" as const, label: "Long", description: "5+ paragraphs" },
]

export function PropertiesPanel({ value, onChange }: PropertiesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateProperty = <K extends keyof ContentProperties>(
    key: K,
    propValue: ContentProperties[K]
  ) => {
    onChange({ ...value, [key]: propValue })
  }

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <span className="font-medium">Advanced Options</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          {/* Length */}
          <div className="space-y-2">
            <Label>Content Length</Label>
            <div className="flex gap-2">
              {LENGTH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateProperty("length", option.value)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                    value.length === option.value
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Override */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tone Override (optional)</Label>
            <Input
              id="tone"
              placeholder="e.g., more casual, formal, enthusiastic"
              value={value.tone_override ?? ""}
              onChange={(e) => updateProperty("tone_override", e.target.value)}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience (optional)</Label>
            <Input
              id="audience"
              placeholder="e.g., marketing professionals, tech enthusiasts"
              value={value.target_audience ?? ""}
              onChange={(e) =>
                updateProperty("target_audience", e.target.value)
              }
            />
          </div>

          {/* CTA Style */}
          <div className="space-y-2">
            <Label htmlFor="cta">Call-to-Action Style (optional)</Label>
            <Input
              id="cta"
              placeholder="e.g., soft suggestion, direct ask, question"
              value={value.cta_style ?? ""}
              onChange={(e) => updateProperty("cta_style", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
