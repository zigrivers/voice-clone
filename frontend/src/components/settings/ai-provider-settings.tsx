/**
 * AI Provider Settings Component
 * Manages API keys for OpenAI and Anthropic
 */

"use client"

import { useState } from "react"
import {
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  useApiKeys,
  useAddApiKey,
  useValidateApiKey,
  useDeleteApiKey,
} from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import type { ApiKey } from "@/types"
import { cn } from "@/lib/utils"

type Provider = "openai" | "anthropic"

const providerConfig: Record<
  Provider,
  {
    name: string
    logo: string
    color: string
    keyPrefix: string
    docsUrl: string
    description: string
  }
> = {
  openai: {
    name: "OpenAI",
    logo: "O",
    color: "bg-emerald-500",
    keyPrefix: "sk-",
    docsUrl: "https://platform.openai.com/api-keys",
    description: "GPT-4 and GPT-3.5 models for content generation",
  },
  anthropic: {
    name: "Anthropic",
    logo: "A",
    color: "bg-orange-500",
    keyPrefix: "sk-ant-",
    docsUrl: "https://console.anthropic.com/settings/keys",
    description: "Claude models for content generation",
  },
}

export function AIProviderSettings() {
  const { toast } = useToast()
  const { data: apiKeys, isLoading } = useApiKeys()
  const addApiKey = useAddApiKey()
  const validateApiKey = useValidateApiKey()
  const deleteApiKey = useDeleteApiKey()

  const [showAddForm, setShowAddForm] = useState<Provider | null>(null)
  const [newKey, setNewKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null)
  const [validatingId, setValidatingId] = useState<string | null>(null)

  const openaiKey = apiKeys?.find((k) => k.provider === "openai")
  const anthropicKey = apiKeys?.find((k) => k.provider === "anthropic")

  const handleAddKey = async (provider: Provider) => {
    if (!newKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      })
      return
    }

    // Basic validation
    const config = providerConfig[provider]
    if (!newKey.startsWith(config.keyPrefix)) {
      toast({
        title: "Invalid key format",
        description: `${config.name} API keys should start with "${config.keyPrefix}"`,
        variant: "destructive",
      })
      return
    }

    try {
      await addApiKey.mutateAsync({
        provider,
        api_key: newKey,
      })
      toast({
        title: "API key added",
        description: `${config.name} API key has been saved`,
      })
      setNewKey("")
      setShowAddForm(null)
      setShowKey(false)
    } catch {
      toast({
        title: "Failed to add key",
        description: "Please check the key and try again",
        variant: "destructive",
      })
    }
  }

  const handleValidate = async (key: ApiKey) => {
    setValidatingId(key.id)
    try {
      const result = await validateApiKey.mutateAsync(key.id)
      toast({
        title: result.is_valid ? "Key is valid" : "Key is invalid",
        description: result.is_valid
          ? "API key validated successfully"
          : "API key validation failed. Please update the key.",
        variant: result.is_valid ? "default" : "destructive",
      })
    } catch {
      toast({
        title: "Validation failed",
        description: "Could not validate the API key",
        variant: "destructive",
      })
    } finally {
      setValidatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteApiKey.mutateAsync(deleteTarget.id)
      toast({
        title: "API key deleted",
        description: `${providerConfig[deleteTarget.provider].name} API key has been removed`,
      })
    } catch {
      toast({
        title: "Failed to delete",
        description: "Could not delete the API key",
        variant: "destructive",
      })
    } finally {
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">AI Providers</h3>
        <p className="text-sm text-muted-foreground">
          Configure your AI provider API keys for content generation. At least
          one provider is required.
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {(["openai", "anthropic"] as Provider[]).map((provider) => {
          const config = providerConfig[provider]
          const existingKey =
            provider === "openai" ? openaiKey : anthropicKey

          return (
            <Card key={provider}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                        config.color
                      )}
                    >
                      {config.logo}
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    Get key
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                {existingKey ? (
                  <div className="space-y-3">
                    {/* Existing Key Display */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">
                          {existingKey.masked_key}
                        </code>
                        {existingKey.is_valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleValidate(existingKey)}
                          disabled={validatingId === existingKey.id}
                        >
                          {validatingId === existingKey.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(existingKey)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added{" "}
                      {new Date(existingKey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : showAddForm === provider ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-key`}>API Key</Label>
                      <div className="relative">
                        <Input
                          id={`${provider}-key`}
                          type={showKey ? "text" : "password"}
                          placeholder={`${config.keyPrefix}...`}
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(null)
                          setNewKey("")
                          setShowKey(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddKey(provider)}
                        disabled={addApiKey.isPending}
                      >
                        {addApiKey.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Save Key
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddForm(provider)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add API Key
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg h-fit">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Security Information
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your API keys are encrypted before being stored and are never
                exposed in full after being saved. Only the masked version is
                displayed for your reference.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Info */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Provider Selection</h4>
        <p className="text-sm text-muted-foreground">
          When generating content, the system will automatically use your
          configured provider. If both providers are configured, you can choose
          which one to use in the generation settings.
        </p>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              {deleteTarget && providerConfig[deleteTarget.provider].name} API
              key? You will need to add a new key to use this provider for
              content generation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteApiKey.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
