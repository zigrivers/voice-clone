/**
 * TanStack Query hooks for content generation and library
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  Content,
  ContentUpdate,
  ContentListResponse,
  ContentFilters,
  GenerationRequest,
  GenerationResponse,
  PlatformLimit,
  PlatformPreview,
} from "@/types"

// Query keys
export const contentKeys = {
  all: ["content"] as const,
  lists: () => [...contentKeys.all, "list"] as const,
  list: (filters: ContentFilters) => [...contentKeys.lists(), filters] as const,
  details: () => [...contentKeys.all, "detail"] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
  preview: (id: string, platform: string) =>
    [...contentKeys.detail(id), "preview", platform] as const,
  platformLimits: () => [...contentKeys.all, "platform-limits"] as const,
}

// Generate content
export function useGenerateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      provider,
    }: {
      data: GenerationRequest
      provider?: string
    }) => {
      const params = provider ? `?provider=${provider}` : ""
      const response = await api.post<GenerationResponse>(
        `/content/generate${params}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
    },
  })
}

// Regenerate content with feedback
export function useRegenerateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      contentId,
      feedback,
      provider,
    }: {
      contentId: string
      feedback?: string
      provider?: string
    }) => {
      const params = new URLSearchParams()
      if (feedback) params.set("feedback", feedback)
      if (provider) params.set("provider", provider)
      const queryString = params.toString() ? `?${params}` : ""

      const response = await api.post<GenerationResponse>(
        `/content/${contentId}/regenerate${queryString}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
    },
  })
}

// List content library
export function useContentLibrary(filters?: ContentFilters) {
  return useQuery({
    queryKey: contentKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.voice_clone_id)
        params.set("voice_clone_id", filters.voice_clone_id)
      if (filters?.platform) params.set("platform", filters.platform)
      if (filters?.status) params.set("status", filters.status)
      if (filters?.search) params.set("search", filters.search)
      if (filters?.sort) params.set("sort", filters.sort)
      if (filters?.order) params.set("order", filters.order)
      if (filters?.page) params.set("page", String(filters.page))
      if (filters?.per_page) params.set("per_page", String(filters.per_page))

      const { data } = await api.get<ContentListResponse>(`/library?${params}`)
      return data
    },
  })
}

// Get single content
export function useContent(id: string) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Content>(`/library/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// Update content
export function useUpdateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContentUpdate }) => {
      const response = await api.put<Content>(`/library/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(data.id) })
    },
  })
}

// Archive/unarchive content
export function useArchiveContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      archive = true,
    }: {
      id: string
      archive?: boolean
    }) => {
      const response = await api.put<Content>(
        `/library/${id}/archive?archive=${archive}`
      )
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(data.id) })
    },
  })
}

// Delete content
export function useDeleteContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/library/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() })
    },
  })
}

// Get platform preview
export function usePlatformPreview(contentId: string, platform: string) {
  return useQuery({
    queryKey: contentKeys.preview(contentId, platform),
    queryFn: async () => {
      const { data } = await api.get<PlatformPreview>(
        `/content/${contentId}/preview/${platform}`
      )
      return data
    },
    enabled: !!contentId && !!platform,
  })
}

// Get platform limits
export function usePlatformLimits() {
  return useQuery({
    queryKey: contentKeys.platformLimits(),
    queryFn: async () => {
      const { data } = await api.get<{ platforms: PlatformLimit[] }>(
        "/platforms/limits"
      )
      return data.platforms
    },
    staleTime: Infinity, // Platform limits rarely change
  })
}

// Export content
export function useExportContent() {
  return useMutation({
    mutationFn: async ({
      contentId,
      format = "txt",
    }: {
      contentId: string
      format?: "txt" | "pdf"
    }) => {
      const response = await api.get(`/content/${contentId}/export?format=${format}`, {
        responseType: "blob",
      })
      return response.data
    },
  })
}
