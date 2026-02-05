/**
 * Content library table component
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  Trash2,
  Copy,
  Check,
} from "lucide-react"
import type { Content } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DetectionScore } from "@/components/content/detection-score"
import { useToast } from "@/hooks/use-toast"

interface ContentTableProps {
  items: Content[]
  onArchive?: (id: string, archive: boolean) => void
  onDelete?: (id: string) => void
  onView?: (content: Content) => void
}

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  facebook: "Facebook",
  instagram: "Instagram",
  email: "Email",
  blog: "Blog",
  sms: "SMS",
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  published: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
}

export function ContentTable({
  items,
  onArchive,
  onDelete,
  onView,
}: ContentTableProps) {
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (content: Content) => {
    await navigator.clipboard.writeText(content.content_text)
    setCopiedId(content.id)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content found.</p>
        <Button asChild className="mt-4">
          <Link href="/create">Create Content</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium">Content</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Platform</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Score</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
            <th className="text-left px-4 py-3 text-sm font-medium">Created</th>
            <th className="text-right px-4 py-3 text-sm font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((content) => (
            <tr key={content.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <div className="max-w-md">
                  <p className="text-sm line-clamp-2">
                    {content.content_text.slice(0, 100)}
                    {content.content_text.length > 100 && "..."}
                  </p>
                  {content.voice_clone_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Voice: {content.voice_clone_name}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm">
                  {platformLabels[content.platform] || content.platform}
                </span>
              </td>
              <td className="px-4 py-3">
                {content.detection_score !== undefined ? (
                  <DetectionScore
                    score={content.detection_score}
                    showDetails={false}
                    size="sm"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                    statusColors[content.status] || statusColors.draft
                  }`}
                >
                  {content.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(content.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(content)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleCopy(content)}>
                      {copiedId === content.id ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/library/${content.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {onArchive && (
                      <DropdownMenuItem
                        onClick={() =>
                          onArchive(
                            content.id,
                            content.status !== "archived"
                          )
                        }
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {content.status === "archived" ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(content.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
