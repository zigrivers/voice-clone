/**
 * Voice clone type definitions
 */

export interface VoiceClone {
  id: string
  user_id: string
  name: string
  description?: string
  tags: string[]
  is_merged: boolean
  confidence_score: number
  current_dna_id?: string
  created_at: string
  updated_at: string
}

export interface VoiceCloneCreate {
  name: string
  description?: string
  tags?: string[]
}

export interface VoiceCloneUpdate {
  name?: string
  description?: string
  tags?: string[]
}

export interface VoiceCloneListResponse {
  items: VoiceClone[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface VoiceCloneDetailResponse extends VoiceClone {
  samples: WritingSample[]
  current_dna?: VoiceDna
}

export enum SourceType {
  PASTE = "paste",
  FILE = "file",
  URL = "url",
}

export interface WritingSample {
  id: string
  voice_clone_id: string
  source_type: SourceType
  content: string
  source_url?: string
  original_filename?: string
  word_count: number
  created_at: string
}

export interface WritingSampleCreate {
  source_type: SourceType
  content?: string
  source_url?: string
  file?: File
}

export interface VoiceDna {
  id: string
  voice_clone_id: string
  version: number
  dna_data: VoiceDnaData
  analysis_metadata?: Record<string, unknown>
  created_at: string
}

export interface VoiceDnaData {
  vocabulary_patterns: Record<string, unknown>
  sentence_structure: Record<string, unknown>
  paragraph_structure: Record<string, unknown>
  tone_markers: Record<string, unknown>
  rhetorical_devices: Record<string, unknown>
  punctuation_habits: Record<string, unknown>
  opening_patterns: Record<string, unknown>
  closing_patterns: Record<string, unknown>
  humor_and_personality: Record<string, unknown>
  distinctive_signatures: Record<string, unknown>
}

export interface ConfidenceScore {
  score: number
  breakdown: {
    word_count_score: number
    sample_count_score: number
    content_variety_score: number
    length_distribution_score: number
    consistency_score: number
  }
}

export interface MergeSourceConfig {
  voice_clone_id: string
  element_weights: Record<string, number>
}

export interface MergeCloneRequest {
  name: string
  description?: string
  tags?: string[]
  sources: MergeSourceConfig[]
}
