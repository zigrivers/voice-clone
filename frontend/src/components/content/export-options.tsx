/**
 * Export options component - Export content in various formats
 */

"use client"

import { useState } from "react"
import {
  Download,
  Copy,
  Check,
  FileText,
  FileJson,
  FileCode,
  Mail,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type ExportFormat = "txt" | "md" | "json" | "html" | "email"

interface ExportContent {
  content: string
  platform?: string
  voiceCloneName?: string
  createdAt?: string
  tags?: string[]
  detectionScore?: number
}

interface ExportOptionsProps {
  content: ExportContent | ExportContent[]
  filename?: string
  trigger?: React.ReactNode
}

const formatConfig: Record<
  ExportFormat,
  {
    label: string
    icon: React.ElementType
    extension: string
    mimeType: string
    description: string
  }
> = {
  txt: {
    label: "Plain Text",
    icon: FileText,
    extension: ".txt",
    mimeType: "text/plain",
    description: "Simple text file, works everywhere",
  },
  md: {
    label: "Markdown",
    icon: FileCode,
    extension: ".md",
    mimeType: "text/markdown",
    description: "Formatted text for documentation",
  },
  json: {
    label: "JSON",
    icon: FileJson,
    extension: ".json",
    mimeType: "application/json",
    description: "Structured data with metadata",
  },
  html: {
    label: "HTML",
    icon: FileCode,
    extension: ".html",
    mimeType: "text/html",
    description: "Web-ready formatted content",
  },
  email: {
    label: "Email Draft",
    icon: Mail,
    extension: ".eml",
    mimeType: "message/rfc822",
    description: "Ready to open in email client",
  },
}

export function ExportOptions({
  content,
  filename = "content",
  trigger,
}: ExportOptionsProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("txt")
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const items = Array.isArray(content) ? content : [content]
  const isMultiple = items.length > 1

  const generateExport = (format: ExportFormat): string => {
    switch (format) {
      case "txt":
        return items.map((item) => item.content).join("\n\n---\n\n")

      case "md":
        return items
          .map((item, index) => {
            let md = ""
            if (isMultiple) {
              md += `## Content ${index + 1}\n\n`
            }
            if (item.voiceCloneName) {
              md += `**Voice:** ${item.voiceCloneName}\n\n`
            }
            if (item.platform) {
              md += `**Platform:** ${item.platform}\n\n`
            }
            md += item.content
            if (item.tags && item.tags.length > 0) {
              md += `\n\n**Tags:** ${item.tags.join(", ")}`
            }
            if (item.detectionScore !== undefined) {
              md += `\n\n**AI Detection Score:** ${item.detectionScore}%`
            }
            return md
          })
          .join("\n\n---\n\n")

      case "json":
        return JSON.stringify(
          isMultiple
            ? {
                exportedAt: new Date().toISOString(),
                count: items.length,
                items: items.map((item) => ({
                  content: item.content,
                  platform: item.platform,
                  voiceClone: item.voiceCloneName,
                  createdAt: item.createdAt,
                  tags: item.tags,
                  detectionScore: item.detectionScore,
                })),
              }
            : {
                exportedAt: new Date().toISOString(),
                content: items[0].content,
                platform: items[0].platform,
                voiceClone: items[0].voiceCloneName,
                createdAt: items[0].createdAt,
                tags: items[0].tags,
                detectionScore: items[0].detectionScore,
              },
          null,
          2
        )

      case "html":
        const htmlItems = items
          .map(
            (item, index) => `
    <article class="content-item">
      ${isMultiple ? `<h2>Content ${index + 1}</h2>` : ""}
      ${item.voiceCloneName ? `<p class="meta"><strong>Voice:</strong> ${item.voiceCloneName}</p>` : ""}
      ${item.platform ? `<p class="meta"><strong>Platform:</strong> ${item.platform}</p>` : ""}
      <div class="content">${item.content.replace(/\n/g, "<br>")}</div>
      ${item.tags?.length ? `<p class="tags"><strong>Tags:</strong> ${item.tags.join(", ")}</p>` : ""}
      ${item.detectionScore !== undefined ? `<p class="score"><strong>AI Detection Score:</strong> ${item.detectionScore}%</p>` : ""}
    </article>`
          )
          .join("\n    <hr>\n")

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Content</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .content-item { margin-bottom: 2rem; }
    .meta { color: #666; font-size: 0.9rem; }
    .content { white-space: pre-wrap; line-height: 1.6; }
    .tags { font-size: 0.9rem; }
    .score { font-size: 0.9rem; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>Exported Content</h1>
  <p class="meta">Exported on ${new Date().toLocaleString()}</p>
  ${htmlItems}
</body>
</html>`

      case "email":
        const emailContent = items[0]
        const subject = emailContent.platform
          ? `Content for ${emailContent.platform}`
          : "Exported Content"
        return `To:
Subject: ${subject}
Content-Type: text/plain; charset="utf-8"

${emailContent.content}

---
Exported from Voice Clone App
${emailContent.voiceCloneName ? `Voice: ${emailContent.voiceCloneName}` : ""}
${emailContent.platform ? `Platform: ${emailContent.platform}` : ""}`

      default:
        return items[0].content
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportContent = generateExport(selectedFormat)
      const config = formatConfig[selectedFormat]

      const blob = new Blob([exportContent], { type: config.mimeType })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}${config.extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: `Content exported as ${config.label}`,
      })
      setOpen(false)
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopy = async () => {
    try {
      const exportContent = generateExport(selectedFormat)
      await navigator.clipboard.writeText(exportContent)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy content",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Content</DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `Export ${items.length} items in your preferred format`
              : "Choose a format to export your content"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(formatConfig) as ExportFormat[]).map((format) => {
                const config = formatConfig[format]
                const Icon = config.icon
                const isSelected = selectedFormat === format
                const isDisabled = format === "email" && isMultiple

                return (
                  <button
                    key={format}
                    onClick={() => !isDisabled && setSelectedFormat(format)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {config.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="relative">
              <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-[150px]">
                {generateExport(selectedFormat).slice(0, 500)}
                {generateExport(selectedFormat).length > 500 && "..."}
              </pre>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button
            className="flex-1"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick export function for programmatic use
export async function quickExport(
  content: string,
  format: ExportFormat = "txt",
  filename = "content"
) {
  const config = formatConfig[format]
  const blob = new Blob([content], { type: config.mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}${config.extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
