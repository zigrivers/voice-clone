/**
 * Content type definitions
 */

export enum ContentStatus {
  DRAFT = "draft",
  READY = "ready",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface Content {
  id: string
  user_id: string
  voice_clone_id?: string
  platform: string
  content_text: string
  input_text: string
  properties_used: ContentProperties
  detection_score?: number
  detection_breakdown?: DetectionBreakdown
  status: ContentStatus
  tags: string[]
  created_at: string
  updated_at?: string
  voice_clone_name?: string
}

export interface ContentProperties {
  length?: string
  tone_override?: string
  target_audience?: string
  cta_style?: string
  dna_version?: number
}

export interface DetectionBreakdown {
  sentence_variety: number
  vocabulary_diversity: number
  specificity: number
  transition_naturalness: number
  opening_closing: number
  punctuation: number
  personality: number
  structure: number
}

export interface GenerationRequest {
  voice_clone_id: string
  platform: string
  input_text: string
  length?: "short" | "medium" | "long"
  tone_override?: string
  target_audience?: string
  cta_style?: string
}

export interface GenerationResponse {
  id: string
  content_text: string
  platform: string
  detection_score?: number
  detection_breakdown?: DetectionBreakdown
  properties_used: ContentProperties
}

export interface ContentUpdate {
  content_text?: string
  status?: ContentStatus
  tags?: string[]
}

export interface ContentListResponse {
  items: Content[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface ContentFilters {
  voice_clone_id?: string
  platform?: string
  status?: ContentStatus
  search?: string
  sort?: string
  order?: "asc" | "desc"
  page?: number
  per_page?: number
}

export interface PlatformLimit {
  platform: string
  name: string
  char_limit?: number
  supports_threads: boolean
  thread_limit?: number
}

export interface PlatformPreview {
  platform: string
  content: string
  char_count: number
  char_limit?: number
  is_within_limit: boolean
  threads?: string[]
}

export const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "blog", label: "Blog" },
  { value: "sms", label: "SMS" },
] as const

export type Platform = typeof PLATFORMS[number]["value"]
