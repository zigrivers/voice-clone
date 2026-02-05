/**
 * Merge Voice Clones Page
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, GitMerge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MergeCloneSelection } from "@/components/voice-clone/merge-clone-selection"
import {
  ElementWeightConfig,
  type ElementWeights,
} from "@/components/voice-clone/element-weight-config"
import { useVoiceClones, useMergeVoiceClones } from "@/hooks/use-voice-clones"
import { useToast } from "@/hooks/use-toast"

type Step = "select" | "configure" | "details"

export default function MergeVoiceClonesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: voiceClonesData, isLoading } = useVoiceClones()
  const mergeClones = useMergeVoiceClones()

  const [step, setStep] = useState<Step>("select")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [weights, setWeights] = useState<ElementWeights>({})
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const clones = voiceClonesData?.items ?? []
  const selectedClones = clones.filter((c) => selectedIds.includes(c.id))

  const canProceedToConfig = selectedIds.length >= 2 && selectedIds.length <= 5
  const canProceedToDetails = Object.keys(weights).length === selectedIds.length
  const canMerge = name.trim().length > 0

  const handleSelect = (id: string) => {
    if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id))
    const newWeights = { ...weights }
    delete newWeights[id]
    setWeights(newWeights)
  }

  const handleMerge = async () => {
    if (!canMerge) return

    try {
      const sources = selectedIds.map((id) => ({
        voice_clone_id: id,
        element_weights: weights[id] || {},
      }))

      const newClone = await mergeClones.mutateAsync({
        data: {
          name,
          description: description || undefined,
          sources,
        },
      })

      toast({
        title: "Voice clones merged!",
        description: `"${name}" has been created from ${selectedIds.length} voice clones.`,
      })

      router.push(`/voice-clones/${newClone.id}`)
    } catch {
      toast({
        title: "Merge failed",
        description: "Failed to merge voice clones. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href="/voice-clones">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Voice Clones
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Merge Voice Clones
        </h1>
        <p className="text-muted-foreground">
          Combine multiple voice clones into a new hybrid voice.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {["select", "configure", "details"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : i < ["select", "configure", "details"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                step === s ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {s === "select" && "Select Clones"}
              {s === "configure" && "Configure Weights"}
              {s === "details" && "Name & Create"}
            </span>
            {i < 2 && (
              <div className="w-8 h-px bg-muted-foreground/25 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === "select" && (
        <>
          <MergeCloneSelection
            clones={clones}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onRemove={handleRemove}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => setStep("configure")}
              disabled={!canProceedToConfig}
            >
              Continue to Configure Weights
            </Button>
          </div>
        </>
      )}

      {step === "configure" && (
        <>
          <ElementWeightConfig
            clones={selectedClones}
            weights={weights}
            onChange={setWeights}
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("select")}>
              Back
            </Button>
            <Button
              onClick={() => setStep("details")}
              disabled={!canProceedToDetails}
            >
              Continue to Name & Create
            </Button>
          </div>
        </>
      )}

      {step === "details" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Name Your Merged Clone</CardTitle>
              <CardDescription>
                Give your new voice clone a name and optional description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Professional + Casual Blend"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this merged voice..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">Merge Summary</p>
                <p className="text-sm text-muted-foreground">
                  Merging {selectedIds.length} voice clones:
                </p>
                <ul className="text-sm list-disc list-inside">
                  {selectedClones.map((clone) => (
                    <li key={clone.id}>{clone.name}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("configure")}>
              Back
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!canMerge || mergeClones.isPending}
            >
              {mergeClones.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <GitMerge className="mr-2 h-4 w-4" />
                  Create Merged Clone
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
