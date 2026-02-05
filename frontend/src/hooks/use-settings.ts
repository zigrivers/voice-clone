/**
 * TanStack Query hooks for settings
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  Settings,
  SettingsHistory,
  PlatformSettings,
  PlatformSettingsCreate,
  PlatformSettingsUpdate,
  PlatformSettingsListResponse,
} from "@/types"

// Query keys
export const settingsKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsKeys.all, "detail"] as const,
  history: (type: string) => [...settingsKeys.all, "history", type] as const,
  platforms: () => [...settingsKeys.all, "platforms"] as const,
  platform: (platform: string) =>
    [...settingsKeys.platforms(), platform] as const,
}

// Get all settings
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: async () => {
      const { data } = await api.get<Settings>("/settings")
      return data
    },
  })
}

// Update voice cloning instructions
export function useUpdateVoiceCloningInstructions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await api.put<Settings>(
        "/settings/voice-cloning-instructions",
        { content }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() })
      queryClient.invalidateQueries({
        queryKey: settingsKeys.history("voice_cloning_instructions"),
      })
    },
  })
}

// Update anti-AI guidelines
export function useUpdateAntiAiGuidelines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await api.put<Settings>("/settings/anti-ai-guidelines", {
        content,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() })
      queryClient.invalidateQueries({
        queryKey: settingsKeys.history("anti_ai_guidelines"),
      })
    },
  })
}

// Get settings history
export function useSettingsHistory(
  settingType: "voice_cloning_instructions" | "anti_ai_guidelines"
) {
  return useQuery({
    queryKey: settingsKeys.history(settingType),
    queryFn: async () => {
      const { data } = await api.get<SettingsHistory[]>(
        `/settings/history/${settingType}`
      )
      return data
    },
  })
}

// Revert to version
export function useRevertSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (historyId: string) => {
      const response = await api.post<Settings>(`/settings/revert/${historyId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}

// Get all platform settings
export function usePlatformSettings() {
  return useQuery({
    queryKey: settingsKeys.platforms(),
    queryFn: async () => {
      const { data } = await api.get<PlatformSettingsListResponse>(
        "/settings/platforms"
      )
      return data.items
    },
  })
}

// Get single platform settings
export function usePlatformSetting(platform: string) {
  return useQuery({
    queryKey: settingsKeys.platform(platform),
    queryFn: async () => {
      const { data } = await api.get<PlatformSettings>(
        `/settings/platforms/${platform}`
      )
      return data
    },
    enabled: !!platform,
  })
}

// Update platform settings
export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      platform,
      data,
    }: {
      platform: string
      data: PlatformSettingsUpdate
    }) => {
      const response = await api.put<PlatformSettings>(
        `/settings/platforms/${platform}`,
        data
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.platforms() })
      queryClient.invalidateQueries({
        queryKey: settingsKeys.platform(data.platform),
      })
    },
  })
}

// Create custom platform
export function useCreatePlatformSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PlatformSettingsCreate) => {
      const response = await api.post<PlatformSettings>(
        "/settings/platforms",
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.platforms() })
    },
  })
}

// Delete custom platform
export function useDeletePlatformSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (platformId: string) => {
      await api.delete(`/settings/platforms/${platformId}`)
      return platformId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.platforms() })
    },
  })
}

// API Keys query keys
export const apiKeysKeys = {
  all: ["apiKeys"] as const,
  list: () => [...apiKeysKeys.all, "list"] as const,
}

// Get all API keys
export function useApiKeys() {
  return useQuery({
    queryKey: apiKeysKeys.list(),
    queryFn: async () => {
      const { data } = await api.get<{ items: import("@/types").ApiKey[] }>(
        "/api-keys"
      )
      return data.items
    },
  })
}

// Add API key
export function useAddApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: import("@/types").ApiKeyCreate) => {
      const response = await api.post<import("@/types").ApiKey>(
        "/api-keys",
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() })
    },
  })
}

// Validate API key
export function useValidateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (keyId: string) => {
      const response = await api.post<{ is_valid: boolean }>(
        `/api-keys/${keyId}/validate`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() })
    },
  })
}

// Delete API key
export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/api-keys/${keyId}`)
      return keyId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.list() })
    },
  })
}
