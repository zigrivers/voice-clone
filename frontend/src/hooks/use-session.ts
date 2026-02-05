"use client"

/**
 * Custom hook for accessing session data with type safety
 */

import { useSession as useNextAuthSession } from "next-auth/react"

export function useSession() {
  const { data: session, status, update } = useNextAuthSession()

  return {
    session,
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUnauthenticated: status === "unauthenticated",
    update,
  }
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading, isUnauthenticated, user } = useSession()

  return {
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    user,
    requireAuth: !isLoading && isUnauthenticated,
  }
}
