/**
 * Type definitions index
 */

export * from "./voice-clone"
export * from "./content"
export * from "./settings"
export * from "./auth"

// Common types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
