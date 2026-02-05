import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Voice Clone
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          AI-powered voice cloning and content generation. Create authentic
          content that matches your unique writing style.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/voice-clones">Get Started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Voice Cloning</CardTitle>
            <CardDescription>
              Analyze your writing samples to create a unique voice profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload documents, paste text, or import from URLs to build your
              Voice DNA.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Generation</CardTitle>
            <CardDescription>
              Generate platform-optimized content in your voice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create content for LinkedIn, Twitter, emails, blogs, and more.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Detection Avoidance</CardTitle>
            <CardDescription>
              Built-in scoring ensures human-like output
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time detection scoring helps you create content that reads
              naturally.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
