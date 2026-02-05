"use client"

/**
 * Sign out page
 */

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignOutPage() {
  useEffect(() => {
    // Auto sign out after a short delay
    const timer = setTimeout(() => {
      signOut({ callbackUrl: "/" })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Signing out...</CardTitle>
          <CardDescription>
            You will be redirected to the home page shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full"
          >
            Sign out now
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
