/**
 * Auth type definitions
 */

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  oauth_provider: string
  oauth_id: string
  created_at: string
  updated_at?: string
}

export interface ApiKey {
  id: string
  user_id: string
  provider: "openai" | "anthropic"
  masked_key: string
  is_valid: boolean
  created_at: string
}

export interface ApiKeyCreate {
  provider: "openai" | "anthropic"
  api_key: string
}
