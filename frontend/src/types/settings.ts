/**
 * Settings type definitions
 */

export interface Settings {
  id: string
  user_id: string
  voice_cloning_instructions: string
  anti_ai_guidelines: string
  created_at: string
  updated_at?: string
}

export interface SettingsHistory {
  id: string
  settings_id: string
  setting_type: "voice_cloning_instructions" | "anti_ai_guidelines"
  content: string
  version: number
  created_at: string
}

export interface PlatformSettings {
  id: string
  user_id: string
  platform: string
  display_name: string
  best_practices: string
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface PlatformSettingsCreate {
  platform: string
  display_name: string
  best_practices: string
}

export interface PlatformSettingsUpdate {
  display_name?: string
  best_practices?: string
}

export interface PlatformSettingsListResponse {
  items: PlatformSettings[]
}
