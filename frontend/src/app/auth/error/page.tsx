/**
 * Auth error page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

interface ErrorPageProps {
  searchParams: { error?: string }
}

export default function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const error = searchParams.error || "Unknown error"

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link may have expired or been used.",
    OAuthSignin: "Error occurred during OAuth sign in.",
    OAuthCallback: "Error occurred during OAuth callback.",
    OAuthCreateAccount: "Could not create OAuth account.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "Error occurred during callback.",
    OAuthAccountNotLinked: "This account is already linked to another user.",
    EmailSignin: "Error occurred during email sign in.",
    CredentialsSignin: "Invalid credentials.",
    SessionRequired: "Please sign in to access this page.",
    Default: "An unknown error occurred.",
  }

  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try again</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Go to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
