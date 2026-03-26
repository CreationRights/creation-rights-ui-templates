"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Upload,
  Plus,
  Trash2,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/ingestion/role-context"
import { formatFileSize } from "@/lib/mock-data"

type Channel = "upload" | "api" | "cloud"

interface KVPair {
  key: string
  value: string
}

function MetadataEditor({ pairs, onChange }: {
  pairs: KVPair[]
  onChange: (pairs: KVPair[]) => void
}) {
  const addPair = () => {
    if (pairs.length >= 50) return
    onChange([...pairs, { key: "", value: "" }])
  }
  const removePair = (i: number) => onChange(pairs.filter((_, idx) => idx !== i))
  const updatePair = (i: number, field: "key" | "value", val: string) => {
    const updated = [...pairs]
    updated[i] = { ...updated[i], [field]: val }
    onChange(updated)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Metadata</Label>
        <span className="text-xs text-muted-foreground">{pairs.length}/50 fields</span>
      </div>
      {pairs.length > 0 && (
        <div className="flex flex-col gap-2">
          {pairs.map((pair, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="key"
                value={pair.key}
                onChange={e => updatePair(i, "key", e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <Input
                placeholder="value"
                value={pair.value}
                onChange={e => updatePair(i, "value", e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => removePair(i)}
                type="button"
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={addPair}
        disabled={pairs.length >= 50}
        className="self-start text-xs h-8"
      >
        <Plus className="size-4" />
        Add field
      </Button>
    </div>
  )
}

function UploadChannel() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [checksum, setChecksum] = useState("")
  const [algorithm, setAlgorithm] = useState<"sha256" | "md5">("sha256")
  const [metadata, setMetadata] = useState<KVPair[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setFileName(f.name) }
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setFileName(f.name) }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-3 transition-colors",
          dragging ? "border-foreground bg-muted/30" : "border-border",
          !file && "cursor-pointer hover:border-foreground/50 hover:bg-muted/20"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
        {file ? (
          <div className="flex items-center gap-3 w-full max-w-sm">
            <FileText className="size-8 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              type="button"
              onClick={e => { e.stopPropagation(); setFile(null); setFileName("") }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="size-12 rounded-xl border border-border flex items-center justify-center">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drag and drop your file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse. Max 5 GB.</p>
            </div>
          </>
        )}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm" htmlFor="file-name">File Name <span className="text-red-500">*</span></Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="e.g. campaign-banner.jpg"
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">MIME Type</Label>
            <Input
              value={file?.type || ""}
              readOnly
              className="h-8 text-sm bg-muted/50 text-muted-foreground"
              placeholder="Auto-detected"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">File Size</Label>
            <Input
              value={file ? formatFileSize(file.size) : ""}
              readOnly
              className="h-8 text-sm bg-muted/50 text-muted-foreground"
              placeholder="—"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Algorithm</Label>
            <Select value={algorithm} onValueChange={v => setAlgorithm(v as "sha256" | "md5")}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sha256">SHA-256</SelectItem>
                <SelectItem value="md5">MD5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Checksum <span className="text-muted-foreground text-xs">(optional hex)</span></Label>
          <Input
            value={checksum}
            onChange={e => setChecksum(e.target.value)}
            placeholder="e.g. a3f4b2c1d5e6..."
            className="h-8 text-sm font-mono"
          />
        </div>

        <MetadataEditor pairs={metadata} onChange={setMetadata} />
      </div>
    </div>
  )
}

function ApiChannel() {
  const [sourceUrl, setSourceUrl] = useState("")
  const [contentType, setContentType] = useState("")
  const [payload, setPayload] = useState("")
  const [metadata, setMetadata] = useState<KVPair[]>([])
  const [urlError, setUrlError] = useState("")

  const validateUrl = (val: string) => {
    try { new URL(val); setUrlError("") } catch { setUrlError("Please enter a valid URL") }
    setSourceUrl(val)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm" htmlFor="source-url">Source URL <span className="text-red-500">*</span></Label>
        <Input
          id="source-url"
          value={sourceUrl}
          onChange={e => validateUrl(e.target.value)}
          placeholder="https://api.example.com/assets/file"
          className={cn("h-8 text-sm", urlError && "border-red-500")}
          required
        />
        {urlError && <p className="text-xs text-red-600">{urlError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm" htmlFor="content-type">Content Type <span className="text-red-500">*</span></Label>
        <Input
          id="content-type"
          value={contentType}
          onChange={e => setContentType(e.target.value)}
          placeholder="application/json"
          className="h-8 text-sm"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm" htmlFor="payload">Payload <span className="text-red-500">*</span></Label>
        <Textarea
          id="payload"
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder='{"asset_id": "...", "type": "image"}'
          className="font-mono text-sm min-h-32 resize-y"
          required
        />
      </div>

      <MetadataEditor pairs={metadata} onChange={setMetadata} />
    </div>
  )
}

function CloudChannel() {
  const [provider, setProvider] = useState<string>("")
  const [bucket, setBucket] = useState("")
  const [objectKey, setObjectKey] = useState("")
  const [region, setRegion] = useState("")
  const [checksum, setChecksum] = useState("")
  const [metadata, setMetadata] = useState<KVPair[]>([])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Cloud Provider <span className="text-red-500">*</span></Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="s3">Amazon S3</SelectItem>
            <SelectItem value="gcs">Google Cloud Storage</SelectItem>
            <SelectItem value="azure">Azure Blob Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm" htmlFor="bucket">Bucket Name <span className="text-red-500">*</span></Label>
          <Input
            id="bucket"
            value={bucket}
            onChange={e => setBucket(e.target.value)}
            placeholder="my-assets-bucket"
            className="h-8 text-sm"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm" htmlFor="region">Region <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            id="region"
            value={region}
            onChange={e => setRegion(e.target.value)}
            placeholder="us-east-1"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm" htmlFor="object-key">Object Key <span className="text-red-500">*</span></Label>
        <Input
          id="object-key"
          value={objectKey}
          onChange={e => setObjectKey(e.target.value)}
          placeholder="path/to/my-file.jpg"
          className="h-8 text-sm font-mono"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Expected Checksum (SHA-256) <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input
          value={checksum}
          onChange={e => setChecksum(e.target.value)}
          placeholder="e.g. a3f4b2c1..."
          className="h-8 text-sm font-mono"
        />
      </div>

      <MetadataEditor pairs={metadata} onChange={setMetadata} />
    </div>
  )
}

export default function NewIngestionPage() {
  const router = useRouter()
  const { role } = useRole()
  const [channel, setChannel] = useState<Channel>("upload")
  const [submitting, setSubmitting] = useState(false)

  // Viewer redirect
  if (role === "viewer") {
    router.replace("/")
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Simulate submit
    setTimeout(() => {
      setSubmitting(false)
      router.push("/ingestions/ing_01")
    }, 1500)
  }

  const TABS: { id: Channel; label: string }[] = [
    { id: "upload", label: "Direct Upload" },
    { id: "api", label: "API Payload" },
    { id: "cloud", label: "Cloud Import" },
  ]

  return (
    <div className="p-8 flex flex-col gap-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Queue
        </Link>
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="text-foreground font-medium">New Ingestion</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-balance">New Ingestion</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Channel tabs */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChannel(tab.id)}
                className={cn(
                  "flex-1 h-10 text-sm font-medium transition-colors border-b-2 -mb-px",
                  channel === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {channel === "upload" && <UploadChannel />}
            {channel === "api" && <ApiChannel />}
            {channel === "cloud" && <CloudChannel />}
          </div>
        </div>

        {/* Size error banner (shown when needed) */}
        {false && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-500/5 text-red-600 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            File size exceeds the maximum allowed limit of 5 GB.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="size-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Start Ingestion"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
