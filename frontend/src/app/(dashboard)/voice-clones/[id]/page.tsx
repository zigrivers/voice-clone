/**
 * Voice Clone Detail Page
 */

"use client"

import { use, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil, Trash2, Sparkles, Loader2, ArrowLeft } from "lucide-react"
import {
  useVoiceClone,
  useDeleteVoiceClone,
  useAddSample,
  useDeleteSample,
  useAnalyzeVoiceClone,
} from "@/hooks/use-voice-clones"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
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
import { ConfidenceBadge } from "@/components/voice-clone/confidence-badge"
import { SampleUploader } from "@/components/voice-clone/sample-uploader"
import { SampleList } from "@/components/voice-clone/sample-list"
import { DnaViewer } from "@/components/voice-clone/dna-viewer"
import { useToast } from "@/hooks/use-toast"
import type { SourceType } from "@/types"

interface VoiceCloneDetailPageProps {
  params: Promise<{ id: string }>
}

export default function VoiceCloneDetailPage({
  params,
}: VoiceCloneDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { data: clone, isLoading, error } = useVoiceClone(id)
  const deleteClone = useDeleteVoiceClone()
  const addSample = useAddSample()
  const deleteSample = useDeleteSample()
  const analyzeClone = useAnalyzeVoiceClone()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingSampleId, setDeletingSampleId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !clone) {
    notFound()
  }

  const handleDeleteClone = async () => {
    try {
      await deleteClone.mutateAsync(id)
      toast({
        title: "Voice clone deleted",
        description: "The voice clone has been permanently deleted.",
      })
      router.push("/voice-clones")
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete voice clone. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleAddSample = async (data: {
    source_type: SourceType
    content?: string
    source_url?: string
    file?: File
  }) => {
    try {
      await addSample.mutateAsync({ cloneId: id, data })
      toast({
        title: "Sample added",
        description: "The writing sample has been added successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to add sample. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSample = async (sampleId: string) => {
    setDeletingSampleId(sampleId)
    try {
      await deleteSample.mutateAsync({ cloneId: id, sampleId })
      toast({
        title: "Sample deleted",
        description: "The writing sample has been removed.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete sample. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingSampleId(null)
    }
  }

  const handleAnalyze = async () => {
    try {
      await analyzeClone.mutateAsync({ cloneId: id })
      toast({
        title: "Analysis complete",
        description: "Your Voice DNA has been generated.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to analyze voice clone. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalWords = clone.samples?.reduce((sum, s) => sum + s.word_count, 0) ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href="/voice-clones">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Voice Clones
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{clone.name}</h1>
          {clone.description && (
            <p className="text-muted-foreground mt-1">{clone.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/voice-clones/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confidence Score</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfidenceBadge score={clone.confidence_score} size="lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Writing Samples</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clone.samples?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Words</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>DNA Status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {clone.current_dna ? "Analyzed" : "Pending"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {clone.tags && clone.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {clone.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Writing Samples */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Writing Samples</h2>
            <Button
              onClick={handleAnalyze}
              disabled={
                analyzeClone.isPending || !clone.samples?.length
              }
            >
              {analyzeClone.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze DNA
                </>
              )}
            </Button>
          </div>
          <SampleUploader
            onUpload={handleAddSample}
            isUploading={addSample.isPending}
          />
          <SampleList
            samples={clone.samples ?? []}
            onDelete={handleDeleteSample}
            isDeleting={!!deletingSampleId}
          />
        </div>

        {/* Voice DNA */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Voice DNA</h2>
          {clone.current_dna ? (
            <DnaViewer dna={clone.current_dna} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Add writing samples and click &quot;Analyze DNA&quot; to
                  generate your Voice DNA profile.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete voice clone?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              &quot;{clone.name}&quot; and all associated writing samples and
              DNA analysis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClone}
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
