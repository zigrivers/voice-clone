/**
 * Zod validation schemas for forms
 */

import { z } from "zod"
import { ContentStatus, SourceType } from "@/types"

// Voice Clone schemas
export const voiceCloneSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  tags: z.array(z.string()).default([]),
})

export type VoiceCloneFormData = z.infer<typeof voiceCloneSchema>

// Writing Sample schemas
export const writingSamplePasteSchema = z.object({
  source_type: z.literal(SourceType.PASTE),
  content: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(100000, "Content must be less than 100,000 characters"),
})

export const writingSampleUrlSchema = z.object({
  source_type: z.literal(SourceType.URL),
  source_url: z.string().url("Invalid URL format"),
})

export const writingSampleFileSchema = z.object({
  source_type: z.literal(SourceType.FILE),
  file: z.any().refine((file) => file instanceof File, "File is required"),
})

export const writingSampleSchema = z.discriminatedUnion("source_type", [
  writingSamplePasteSchema,
  writingSampleUrlSchema,
  writingSampleFileSchema,
])

export type WritingSampleFormData = z.infer<typeof writingSampleSchema>

// Content Generation schemas
export const contentGenerationSchema = z.object({
  voice_clone_id: z.string().min(1, "Voice clone is required"),
  platform: z.string().min(1, "Platform is required"),
  input_text: z
    .string()
    .min(10, "Input text must be at least 10 characters")
    .max(10000, "Input text must be less than 10,000 characters"),
  length: z.enum(["short", "medium", "long"]).optional(),
  tone_override: z.string().max(100).optional(),
  target_audience: z.string().max(200).optional(),
  cta_style: z.string().max(100).optional(),
})

export type ContentGenerationFormData = z.infer<typeof contentGenerationSchema>

// Content Update schema
export const contentUpdateSchema = z.object({
  content_text: z
    .string()
    .min(1, "Content cannot be empty")
    .max(100000, "Content is too long")
    .optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  tags: z.array(z.string()).optional(),
})

export type ContentUpdateFormData = z.infer<typeof contentUpdateSchema>

// Settings schemas
export const settingsInstructionsSchema = z.object({
  content: z
    .string()
    .min(100, "Instructions must be at least 100 characters")
    .max(50000, "Instructions must be less than 50,000 characters"),
})

export type SettingsInstructionsFormData = z.infer<typeof settingsInstructionsSchema>

export const settingsGuidelinesSchema = z.object({
  content: z
    .string()
    .min(100, "Guidelines must be at least 100 characters")
    .max(50000, "Guidelines must be less than 50,000 characters"),
})

export type SettingsGuidelinesFormData = z.infer<typeof settingsGuidelinesSchema>

// Platform Settings schema
export const platformSettingsSchema = z.object({
  platform: z
    .string()
    .min(1, "Platform key is required")
    .max(50, "Platform key must be less than 50 characters")
    .regex(/^[a-z0-9_-]+$/, "Platform key must be lowercase letters, numbers, hyphens, or underscores"),
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be less than 100 characters"),
  best_practices: z
    .string()
    .min(50, "Best practices must be at least 50 characters")
    .max(10000, "Best practices must be less than 10,000 characters"),
})

export type PlatformSettingsFormData = z.infer<typeof platformSettingsSchema>

// API Key schema
export const apiKeySchema = z.object({
  provider: z.enum(["openai", "anthropic"]),
  api_key: z
    .string()
    .min(20, "API key is too short")
    .max(200, "API key is too long"),
})

export type ApiKeyFormData = z.infer<typeof apiKeySchema>

// Merge Clone schema
export const mergeCloneSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  sources: z
    .array(
      z.object({
        voice_clone_id: z.string().min(1, "Voice clone is required"),
        element_weights: z.record(z.number().min(0).max(100)),
      })
    )
    .min(2, "At least 2 voice clones are required")
    .max(5, "Maximum 5 voice clones can be merged"),
})

export type MergeCloneFormData = z.infer<typeof mergeCloneSchema>
