/**
 * Element weight configuration for merge clones
 */

"use client"

import { useState } from "react"
import type { VoiceClone } from "@/types"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DNA_ELEMENTS = [
  { key: "vocabulary_patterns", label: "Vocabulary Patterns" },
  { key: "sentence_structure", label: "Sentence Structure" },
  { key: "paragraph_structure", label: "Paragraph Structure" },
  { key: "tone_markers", label: "Tone Markers" },
  { key: "rhetorical_devices", label: "Rhetorical Devices" },
  { key: "punctuation_habits", label: "Punctuation Habits" },
  { key: "opening_patterns", label: "Opening Patterns" },
  { key: "closing_patterns", label: "Closing Patterns" },
  { key: "humor_and_personality", label: "Humor & Personality" },
  { key: "distinctive_signatures", label: "Distinctive Signatures" },
] as const

type ElementKey = (typeof DNA_ELEMENTS)[number]["key"]

export interface ElementWeights {
  [cloneId: string]: {
    [element: string]: number
  }
}

interface ElementWeightConfigProps {
  clones: VoiceClone[]
  weights: ElementWeights
  onChange: (weights: ElementWeights) => void
}

export function ElementWeightConfig({
  clones,
  weights,
  onChange,
}: ElementWeightConfigProps) {
  const [activeElement, setActiveElement] = useState<ElementKey>(
    DNA_ELEMENTS[0].key
  )

  const updateWeight = (cloneId: string, element: string, value: number) => {
    const newWeights = { ...weights }
    if (!newWeights[cloneId]) {
      newWeights[cloneId] = {}
    }
    newWeights[cloneId][element] = value
    onChange(newWeights)
  }

  const getWeightForClone = (cloneId: string, element: string): number => {
    return weights[cloneId]?.[element] ?? Math.floor(100 / clones.length)
  }

  const getTotalWeight = (element: string): number => {
    return clones.reduce(
      (sum, clone) => sum + getWeightForClone(clone.id, element),
      0
    )
  }

  const isValidTotal = (element: string): boolean => {
    const total = getTotalWeight(element)
    return total >= 95 && total <= 105 // Allow small variance
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Element Weights</CardTitle>
        <CardDescription>
          Adjust how much each voice clone contributes to each DNA element.
          Weights should total approximately 100% for each element.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Element Tabs */}
        <div className="flex flex-wrap gap-2">
          {DNA_ELEMENTS.map((element) => {
            const isValid = isValidTotal(element.key)
            return (
              <button
                key={element.key}
                onClick={() => setActiveElement(element.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeElement === element.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80",
                  !isValid && activeElement !== element.key && "ring-2 ring-destructive"
                )}
              >
                {element.label}
              </button>
            )
          })}
        </div>

        {/* Weight Sliders */}
        <div className="space-y-4">
          {clones.map((clone) => {
            const weight = getWeightForClone(clone.id, activeElement)
            return (
              <div key={clone.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{clone.name}</Label>
                  <span className="text-sm text-muted-foreground">
                    {weight}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e) =>
                    updateWeight(clone.id, activeElement, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border",
            isValidTotal(activeElement)
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          <span className="font-medium">Total</span>
          <span className="font-bold">{getTotalWeight(activeElement)}%</span>
        </div>

        {!isValidTotal(activeElement) && (
          <p className="text-sm text-destructive">
            Weights should total approximately 100%. Current total:{" "}
            {getTotalWeight(activeElement)}%
          </p>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const equalWeight = Math.floor(100 / clones.length)
              const newWeights = { ...weights }
              clones.forEach((clone) => {
                if (!newWeights[clone.id]) newWeights[clone.id] = {}
                newWeights[clone.id][activeElement] = equalWeight
              })
              // Adjust first clone to ensure total is 100
              if (clones.length > 0) {
                const remainder = 100 - equalWeight * clones.length
                newWeights[clones[0].id][activeElement] = equalWeight + remainder
              }
              onChange(newWeights)
            }}
            className="text-sm text-primary hover:underline"
          >
            Distribute Equally
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => {
              const equalWeight = Math.floor(100 / clones.length)
              const newWeights: ElementWeights = {}
              DNA_ELEMENTS.forEach((element) => {
                clones.forEach((clone) => {
                  if (!newWeights[clone.id]) newWeights[clone.id] = {}
                  newWeights[clone.id][element.key] = equalWeight
                })
                // Adjust first clone
                if (clones.length > 0) {
                  const remainder = 100 - equalWeight * clones.length
                  newWeights[clones[0].id][element.key] = equalWeight + remainder
                }
              })
              onChange(newWeights)
            }}
            className="text-sm text-primary hover:underline"
          >
            Reset All to Equal
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
