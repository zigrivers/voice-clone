/**
 * Content Creator Page
 */

"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VoiceCloneSelector } from "@/components/content/voice-clone-selector"
import { PlatformSelector } from "@/components/content/platform-selector"
import {
  PropertiesPanel,
  type ContentProperties,
} from "@/components/content/properties-panel"
import { ContentResults } from "@/components/content/content-results"
import {
  useGenerateContent,
  useRegenerateContent,
  useUpdateContent,
} from "@/hooks/use-content"
import { useToast } from "@/hooks/use-toast"
import type { GenerationResponse } from "@/types"

export default function CreateContentPage() {
  const { toast } = useToast()
  const generateContent = useGenerateContent()
  const regenerateContent = useRegenerateContent()
  const updateContent = useUpdateContent()

  const [voiceCloneId, setVoiceCloneId] = useState("")
  const [platform, setPlatform] = useState("linkedin")
  const [inputText, setInputText] = useState("")
  const [properties, setProperties] = useState<ContentProperties>({
    length: "medium",
  })
  const [result, setResult] = useState<GenerationResponse | null>(null)

  const canGenerate =
    voiceCloneId && platform && inputText.trim().length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return

    try {
      const response = await generateContent.mutateAsync({
        data: {
          voice_clone_id: voiceCloneId,
          platform,
          input_text: inputText,
          length: properties.length,
          tone_override: properties.tone_override || undefined,
          target_audience: properties.target_audience || undefined,
          cta_style: properties.cta_style || undefined,
        },
      })
      setResult(response)
      toast({
        title: "Content generated!",
        description: "Your content has been created with your voice.",
      })
    } catch {
      toast({
        title: "Generation failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRegenerate = async (feedback?: string) => {
    if (!result) return

    try {
      const response = await regenerateContent.mutateAsync({
        contentId: result.id,
        feedback,
      })
      setResult(response)
      toast({
        title: "Content regenerated!",
        description: "Your content has been updated.",
      })
    } catch {
      toast({
        title: "Regeneration failed",
        description: "Failed to regenerate content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (text: string) => {
    if (!result) return

    try {
      await updateContent.mutateAsync({
        id: result.id,
        data: { content_text: text },
      })
      toast({
        title: "Content saved!",
        description: "Your changes have been saved to the library.",
      })
    } catch {
      toast({
        title: "Save failed",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNewContent = () => {
    setResult(null)
    setInputText("")
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Content Created
            </h1>
            <p className="text-muted-foreground">
              Review, edit, and save your generated content.
            </p>
          </div>
          <Button variant="outline" onClick={handleNewContent}>
            Create New
          </Button>
        </div>

        <ContentResults
          result={result}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          isSaving={updateContent.isPending}
          isRegenerating={regenerateContent.isPending}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Content</h1>
        <p className="text-muted-foreground">
          Generate content using your voice clones.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voice Clone Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Clone</CardTitle>
              <CardDescription>
                Select the voice you want to write in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceCloneSelector
                value={voiceCloneId}
                onChange={setVoiceCloneId}
              />
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Platform</CardTitle>
              <CardDescription>
                Choose where this content will be published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformSelector value={platform} onChange={setPlatform} />
            </CardContent>
          </Card>

          {/* Content Input */}
          <Card>
            <CardHeader>
              <CardTitle>What to Write</CardTitle>
              <CardDescription>
                Describe what you want to communicate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Write a post about the importance of work-life balance for entrepreneurs, mentioning my experience running a startup for 5 years..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Be specific about the topic, key points, and any personal
                  experiences to include.
                </span>
                <span>{inputText.length} characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <PropertiesPanel value={properties} onChange={setProperties} />

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={!canGenerate || generateContent.isPending}
          >
            {generateContent.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Content
              </>
            )}
          </Button>
        </div>

        {/* Sidebar Tips */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Great Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Be Specific</p>
                <p className="text-muted-foreground">
                  Include concrete details, examples, and personal anecdotes.
                </p>
              </div>
              <div>
                <p className="font-medium">Set Context</p>
                <p className="text-muted-foreground">
                  Mention your audience and what action you want them to take.
                </p>
              </div>
              <div>
                <p className="font-medium">Use Your Voice Clone</p>
                <p className="text-muted-foreground">
                  Choose a voice clone with a high confidence score for best
                  results.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Generate</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Cmd/Ctrl + Enter
                </kbd>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
