"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ChevronRight,
  RotateCcw,
  Shield,
  CheckCircle,
  XCircle,
  ClipboardCopy,
  FileText,
  Package,
  Copy,
  Clock,
  AlertCircle,
  Plus,
  Loader,
  Trash2,
  ShieldCheck,
  FileCheck,
  FileX,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MOCK_INGESTIONS,
  MOCK_QUARANTINE,
  MOCK_DUPLICATES,
  MOCK_ACTIVITY,
  MOCK_ARTIFACTS,
  formatFileSize,
  timeAgo,
  type IngestionStatus,
  type ActivityAction,
} from "@/lib/mock-data"
import {
  statusBadgeClass,
  statusLabel,
  sourceBadgeClass,
  sourceLabel,
  reasonBadgeClass,
  reasonLabel,
  severityBadgeClass,
  severityLabel,
  strategyLabel,
  resolutionBadgeClass,
  resolutionLabel,
  activityActionBadgeClass,
  isTerminalStatus,
  confidenceColor,
} from "@/lib/badges"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/ingestion/role-context"
import { format } from "date-fns"

type Tab = "overview" | "artifacts" | "quarantine" | "duplicates" | "activity"

const ALL_STATUSES: IngestionStatus[] = [
  "pending", "validating", "accepted", "quarantined", "retrying",
  "deduplicating", "finalizing", "completed", "failed", "cancelled"
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ClipboardCopy className="size-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function RetryDialog({ open, onClose, currentAttempt, maxRetries, hasUnresolvedQuarantines, isAdmin }: {
  open: boolean; onClose: () => void
  currentAttempt: number; maxRetries: number
  hasUnresolvedQuarantines: boolean; isAdmin: boolean
}) {
  const [forceRetry, setForceRetry] = useState(false)
  const maxReached = currentAttempt >= maxRetries
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Retry Ingestion</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Retry attempt <span className="font-medium text-foreground">{currentAttempt + 1} of {maxRetries}</span>.
          </p>
          {hasUnresolvedQuarantines && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              Unresolved quarantine records must be resolved before retrying.
            </div>
          )}
          {isAdmin && maxReached && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="force-retry"
                checked={forceRetry}
                onCheckedChange={v => setForceRetry(!!v)}
              />
              <Label htmlFor="force-retry" className="text-sm cursor-pointer">
                Force retry (bypasses retry limit — admin only)
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={hasUnresolvedQuarantines || (maxReached && !forceRetry)}
            onClick={onClose}
          >
            <RotateCcw className="size-4" />
            {maxReached ? "Force Retry" : "Retry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FinalizeDialog({ open, onClose, hasArtifacts, hasActiveQuarantine, hasUnresolvedDuplicates }: {
  open: boolean; onClose: () => void
  hasArtifacts: boolean; hasActiveQuarantine: boolean; hasUnresolvedDuplicates: boolean
}) {
  const [notes, setNotes] = useState("")
  const allPassed = !hasActiveQuarantine && !hasUnresolvedDuplicates
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalize Ingestion</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prerequisites</p>
            {[
              { label: "All artifacts validated", passed: hasArtifacts },
              { label: "No unresolved quarantines", passed: !hasActiveQuarantine },
              { label: "All duplicates resolved", passed: !hasUnresolvedDuplicates },
            ].map(({ label, passed }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <CheckCircle className={cn("size-4", passed ? "text-emerald-600" : "text-muted-foreground/40")} />
                <span className={passed ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes about this finalization..."
              className="text-sm min-h-20 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!allPassed} onClick={onClose}>
            <CheckCircle className="size-4" />
            Finalize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LifecycleFlow({ currentStatus }: { currentStatus: IngestionStatus }) {
  const flow: IngestionStatus[] = ["pending", "validating", "accepted", "deduplicating", "finalizing", "completed"]
  const sideStates: IngestionStatus[] = ["quarantined", "retrying", "failed", "cancelled"]
  const currentIdx = flow.indexOf(currentStatus)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 flex-wrap">
        {flow.map((state, idx) => {
          const isCurrent = currentStatus === state
          const isPast = currentIdx > idx && currentIdx !== -1
          return (
            <div key={state} className="flex items-center gap-1">
              <div className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border",
                isCurrent
                  ? "bg-foreground text-background border-foreground"
                  : isPast
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                  : "bg-muted text-muted-foreground border-dashed border-border"
              )}>
                {statusLabel(state)}
              </div>
              {idx < flow.length - 1 && (
                <ChevronRight className="size-3 text-muted-foreground shrink-0" />
              )}
            </div>
          )
        })}
      </div>
      {sideStates.includes(currentStatus) && (
        <div className="flex items-center gap-2">
          <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Current state: <span className={cn("font-medium", statusBadgeClass(currentStatus).includes("red") ? "text-red-600" : "text-amber-600")}>{statusLabel(currentStatus)}</span>
          </p>
        </div>
      )}
    </div>
  )
}

function OverviewTab({ ingestionId }: { ingestionId: string }) {
  const { role } = useRole()
  const ingestion = MOCK_INGESTIONS.find(i => i.id === ingestionId)
  const [showRetry, setShowRetry] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)

  if (!ingestion) return null

  const activeQuarantine = MOCK_QUARANTINE.filter(q => q.ingestionId === ingestionId && q.status === "active")
  const unresolvedDups = MOCK_DUPLICATES.filter(d => d.sourceIngestionId === ingestionId && d.resolution === "unresolved")
  const artifacts = MOCK_ARTIFACTS.filter(a => a.ingestionId === ingestionId)

  const infoRows = [
    { label: "Ingestion ID", value: (
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm">{ingestion.id}</span>
        <CopyButton text={ingestion.id} />
      </div>
    )},
    { label: "Status", value: (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusBadgeClass(ingestion.status))}>
        {statusLabel(ingestion.status)}
      </span>
    )},
    { label: "Source", value: (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", sourceBadgeClass(ingestion.sourceType))}>
        {sourceLabel(ingestion.sourceType)}
      </span>
    )},
    { label: "Source URI", value: <span className="text-sm font-mono text-muted-foreground break-all">{ingestion.sourceUri}</span> },
    { label: "File Name", value: <span className="text-sm">{ingestion.fileName}</span> },
    { label: "MIME Type", value: <span className="text-sm font-mono text-muted-foreground">{ingestion.mimeType}</span> },
    { label: "File Size", value: <span className="text-sm">{formatFileSize(ingestion.fileSize)}</span> },
    { label: "Retry Count", value: <span className="text-sm">{ingestion.retryCount} of {ingestion.maxRetries}</span> },
    { label: "Created By", value: (
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
            {ingestion.createdBy.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{ingestion.createdBy}</span>
      </div>
    )},
    { label: "Created At", value: <span className="text-sm">{format(ingestion.createdAt, "MMM d, yyyy HH:mm")} ({timeAgo(ingestion.createdAt)})</span> },
    { label: "Updated At", value: <span className="text-sm">{format(ingestion.updatedAt, "MMM d, yyyy HH:mm")} ({timeAgo(ingestion.updatedAt)})</span> },
    ...(ingestion.completedAt ? [{ label: "Completed At", value: <span className="text-sm">{format(ingestion.completedAt, "MMM d, yyyy HH:mm")}</span> }] : []),
    ...(ingestion.failedAt ? [{ label: "Failed At", value: <span className="text-sm text-red-600">{format(ingestion.failedAt, "MMM d, yyyy HH:mm")}</span> }] : []),
    ...(ingestion.failureReason ? [{ label: "Failure Reason", value: <span className="text-sm text-red-600">{ingestion.failureReason}</span> }] : []),
  ]

  const metaEntries = Object.entries(ingestion.metadata)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left col */}
      <div className="col-span-2 flex flex-col gap-6">
        {/* Details card */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Ingestion Details</h3>
          </div>
          <div className="divide-y divide-border">
            {infoRows.map(row => (
              <div key={row.label} className="flex items-start gap-4 px-6 py-3">
                <span className="text-sm text-muted-foreground w-28 shrink-0">{row.label}</span>
                <div className="flex-1">{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifecycle */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Lifecycle</h3>
          </div>
          <div className="p-6">
            <LifecycleFlow currentStatus={ingestion.status} />
          </div>
        </div>
      </div>

      {/* Right col */}
      <div className="flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Quick Actions</h3>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {role !== "viewer" && (ingestion.status === "quarantined" || ingestion.status === "failed") && (
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowRetry(true)}>
                <RotateCcw className="size-4" />
                Retry
              </Button>
            )}
            {role === "admin" && ingestion.status === "validating" && (
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="size-4" />
                Quarantine
              </Button>
            )}
            {role === "admin" && (ingestion.status === "accepted" || ingestion.status === "deduplicating") && (
              <Button size="sm" className="w-full justify-start" onClick={() => setShowFinalize(true)}>
                <CheckCircle className="size-4" />
                Finalize
              </Button>
            )}
            {role === "admin" && !isTerminalStatus(ingestion.status) && (
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-600 border-red-200 hover:bg-red-500/5">
                <XCircle className="size-4" />
                Cancel Ingestion
              </Button>
            )}
            {isTerminalStatus(ingestion.status) && role === "viewer" && (
              <p className="text-xs text-muted-foreground text-center py-2">No actions available</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Metadata</h3>
          </div>
          <div className="p-4">
            {metaEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No metadata</p>
            ) : (
              <div className="flex flex-col gap-2">
                {metaEntries.map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground font-mono shrink-0">{k}:</span>
                    <span className="text-xs text-foreground break-all">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RetryDialog
        open={showRetry}
        onClose={() => setShowRetry(false)}
        currentAttempt={ingestion.retryCount}
        maxRetries={ingestion.maxRetries}
        hasUnresolvedQuarantines={activeQuarantine.length > 0}
        isAdmin={role === "admin"}
      />
      <FinalizeDialog
        open={showFinalize}
        onClose={() => setShowFinalize(false)}
        hasArtifacts={artifacts.length > 0}
        hasActiveQuarantine={activeQuarantine.length > 0}
        hasUnresolvedDuplicates={unresolvedDups.length > 0}
      />
    </div>
  )
}

function ArtifactsTab({ ingestionId }: { ingestionId: string }) {
  const { role } = useRole()
  const artifacts = MOCK_ARTIFACTS.filter(a => a.ingestionId === ingestionId)

  if (artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-border rounded-xl bg-card">
        <Package className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No artifacts yet</p>
      </div>
    )
  }

  const validationBadge = (status: string) => {
    if (status === "valid") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    if (status === "invalid") return "bg-red-500/10 text-red-600 dark:text-red-400"
    return "bg-muted text-muted-foreground"
  }

  return (
    <div className="flex flex-col gap-4">
      {artifacts.map(artifact => (
        <div key={artifact.id} className="border border-border rounded-xl bg-card p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{artifact.fileName}</p>
              <p className="text-xs text-muted-foreground">{artifact.mimeType} · {formatFileSize(artifact.fileSize)}</p>
            </div>
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium shrink-0", validationBadge(artifact.validationStatus))}>
              {artifact.validationStatus.charAt(0).toUpperCase() + artifact.validationStatus.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Checksum ({artifact.checksumAlgorithm.toUpperCase()})</p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono text-foreground">{artifact.checksum.slice(0, 16)}…</span>
                <CopyButton text={artifact.checksum} />
              </div>
            </div>
            {(role === "admin" || role === "editor") && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Storage Key</p>
                <span className="text-xs font-mono text-foreground break-all">{artifact.storageKey}</span>
              </div>
            )}
          </div>

          {artifact.validationErrors && artifact.validationErrors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-600 mb-1">Validation Errors</p>
              <ul className="flex flex-col gap-1">
                {artifact.validationErrors.map((err, i) => (
                  <li key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="size-3 shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {artifact.validatedAt && (
            <p className="text-xs text-muted-foreground">
              Validated {timeAgo(artifact.validatedAt)}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function QuarantineTab({ ingestionId }: { ingestionId: string }) {
  const { role } = useRole()
  const records = MOCK_QUARANTINE.filter(q => q.ingestionId === ingestionId)
  const [releaseId, setReleaseId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [explanation, setExplanation] = useState("")

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-border rounded-xl bg-card">
        <ShieldCheck className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No quarantine records</p>
      </div>
    )
  }

  const statusCls = {
    active: "bg-red-500/10 text-red-600 dark:text-red-400",
    released: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    deleted: "bg-red-500/10 text-red-600 dark:text-red-400",
    expired: "bg-muted text-muted-foreground",
  }

  return (
    <div className="flex flex-col gap-4">
      {records.map(record => (
        <div key={record.id} className="border border-border rounded-xl bg-card p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", reasonBadgeClass(record.reason))}>
                {reasonLabel(record.reason)}
              </span>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", severityBadgeClass(record.severity))}>
                {severityLabel(record.severity)}
              </span>
            </div>
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium shrink-0", statusCls[record.status])}>
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{record.details}</p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Quarantined</p>
              <p className="text-foreground">{timeAgo(record.quarantinedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className={cn("text-foreground", !record.expiresAt && "text-muted-foreground")}>
                {record.expiresAt ? timeAgo(record.expiresAt) : "Never"}
              </p>
            </div>
            {record.resolvedBy && (
              <>
                <div>
                  <p className="text-muted-foreground">Resolved by</p>
                  <p className="text-foreground">{record.resolvedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resolved at</p>
                  <p className="text-foreground">{record.resolvedAt ? timeAgo(record.resolvedAt) : "—"}</p>
                </div>
              </>
            )}
          </div>

          {role === "admin" && record.status === "active" && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="h-8" onClick={() => setReleaseId(record.id)}>
                Release
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-600 border-red-200 hover:bg-red-500/5"
                onClick={() => setDeleteId(record.id)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}

      <Dialog open={!!releaseId} onOpenChange={() => setReleaseId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Release from Quarantine</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              This action will be permanently recorded in the audit log.
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">Explanation <span className="text-red-500">*</span></Label>
              <Textarea value={explanation} onChange={e => setExplanation(e.target.value)}
                placeholder="Describe why this item is safe to release..." className="text-sm min-h-20 resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReleaseId(null)}>Cancel</Button>
            <Button size="sm" disabled={!explanation.trim()} onClick={() => setReleaseId(null)}>Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete Quarantined Item</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              This action is permanent and cannot be undone.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(null)}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DuplicatesTab({ ingestionId }: { ingestionId: string }) {
  const dups = MOCK_DUPLICATES.filter(d => d.sourceIngestionId === ingestionId || d.matchedIngestionId === ingestionId)

  if (dups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-border rounded-xl bg-card">
        <Copy className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No duplicates detected</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {dups.map(d => (
        <div key={d.id} className="border border-border rounded-xl bg-card p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Matched with</p>
              <Link href={`/ingestions/${d.matchedIngestionId}`} className="text-sm font-medium text-foreground hover:underline">
                {d.matchedFileName}
              </Link>
              <p className="text-xs text-muted-foreground font-mono">{d.matchedIngestionId}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-2xl font-semibold", confidenceColor(d.confidence))}>{d.confidence}%</p>
              <p className="text-xs text-muted-foreground">confidence</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {strategyLabel(d.strategy)}
            </span>
            {d.resolution !== "unresolved" && (
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", resolutionBadgeClass(d.resolution))}>
                {resolutionLabel(d.resolution)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-muted-foreground">{d.checksum.slice(0, 20)}…</span>
            <CopyButton text={d.checksum} />
          </div>

          <p className="text-xs text-muted-foreground">Detected {timeAgo(d.detectedAt)}</p>
        </div>
      ))}
    </div>
  )
}

function ActivityTab({ ingestionId }: { ingestionId: string }) {
  const entries = MOCK_ACTIVITY
    .filter(a => a.ingestionId === ingestionId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const actionIcon = (action: ActivityAction) => {
    const cls = "size-4"
    const map: Record<string, React.ReactNode> = {
      "Ingestion Created": <Plus className={cls} />,
      "Validated": <CheckCircle className={cls} />,
      "Accepted": <CheckCircle className={cls} />,
      "Completed": <CheckCircle className={cls} />,
      "Quarantined": <Shield className={cls} />,
      "Retrying": <RotateCcw className={cls} />,
      "Deduplicating": <Copy className={cls} />,
      "Finalizing": <Loader className={cls} />,
      "Failed": <XCircle className={cls} />,
      "Cancelled": <XCircle className={cls} />,
      "Quarantine Released": <ShieldCheck className={cls} />,
      "Quarantine Deleted": <Trash2 className={cls} />,
      "Quarantine Expired": <Clock className={cls} />,
      "Artifact Validated": <FileCheck className={cls} />,
      "Artifact Rejected": <FileX className={cls} />,
      "Dedup Detected": <AlertCircle className={cls} />,
      "Dedup Resolved": <CheckCircle className={cls} />,
    }
    return map[action] ?? <Clock className={cls} />
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-border rounded-xl bg-card">
        <Clock className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No activity recorded</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="divide-y divide-border">
        {entries.map(entry => (
          <div key={entry.id}>
            <div className="flex items-center gap-4 px-6 py-4">
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center shrink-0",
                activityActionBadgeClass(entry.action)
              )}>
                {actionIcon(entry.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{entry.action}</span>
                  <span className="text-xs text-muted-foreground">by {entry.actorName}</span>
                </div>
                {entry.previousState && entry.newState && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span className="capitalize">{entry.previousState}</span>
                    <span>→</span>
                    <span className="capitalize text-foreground">{entry.newState}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{timeAgo(entry.timestamp)}</span>
                {entry.details && (
                  <button
                    onClick={() => toggle(entry.id)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded.has(entry.id) && "rotate-180")} />
                  </button>
                )}
              </div>
            </div>

            {expanded.has(entry.id) && entry.details && (
              <div className="px-6 pb-4 bg-muted/20">
                <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap bg-card border border-border rounded-lg p-3">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function IngestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role } = useRole()
  const initialTab = (searchParams.get("tab") as Tab) || "overview"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [showRetry, setShowRetry] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)

  const ingestion = MOCK_INGESTIONS.find(i => i.id === id)

  if (!ingestion) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-96 gap-4">
        <AlertCircle className="size-12 text-muted-foreground/40" />
        <div className="text-center">
          <p className="text-lg font-semibold">Ingestion not found</p>
          <p className="text-sm text-muted-foreground mt-1">The ingestion with ID &ldquo;{id}&rdquo; does not exist.</p>
        </div>
        <Button size="sm" onClick={() => router.push("/")} variant="outline">
          Back to Queue
        </Button>
      </div>
    )
  }

  const activeQuarantine = MOCK_QUARANTINE.filter(q => q.ingestionId === id && q.status === "active")
  const allQuarantine = MOCK_QUARANTINE.filter(q => q.ingestionId === id)
  const allDuplicates = MOCK_DUPLICATES.filter(d => d.sourceIngestionId === id || d.matchedIngestionId === id)
  const unresolvedDups = allDuplicates.filter(d => d.resolution === "unresolved")
  const allActivity = MOCK_ACTIVITY.filter(a => a.ingestionId === id)
  const artifacts = MOCK_ARTIFACTS.filter(a => a.ingestionId === id)

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number; redDot?: boolean }[] = [
    { id: "overview", label: "Overview", icon: <FileText className="size-4" /> },
    { id: "artifacts", label: "Artifacts", icon: <Package className="size-4" />, badge: artifacts.length || undefined },
    { id: "quarantine", label: "Quarantine", icon: <Shield className="size-4" />, redDot: activeQuarantine.length > 0 },
    { id: "duplicates", label: "Duplicates", icon: <Copy className="size-4" />, badge: allDuplicates.length || undefined },
    { id: "activity", label: "Activity", icon: <Clock className="size-4" /> },
  ]

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Queue</Link>
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="text-foreground font-medium truncate max-w-xs">{ingestion.fileName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-balance truncate">{ingestion.fileName}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusBadgeClass(ingestion.status))}>
              {statusLabel(ingestion.status)}
            </span>
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", sourceBadgeClass(ingestion.sourceType))}>
              {sourceLabel(ingestion.sourceType)}
            </span>
            <span className="text-xs text-muted-foreground">{formatFileSize(ingestion.fileSize)}</span>
            <span className="text-xs text-muted-foreground">{ingestion.mimeType}</span>
            {ingestion.retryCount > 0 && (
              <span className="text-xs text-muted-foreground">{ingestion.retryCount}/{ingestion.maxRetries} retries</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {role !== "viewer" && (ingestion.status === "quarantined" || ingestion.status === "failed") && (
            <Button variant="outline" size="sm" onClick={() => setShowRetry(true)}>
              <RotateCcw className="size-4" />
              Retry
            </Button>
          )}
          {role === "admin" && ingestion.status === "validating" && (
            <Button variant="outline" size="sm">
              <Shield className="size-4" />
              Quarantine
            </Button>
          )}
          {role === "admin" && (ingestion.status === "accepted" || ingestion.status === "deduplicating") && (
            <Button size="sm" onClick={() => setShowFinalize(true)}>
              <CheckCircle className="size-4" />
              Finalize
            </Button>
          )}
          {role === "admin" && !isTerminalStatus(ingestion.status) && (
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600">
              <XCircle className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border gap-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 h-10 text-sm font-medium transition-colors border-b-2 -mb-px relative",
              tab === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && (
              <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
                {t.badge}
              </span>
            )}
            {t.redDot && (
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewTab ingestionId={id} />}
      {tab === "artifacts" && <ArtifactsTab ingestionId={id} />}
      {tab === "quarantine" && <QuarantineTab ingestionId={id} />}
      {tab === "duplicates" && <DuplicatesTab ingestionId={id} />}
      {tab === "activity" && <ActivityTab ingestionId={id} />}

      {/* Top-level dialogs */}
      <RetryDialog
        open={showRetry}
        onClose={() => setShowRetry(false)}
        currentAttempt={ingestion.retryCount}
        maxRetries={ingestion.maxRetries}
        hasUnresolvedQuarantines={activeQuarantine.length > 0}
        isAdmin={role === "admin"}
      />
      <FinalizeDialog
        open={showFinalize}
        onClose={() => setShowFinalize(false)}
        hasArtifacts={artifacts.length > 0}
        hasActiveQuarantine={activeQuarantine.length > 0}
        hasUnresolvedDuplicates={unresolvedDups.length > 0}
      />
    </div>
  )
}
