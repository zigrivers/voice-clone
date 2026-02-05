/**
 * TanStack Query hooks for voice clones
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  VoiceClone,
  VoiceCloneCreate,
  VoiceCloneUpdate,
  VoiceCloneListResponse,
  VoiceCloneDetailResponse,
  WritingSampleCreate,
  WritingSample,
  VoiceDna,
  ConfidenceScore,
  MergeCloneRequest,
} from "@/types"

// Query keys
export const voiceCloneKeys = {
  all: ["voice-clones"] as const,
  lists: () => [...voiceCloneKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...voiceCloneKeys.lists(), filters] as const,
  details: () => [...voiceCloneKeys.all, "detail"] as const,
  detail: (id: string) => [...voiceCloneKeys.details(), id] as const,
  samples: (id: string) => [...voiceCloneKeys.detail(id), "samples"] as const,
  dna: (id: string) => [...voiceCloneKeys.detail(id), "dna"] as const,
  confidence: (id: string) =>
    [...voiceCloneKeys.detail(id), "confidence"] as const,
}

// List voice clones
export function useVoiceClones(filters?: {
  tags?: string[]
  search?: string
  page?: number
  per_page?: number
}) {
  return useQuery({
    queryKey: voiceCloneKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.tags) {
        filters.tags.forEach((tag) => params.append("tags", tag))
      }
      if (filters?.search) params.set("search", filters.search)
      if (filters?.page) params.set("page", String(filters.page))
      if (filters?.per_page) params.set("per_page", String(filters.per_page))

      const { data } = await api.get<VoiceCloneListResponse>(
        `/voice-clones?${params}`
      )
      return data
    },
  })
}

// Get single voice clone
export function useVoiceClone(id: string) {
  return useQuery({
    queryKey: voiceCloneKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<VoiceCloneDetailResponse>(
        `/voice-clones/${id}`
      )
      return data
    },
    enabled: !!id,
  })
}

// Create voice clone
export function useCreateVoiceClone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: VoiceCloneCreate) => {
      const response = await api.post<VoiceClone>("/voice-clones", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceCloneKeys.lists() })
    },
  })
}

// Update voice clone
export function useUpdateVoiceClone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VoiceCloneUpdate }) => {
      const response = await api.put<VoiceClone>(`/voice-clones/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: voiceCloneKeys.lists() })
      queryClient.invalidateQueries({ queryKey: voiceCloneKeys.detail(data.id) })
    },
  })
}

// Delete voice clone
export function useDeleteVoiceClone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/voice-clones/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceCloneKeys.lists() })
    },
  })
}

// Add writing sample
export function useAddSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cloneId,
      data,
    }: {
      cloneId: string
      data: WritingSampleCreate
    }) => {
      const formData = new FormData()
      formData.append("source_type", data.source_type)
      if (data.content) formData.append("content", data.content)
      if (data.source_url) formData.append("source_url", data.source_url)
      if (data.file) formData.append("file", data.file)

      const response = await api.post<WritingSample>(
        `/voice-clones/${cloneId}/samples`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      return response.data
    },
    onSuccess: (_, { cloneId }) => {
      queryClient.invalidateQueries({
        queryKey: voiceCloneKeys.detail(cloneId),
      })
      queryClient.invalidateQueries({
        queryKey: voiceCloneKeys.samples(cloneId),
      })
    },
  })
}

// Delete sample
export function useDeleteSample() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cloneId,
      sampleId,
    }: {
      cloneId: string
      sampleId: string
    }) => {
      await api.delete(`/voice-clones/${cloneId}/samples/${sampleId}`)
      return { cloneId, sampleId }
    },
    onSuccess: (_, { cloneId }) => {
      queryClient.invalidateQueries({
        queryKey: voiceCloneKeys.detail(cloneId),
      })
      queryClient.invalidateQueries({
        queryKey: voiceCloneKeys.samples(cloneId),
      })
    },
  })
}

// Analyze voice clone (generate DNA)
export function useAnalyzeVoiceClone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cloneId,
      provider,
    }: {
      cloneId: string
      provider?: string
    }) => {
      const params = provider ? `?provider=${provider}` : ""
      const response = await api.post<VoiceDna>(
        `/voice-clones/${cloneId}/analyze${params}`
      )
      return response.data
    },
    onSuccess: (_, { cloneId }) => {
      queryClient.invalidateQueries({
        queryKey: voiceCloneKeys.detail(cloneId),
      })
      queryClient.invalidateQueries({ queryKey: voiceCloneKeys.dna(cloneId) })
    },
  })
}

// Get current DNA
export function useVoiceDna(cloneId: string) {
  return useQuery({
    queryKey: voiceCloneKeys.dna(cloneId),
    queryFn: async () => {
      const { data } = await api.get<VoiceDna>(`/voice-clones/${cloneId}/dna`)
      return data
    },
    enabled: !!cloneId,
  })
}

// Get confidence score
export function useConfidenceScore(cloneId: string) {
  return useQuery({
    queryKey: voiceCloneKeys.confidence(cloneId),
    queryFn: async () => {
      const { data } = await api.get<ConfidenceScore>(
        `/voice-clones/${cloneId}/confidence`
      )
      return data
    },
    enabled: !!cloneId,
  })
}

// Merge voice clones
export function useMergeVoiceClones() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      provider,
    }: {
      data: MergeCloneRequest
      provider?: string
    }) => {
      const params = provider ? `?provider=${provider}` : ""
      const response = await api.post<VoiceClone>(
        `/voice-clones/merge${params}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceCloneKeys.lists() })
    },
  })
}
