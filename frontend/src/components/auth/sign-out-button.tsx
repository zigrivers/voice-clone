"use client"

/**
 * Sign out button component
 */

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
  callbackUrl?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SignOutButton({
  callbackUrl = "/",
  className,
  variant = "ghost",
}: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl })
  }

  return (
    <Button onClick={handleSignOut} variant={variant} className={className}>
      Sign out
    </Button>
  )
}
