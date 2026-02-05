"use client"

/**
 * Auth provider wrapper for client components
 */

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface AuthProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
