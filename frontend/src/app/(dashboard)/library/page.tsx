/**
 * Content Library Page
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ContentFilters,
  type ContentFiltersState,
} from "@/components/library/content-filters"
import { ContentTable } from "@/components/library/content-table"
import {
  useContentLibrary,
  useArchiveContent,
  useDeleteContent,
} from "@/hooks/use-content"
import { useVoiceClones } from "@/hooks/use-voice-clones"
import { useToast } from "@/hooks/use-toast"
import type { Content, ContentStatus } from "@/types"

export default function LibraryPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<ContentFiltersState>({
    search: "",
    platform: "",
    status: "",
    voiceCloneId: "",
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewContent, setViewContent] = useState<Content | null>(null)

  const { data: voiceClones } = useVoiceClones()
  const { data, isLoading } = useContentLibrary({
    search: filters.search || undefined,
    platform: filters.platform || undefined,
    status: (filters.status as ContentStatus) || undefined,
    voice_clone_id: filters.voiceCloneId || undefined,
  })
  const archiveContent = useArchiveContent()
  const deleteContent = useDeleteContent()

  const handleArchive = async (id: string, archive: boolean) => {
    try {
      await archiveContent.mutateAsync({ id, archive })
      toast({
        title: archive ? "Content archived" : "Content restored",
        description: archive
          ? "Content has been moved to archive."
          : "Content has been restored from archive.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteContent.mutateAsync(deleteId)
      toast({
        title: "Content deleted",
        description: "The content has been permanently deleted.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground">
            Browse and manage your generated content.
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ContentFilters
            filters={filters}
            onChange={setFilters}
            voiceClones={voiceClones?.items.map((c) => ({
              id: c.id,
              name: c.name,
            }))}
          />
        </div>

        {/* Content Table */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                {data?.total ?? 0} item{data?.total !== 1 ? "s" : ""} found
              </div>
              <ContentTable
                items={data?.items ?? []}
                onArchive={handleArchive}
                onDelete={(id) => setDeleteId(id)}
                onView={(content) => setViewContent(content)}
              />
              {data && data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {data.page} of {data.pages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContent.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Content Dialog - simplified for now */}
      <AlertDialog
        open={!!viewContent}
        onOpenChange={() => setViewContent(null)}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Content Preview</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm">
              {viewContent?.content_text}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
