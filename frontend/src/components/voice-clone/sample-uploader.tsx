/**
 * Sample uploader component with tabs for paste, file, and URL
 */

"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Link2, ClipboardPaste, Loader2 } from "lucide-react"
import { SourceType } from "@/types"
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
import { cn } from "@/lib/utils"

interface SampleUploaderProps {
  onUpload: (data: {
    source_type: SourceType
    content?: string
    source_url?: string
    file?: File
  }) => Promise<void>
  isUploading?: boolean
}

type TabType = "paste" | "file" | "url"

export function SampleUploader({ onUpload, isUploading }: SampleUploaderProps) {
  const [activeTab, setActiveTab] = useState<TabType>("paste")
  const [pasteContent, setPasteContent] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleSubmit = async () => {
    switch (activeTab) {
      case "paste":
        if (pasteContent.trim()) {
          await onUpload({
            source_type: SourceType.PASTE,
            content: pasteContent.trim(),
          })
          setPasteContent("")
        }
        break
      case "file":
        if (selectedFile) {
          await onUpload({
            source_type: SourceType.FILE,
            file: selectedFile,
          })
          setSelectedFile(null)
        }
        break
      case "url":
        if (urlInput.trim()) {
          await onUpload({
            source_type: SourceType.URL,
            source_url: urlInput.trim(),
          })
          setUrlInput("")
        }
        break
    }
  }

  const wordCount = pasteContent
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  const tabs = [
    { id: "paste" as const, label: "Paste Text", icon: ClipboardPaste },
    { id: "file" as const, label: "Upload File", icon: FileText },
    { id: "url" as const, label: "From URL", icon: Link2 },
  ]

  const canSubmit =
    !isUploading &&
    ((activeTab === "paste" && pasteContent.trim().length > 0) ||
      (activeTab === "file" && selectedFile !== null) ||
      (activeTab === "url" && urlInput.trim().length > 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Writing Sample</CardTitle>
        <CardDescription>
          Upload or paste text to analyze your writing style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[200px]">
          {activeTab === "paste" && (
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your writing sample here..."
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground text-right">
                {wordCount.toLocaleString()} words
              </p>
            </div>
          )}

          {activeTab === "file" && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              {selectedFile ? (
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : isDragActive ? (
                <p className="text-muted-foreground">Drop the file here...</p>
              ) : (
                <div>
                  <p className="font-medium">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF, DOCX, and TXT (max 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-2">
              <Label htmlFor="url">Web Page URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL of a blog post, article, or other web content
                you&apos;ve written.
              </p>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Add Sample"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
