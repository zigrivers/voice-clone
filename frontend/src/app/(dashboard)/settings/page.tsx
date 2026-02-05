/**
 * Settings Page with tabs
 */

"use client"

import { useState } from "react"
import { Save, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  useSettings,
  useUpdateVoiceCloningInstructions,
  useUpdateAntiAiGuidelines,
  useSettingsHistory,
  useRevertSettings,
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AIProviderSettings } from "@/components/settings/ai-provider-settings"
import type { PlatformSettings } from "@/types"

type TabType =
  | "voice-cloning"
  | "anti-ai"
  | "platforms"
  | "ai-providers"

const tabs = [
  {
    id: "voice-cloning" as const,
    label: "Voice Cloning Instructions",
    description: "Configure how AI analyzes writing samples.",
  },
  {
    id: "anti-ai" as const,
    label: "Anti-AI Guidelines",
    description: "Guidelines for human-like content generation.",
  },
  {
    id: "platforms" as const,
    label: "Platform Best Practices",
    description: "Platform-specific content guidelines.",
  },
  {
    id: "ai-providers" as const,
    label: "AI Providers",
    description: "Configure AI provider API keys.",
  },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>("voice-cloning")
  const [voiceCloningInstructions, setVoiceCloningInstructions] = useState("")
  const [antiAiGuidelines, setAntiAiGuidelines] = useState("")
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformSettings | null>(null)
  const [platformPractices, setPlatformPractices] = useState("")

  // Queries
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const { data: vcHistory } = useSettingsHistory("voice_cloning_instructions")
  const { data: aiHistory } = useSettingsHistory("anti_ai_guidelines")
  const { data: platforms, isLoading: platformsLoading } = usePlatformSettings()

  // Mutations
  const updateVoiceCloning = useUpdateVoiceCloningInstructions()
  const updateAntiAi = useUpdateAntiAiGuidelines()
  const revertSettings = useRevertSettings()
  const updatePlatform = useUpdatePlatformSettings()

  // Initialize form values when data loads
  useState(() => {
    if (settings) {
      setVoiceCloningInstructions(settings.voice_cloning_instructions)
      setAntiAiGuidelines(settings.anti_ai_guidelines)
    }
  })

  const handleSaveVoiceCloning = async () => {
    try {
      await updateVoiceCloning.mutateAsync(voiceCloningInstructions)
      toast({
        title: "Saved",
        description: "Voice cloning instructions updated.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAntiAi = async () => {
    try {
      await updateAntiAi.mutateAsync(antiAiGuidelines)
      toast({
        title: "Saved",
        description: "Anti-AI guidelines updated.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRevert = async (historyId: string) => {
    try {
      const result = await revertSettings.mutateAsync(historyId)
      setVoiceCloningInstructions(result.voice_cloning_instructions)
      setAntiAiGuidelines(result.anti_ai_guidelines)
      toast({
        title: "Reverted",
        description: "Settings reverted to previous version.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to revert. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectPlatform = (platform: PlatformSettings) => {
    setSelectedPlatform(platform)
    setPlatformPractices(platform.best_practices)
  }

  const handleSavePlatform = async () => {
    if (!selectedPlatform) return

    try {
      await updatePlatform.mutateAsync({
        platform: selectedPlatform.platform,
        data: { best_practices: platformPractices },
      })
      toast({
        title: "Saved",
        description: `${selectedPlatform.display_name} practices updated.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isLoading = settingsLoading || platformsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your voice cloning and content generation preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      ) : (
        <>
          {/* Voice Cloning Tab */}
          {activeTab === "voice-cloning" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Cloning Instructions</CardTitle>
                    <CardDescription>
                      These instructions guide how AI analyzes writing samples
                      to extract voice characteristics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={
                        voiceCloningInstructions ||
                        settings?.voice_cloning_instructions ||
                        ""
                      }
                      onChange={(e) =>
                        setVoiceCloningInstructions(e.target.value)
                      }
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleSaveVoiceCloning}
                      disabled={updateVoiceCloning.isPending}
                    >
                      {updateVoiceCloning.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Version History</CardTitle>
                    <CardDescription>
                      Last 10 versions are saved.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vcHistory && vcHistory.length > 0 ? (
                      <div className="space-y-2">
                        {vcHistory.slice(0, 5).map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              v{h.version} -{" "}
                              {new Date(h.created_at).toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevert(h.id)}
                              disabled={revertSettings.isPending}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No history yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Anti-AI Tab */}
          {activeTab === "anti-ai" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Anti-AI Detection Guidelines</CardTitle>
                    <CardDescription>
                      Guidelines for making generated content more human-like
                      and less detectable.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={
                        antiAiGuidelines ||
                        settings?.anti_ai_guidelines ||
                        ""
                      }
                      onChange={(e) => setAntiAiGuidelines(e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleSaveAntiAi}
                      disabled={updateAntiAi.isPending}
                    >
                      {updateAntiAi.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiHistory && aiHistory.length > 0 ? (
                      <div className="space-y-2">
                        {aiHistory.slice(0, 5).map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              v{h.version} -{" "}
                              {new Date(h.created_at).toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevert(h.id)}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No history yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Platforms Tab */}
          {activeTab === "platforms" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Platforms</CardTitle>
                    <CardDescription>
                      Select a platform to edit its best practices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {platforms?.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => handleSelectPlatform(platform)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                            selectedPlatform?.id === platform.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <div className="font-medium">
                            {platform.display_name}
                          </div>
                          {platform.is_default && (
                            <span className="text-xs opacity-75">Default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                {selectedPlatform ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedPlatform.display_name}</CardTitle>
                      <CardDescription>
                        Best practices for content on this platform.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={platformPractices}
                        onChange={(e) => setPlatformPractices(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={handleSavePlatform}
                        disabled={updatePlatform.isPending}
                      >
                        {updatePlatform.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Select a platform to view and edit its best practices.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* AI Providers Tab */}
          {activeTab === "ai-providers" && <AIProviderSettings />}
        </>
      )}
    </div>
  )
}
