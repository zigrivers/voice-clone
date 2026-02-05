/**
 * Voice DNA viewer component with accordion display
 */

"use client"

import type { VoiceDna, VoiceDnaData } from "@/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DnaViewerProps {
  dna: VoiceDna
}

const dnaElementLabels: Record<keyof VoiceDnaData, string> = {
  vocabulary_patterns: "Vocabulary Patterns",
  sentence_structure: "Sentence Structure",
  paragraph_structure: "Paragraph Structure",
  tone_markers: "Tone Markers",
  rhetorical_devices: "Rhetorical Devices",
  punctuation_habits: "Punctuation Habits",
  opening_patterns: "Opening Patterns",
  closing_patterns: "Closing Patterns",
  humor_and_personality: "Humor & Personality",
  distinctive_signatures: "Distinctive Signatures",
}

const dnaElementDescriptions: Record<keyof VoiceDnaData, string> = {
  vocabulary_patterns: "Word choice patterns and frequently used phrases",
  sentence_structure: "How sentences are constructed and varied",
  paragraph_structure: "Organization and flow between paragraphs",
  tone_markers: "Emotional cues and formality indicators",
  rhetorical_devices: "Persuasive techniques and literary devices",
  punctuation_habits: "Use of punctuation for rhythm and emphasis",
  opening_patterns: "How pieces typically begin",
  closing_patterns: "How pieces typically conclude",
  humor_and_personality: "Wit, warmth, and personal voice elements",
  distinctive_signatures: "Unique markers that identify this voice",
}

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Not analyzed</span>
  }

  if (typeof value === "string") {
    return <p className="text-sm">{value}</p>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground italic">None found</span>
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.map((item, i) => (
          <li key={i} className="text-sm">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(value).map(([key, val]) => (
          <div key={key}>
            <span className="text-sm font-medium capitalize">
              {key.replace(/_/g, " ")}:
            </span>{" "}
            <span className="text-sm text-muted-foreground">
              {typeof val === "string" ? val : JSON.stringify(val)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return <span className="text-sm">{String(value)}</span>
}

export function DnaViewer({ dna }: DnaViewerProps) {
  const elements = Object.entries(dna.dna_data) as [
    keyof VoiceDnaData,
    unknown
  ][]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice DNA</CardTitle>
        <CardDescription>
          Version {dna.version} • Analyzed{" "}
          {new Date(dna.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {elements.map(([key, value]) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-sm">
                <div className="flex flex-col items-start text-left">
                  <span>{dnaElementLabels[key]}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {dnaElementDescriptions[key]}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4 border-l-2 border-muted">
                  {renderValue(value)}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
