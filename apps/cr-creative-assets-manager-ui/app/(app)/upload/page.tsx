"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  X,
  File,
  ChevronRight,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBytes, type AssetType } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Document" },
  { value: "brand_asset", label: "Brand Asset" },
  { value: "campaign_file", label: "Campaign File" },
  { value: "ai_generated", label: "AI Generated" },
];

const PROJECTS = [
  "Q4 Campaign 2025",
  "Spring Collection 2026",
  "Brand Refresh 2025",
  "Q2 Social Campaign",
  "Holiday 2025",
  "Product Line Alpha",
  "Client XYZ",
];

export default function UploadPage() {
  const router = useRouter();
  const { can } = useRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "">("");
  const [project, setProject] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [promptRef, setPromptRef] = useState("");
  const [derivedFrom, setDerivedFrom] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!can("upload")) {
      router.replace("/");
    }
  }, [can, router]);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setAssetName((n) => (n ? n : f.name.replace(/\.[^.]+$/, "")));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!file) errs.file = "Please select a file to upload.";
    if (!assetName.trim()) errs.name = "Asset name is required.";
    else if (assetName.length > 255) errs.name = "Name must be 255 characters or fewer.";
    if (!assetType) errs.type = "Asset type is required.";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 80));
      setProgress(i);
    }
    setUploading(false);
    router.push("/assets/ast_001?tab=overview&uploaded=true");
  };

  const storageUsedPct = 28.4;
  const nearLimit = storageUsedPct >= 90;

  if (!can("upload")) return null;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Library
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">Upload</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">Upload Asset</h1>

      {/* Dropzone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors",
            dragOver
              ? "border-foreground bg-muted/50"
              : "border-border hover:border-muted-foreground/50 hover:bg-muted/20",
            errors.file && "border-red-500/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="size-16 rounded-xl bg-muted flex items-center justify-center">
            <Upload className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drag and drop your file here
            </p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports all file types — images, video, audio, documents
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card p-4 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <File className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => setFile(null)}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      {errors.file && (
        <p className="text-xs text-red-600 dark:text-red-400 -mt-3 flex items-center gap-1">
          <AlertCircle className="size-3" />
          {errors.file}
        </p>
      )}

      {/* Form + AI panel */}
      <div className="grid grid-cols-3 gap-6">
        {/* Form */}
        <div className="col-span-2 border border-border rounded-xl bg-card p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-base">Asset Details</h2>

          {/* Asset Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g., Q4 Campaign Hero Banner"
              className={cn("h-9 text-sm", errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="size-3" />{errors.name}
              </p>
            )}
          </div>

          {/* Asset Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className={cn(
                "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.type && "border-red-500"
              )}
            >
              <option value="">Select type...</option>
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="size-3" />{errors.type}
              </p>
            )}
          </div>

          {/* Project */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Project</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">No project</option>
              {PROJECTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Auto-detected info */}
          {file && (
            <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Auto-detected
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Filename</p>
                  <p className="text-xs text-foreground font-medium truncate">{file.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="text-xs text-foreground font-medium">{formatBytes(file.size)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">MIME Type</p>
                  <p className="text-xs text-foreground font-medium truncate">{file.type || "unknown"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Provenance panel */}
        {assetType === "ai_generated" ? (
          <div className="border border-amber-500/30 rounded-xl bg-card p-6 flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-base">AI Provenance</h2>
              <p className="text-xs text-muted-foreground mt-1">
                AI-generated content requires provenance tracking
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">AI Model</label>
              <Input
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                placeholder="e.g., midjourney-v6, dall-e-3"
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Prompt Reference</label>
              <Input
                value={promptRef}
                onChange={(e) => setPromptRef(e.target.value)}
                placeholder="e.g., PRF-2025-001"
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Derived From</label>
              <Input
                value={derivedFrom}
                onChange={(e) => setDerivedFrom(e.target.value)}
                placeholder="Parent asset ID (optional)"
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Origin</label>
              <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md border border-border">
                ai_model
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Provenance will be automatically recorded and risk-scored upon upload.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-base">Guidelines</h2>
            <div className="flex flex-col gap-3">
              {[
                "Supported: Images, video, audio, documents, and archives",
                "Max file size: 5 GB per upload",
                "Filename must be unique within the project",
                "All assets are assigned a checksum for integrity tracking",
                "AI-generated assets require provenance metadata",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Storage quota + buttons */}
      <div className="border border-border rounded-xl bg-card p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Storage Quota</span>
            <span className="text-sm text-muted-foreground">
              14.2 GB of 50 GB used ({storageUsedPct}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                nearLimit ? "bg-red-500" : "bg-foreground"
              )}
              style={{ width: `${storageUsedPct}%` }}
            />
          </div>
          {nearLimit && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="size-3" />
              Storage is almost full. Consider archiving unused assets.
            </p>
          )}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Link href="/">
            <Button variant="outline" size="sm" disabled={uploading}>
              Cancel
            </Button>
          </Link>
          <Button size="sm" onClick={handleSubmit} disabled={uploading} className="gap-2">
            {uploading ? (
              <>
                <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Upload Asset
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
