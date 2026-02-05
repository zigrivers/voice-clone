/**
 * Edit Voice Clone Page
 */

"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { useVoiceClone } from "@/hooks/use-voice-clones"
import { VoiceCloneForm } from "@/components/voice-clone/voice-clone-form"

interface EditVoiceClonePageProps {
  params: Promise<{ id: string }>
}

export default function EditVoiceClonePage({ params }: EditVoiceClonePageProps) {
  const { id } = use(params)
  const { data: clone, isLoading, error } = useVoiceClone(id)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !clone) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <VoiceCloneForm mode="edit" clone={clone} />
    </div>
  )
}
