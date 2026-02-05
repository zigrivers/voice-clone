/**
 * Voice clone create/edit form component
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import type { VoiceClone, VoiceCloneCreate, VoiceCloneUpdate } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  useCreateVoiceClone,
  useUpdateVoiceClone,
} from "@/hooks/use-voice-clones"

const voiceCloneSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
})

type FormData = z.infer<typeof voiceCloneSchema>

interface VoiceCloneFormProps {
  clone?: VoiceClone
  mode: "create" | "edit"
}

export function VoiceCloneForm({ clone, mode }: VoiceCloneFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const createClone = useCreateVoiceClone()
  const updateClone = useUpdateVoiceClone()
  const [tags, setTags] = useState<string[]>(clone?.tags ?? [])
  const [tagInput, setTagInput] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(voiceCloneSchema),
    defaultValues: {
      name: clone?.name ?? "",
      description: clone?.description ?? "",
    },
  })

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === "create") {
        const createData: VoiceCloneCreate = {
          name: data.name,
          description: data.description || undefined,
          tags,
        }
        const newClone = await createClone.mutateAsync(createData)
        toast({
          title: "Voice clone created",
          description: "Your voice clone has been created successfully.",
        })
        router.push(`/voice-clones/${newClone.id}`)
      } else if (clone) {
        const updateData: VoiceCloneUpdate = {
          name: data.name,
          description: data.description || undefined,
          tags,
        }
        await updateClone.mutateAsync({ id: clone.id, data: updateData })
        toast({
          title: "Voice clone updated",
          description: "Your changes have been saved.",
        })
        router.push(`/voice-clones/${clone.id}`)
      }
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${mode} voice clone. Please try again.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Voice Clone" : "Edit Voice Clone"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new voice clone to capture a unique writing style."
            : "Update your voice clone details."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Professional Blog Voice"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the voice and its intended use..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Voice Clone"
                  : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
