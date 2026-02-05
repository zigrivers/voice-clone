/**
 * Platform preview component - shows how content will appear on different platforms
 */

"use client"

import { useState } from "react"
import { Instagram } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface PlatformPreviewProps {
  content: string
  platform: string
  authorName?: string
  authorAvatar?: string
}

export function PlatformPreview({
  content,
  platform,
  authorName = "Your Name",
  authorAvatar,
}: PlatformPreviewProps) {
  const [activeView, setActiveView] = useState<"preview" | "raw">("preview")

  return (
    <div className="space-y-4">
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "preview" | "raw")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Platform Preview</TabsTrigger>
          <TabsTrigger value="raw">Raw Text</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          {platform === "linkedin" && (
            <LinkedInPreview content={content} authorName={authorName} authorAvatar={authorAvatar} />
          )}
          {platform === "twitter" && (
            <TwitterPreview content={content} authorName={authorName} authorAvatar={authorAvatar} />
          )}
          {platform === "facebook" && (
            <FacebookPreview content={content} authorName={authorName} authorAvatar={authorAvatar} />
          )}
          {platform === "instagram" && (
            <InstagramPreview content={content} authorName={authorName} authorAvatar={authorAvatar} />
          )}
          {platform === "email" && (
            <EmailPreview content={content} authorName={authorName} />
          )}
          {platform === "blog" && (
            <BlogPreview content={content} authorName={authorName} />
          )}
          {platform === "sms" && (
            <SMSPreview content={content} />
          )}
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <div className="p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LinkedInPreview({
  content,
  authorName,
  authorAvatar,
}: {
  content: string
  authorName: string
  authorAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full" />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-sm">{authorName}</p>
          <p className="text-xs text-muted-foreground">Your professional headline</p>
          <p className="text-xs text-muted-foreground">Just now · 🌐</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>

      {/* Engagement Bar */}
      <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center gap-2">
        <span>👍 0</span>
        <span>·</span>
        <span>0 comments</span>
        <span>·</span>
        <span>0 reposts</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t flex justify-around">
        {["Like", "Comment", "Repost", "Send"].map((action) => (
          <button
            key={action}
            className="text-xs text-muted-foreground hover:bg-muted px-3 py-2 rounded-md"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

function TwitterPreview({
  content,
  authorName,
  authorAvatar,
}: {
  content: string
  authorName: string
  authorAvatar?: string
}) {
  const handle = authorName.toLowerCase().replace(/\s/g, "")
  const charCount = content.length
  const isOverLimit = charCount > 280

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full" />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold truncate">{authorName}</span>
            <span className="text-muted-foreground">@{handle} · now</span>
          </div>
          <p className="text-sm whitespace-pre-wrap mt-1">{content}</p>

          {/* Character count */}
          <div className="mt-2 flex justify-end">
            <span className={cn(
              "text-xs",
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            )}>
              {charCount}/280
            </span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex justify-between max-w-[300px] text-muted-foreground">
            {["💬", "🔁", "❤️", "📤"].map((icon, i) => (
              <button key={i} className="hover:bg-muted p-2 rounded-full text-sm">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FacebookPreview({
  content,
  authorName,
  authorAvatar,
}: {
  content: string
  authorName: string
  authorAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full" />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-sm">{authorName}</p>
          <p className="text-xs text-muted-foreground">Just now · 🌐</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>

      {/* Reactions */}
      <div className="px-4 py-2 border-t border-b text-xs text-muted-foreground flex justify-between">
        <span>👍❤️ 0</span>
        <span>0 comments · 0 shares</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-1 flex justify-around">
        {["👍 Like", "💬 Comment", "↗️ Share"].map((action) => (
          <button
            key={action}
            className="text-sm text-muted-foreground hover:bg-muted px-4 py-2 rounded-md flex-1"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

function InstagramPreview({
  content,
  authorName,
  authorAvatar,
}: {
  content: string
  authorName: string
  authorAvatar?: string
}) {
  const handle = authorName.toLowerCase().replace(/\s/g, "")

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-3 flex items-center gap-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 p-0.5">
          <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-semibold">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full rounded-full" />
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <span className="font-semibold text-sm">{handle}</span>
      </div>

      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <Instagram className="w-16 h-16 text-muted-foreground/30" />
      </div>

      {/* Actions */}
      <div className="p-3 flex gap-4 text-xl">
        <span>❤️</span>
        <span>💬</span>
        <span>✈️</span>
        <span className="ml-auto">🔖</span>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm">
          <span className="font-semibold">{handle}</span>{" "}
          <span className="whitespace-pre-wrap">{content}</span>
        </p>
      </div>
    </div>
  )
}

function EmailPreview({
  content,
  authorName,
}: {
  content: string
  authorName: string
}) {
  // Try to extract subject from first line if it looks like a subject
  const lines = content.split("\n")
  const hasSubject = lines[0]?.toLowerCase().startsWith("subject:")
  const subject = hasSubject ? lines[0].replace(/^subject:\s*/i, "") : "Your subject here"
  const body = hasSubject ? lines.slice(1).join("\n").trim() : content

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
      {/* Email header */}
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-16">From:</span>
          <span>{authorName} &lt;you@example.com&gt;</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-16">To:</span>
          <span>recipient@example.com</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground w-16">Subject:</span>
          <span className="font-semibold">{subject}</span>
        </div>
      </div>

      {/* Email body */}
      <div className="p-4">
        <p className="text-sm whitespace-pre-wrap">{body}</p>
      </div>
    </div>
  )
}

function BlogPreview({
  content,
  authorName,
}: {
  content: string
  authorName: string
}) {
  // Try to extract title from first line
  const lines = content.split("\n")
  const title = lines[0] || "Blog Post Title"
  const body = lines.slice(1).join("\n").trim() || content

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm">
      {/* Blog header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>By {authorName}</span>
          <span>·</span>
          <span>{new Date().toLocaleDateString()}</span>
          <span>·</span>
          <span>{Math.ceil(content.split(/\s+/).length / 200)} min read</span>
        </div>
      </div>

      {/* Blog body */}
      <div className="p-6">
        <article className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{body}</p>
        </article>
      </div>
    </div>
  )
}

function SMSPreview({ content }: { content: string }) {
  const charCount = content.length
  const segments = Math.ceil(charCount / 160)

  return (
    <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl p-4 max-w-[300px] mx-auto">
      {/* Message bubble */}
      <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 ml-auto max-w-[80%]">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>

      {/* Info */}
      <div className="mt-2 text-xs text-muted-foreground text-right">
        <span>{charCount} characters</span>
        {segments > 1 && <span> · {segments} segments</span>}
      </div>
    </div>
  )
}

// Export individual previews for direct use
export {
  LinkedInPreview,
  TwitterPreview,
  FacebookPreview,
  InstagramPreview,
  EmailPreview,
  BlogPreview,
  SMSPreview,
}
