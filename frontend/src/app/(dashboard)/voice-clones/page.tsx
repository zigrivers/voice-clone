/**
 * Voice Clones List Page
 */

"use client"

import { useState } from "react"
import { useVoiceClones, useDeleteVoiceClone } from "@/hooks/use-voice-clones"
import { VoiceCloneList } from "@/components/voice-clone/voice-clone-list"
import { useToast } from "@/hooks/use-toast"
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

export default function VoiceClonesPage() {
  const { data, isLoading } = useVoiceClones()
  const deleteClone = useDeleteVoiceClone()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteClone.mutateAsync(deleteId)
      toast({
        title: "Voice clone deleted",
        description: "The voice clone has been permanently deleted.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete voice clone. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Voice Clones</h1>
        <p className="text-muted-foreground">
          Manage your voice clones and their writing samples.
        </p>
      </div>

      <VoiceCloneList
        clones={data?.items ?? []}
        isLoading={isLoading}
        onDelete={(id) => setDeleteId(id)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete voice clone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              voice clone and all associated writing samples and DNA analysis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClone.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
