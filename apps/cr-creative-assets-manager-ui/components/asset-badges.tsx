import { cn } from "@/lib/utils";
import type { AssetState, AssetType } from "@/lib/mock-data";

const STATE_STYLES: Record<AssetState, string> = {
  uploaded: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  draft: "bg-muted text-muted-foreground",
  under_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  exported: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  archived: "bg-muted text-muted-foreground",
};

const STATE_LABELS: Record<AssetState, string> = {
  uploaded: "Uploaded",
  draft: "Draft",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  exported: "Exported",
  archived: "Archived",
};

const TYPE_STYLES: Record<AssetType, string> = {
  image: "bg-muted text-muted-foreground",
  video: "bg-muted text-muted-foreground",
  audio: "bg-muted text-muted-foreground",
  document: "bg-muted text-muted-foreground",
  brand_asset: "bg-muted text-muted-foreground",
  campaign_file: "bg-muted text-muted-foreground",
  ai_generated: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const TYPE_LABELS: Record<AssetType, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  document: "Document",
  brand_asset: "Brand Asset",
  campaign_file: "Campaign File",
  ai_generated: "AI Generated",
};

const BASE = "px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center";

export function StateBadge({ state }: { state: AssetState }) {
  return (
    <span className={cn(BASE, STATE_STYLES[state])}>
      {STATE_LABELS[state]}
    </span>
  );
}

export function TypeBadge({ type }: { type: AssetType }) {
  return (
    <span className={cn(BASE, TYPE_STYLES[type])}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export function LegalHoldBadge() {
  return (
    <span className={cn(BASE, "bg-red-500/10 text-red-600 dark:text-red-400")}>
      Legal Hold
    </span>
  );
}

export function FormatBadge({ format }: { format: string }) {
  return (
    <span className={cn(BASE, "bg-blue-500/10 text-blue-600 dark:text-blue-400")}>
      {format}
    </span>
  );
}
