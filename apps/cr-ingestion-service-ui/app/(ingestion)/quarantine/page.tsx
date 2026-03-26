"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MOCK_QUARANTINE,
  timeAgo,
  type QuarantineReason,
  type Severity,
  type QuarantineRecord,
} from "@/lib/mock-data"
import {
  reasonBadgeClass,
  reasonLabel,
  severityBadgeClass,
  severityLabel,
} from "@/lib/badges"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/ingestion/role-context"
import { isBefore, addDays } from "date-fns"

const PAGE_SIZE = 20

const REASON_OPTIONS: QuarantineReason[] = [
  "malware_detected", "validation_failed", "size_exceeded",
  "mime_type_blocked", "integrity_mismatch", "policy_violation", "manual_hold",
]
const SEVERITY_OPTIONS: Severity[] = ["critical", "high", "medium", "low"]

function MetricCard({ label, value, trend, trendUp, description }: {
  label: string; value: number | string; trend: string; trendUp: boolean; description: string
}) {
  return (
    <div className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className={cn(
          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
          trendUp ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
        )}>
          {trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {trend}
        </span>
      </div>
      <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  )
}

function ResolutionBadge({ status }: { status: QuarantineRecord["status"] }) {
  const map = {
    active: "bg-red-500/10 text-red-600 dark:text-red-400",
    released: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    deleted: "bg-red-500/10 text-red-600 dark:text-red-400",
    expired: "bg-muted text-muted-foreground",
  }
  const labels = { active: "Active", released: "Released", deleted: "Deleted", expired: "Expired" }
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", map[status])}>
      {labels[status]}
    </span>
  )
}

function ReleaseDialog({ record, open, onClose }: {
  record: QuarantineRecord | null
  open: boolean
  onClose: () => void
}) {
  const [explanation, setExplanation] = useState("")
  if (!record) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Release from Quarantine</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>This action will be permanently recorded in the audit log. Releasing an item means it will proceed through the ingestion pipeline.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Explanation <span className="text-red-500">*</span></Label>
            <Textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Describe why this item is safe to release..."
              className="text-sm min-h-20 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!explanation.trim()} onClick={onClose}>
            Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ record, open, onClose }: {
  record: QuarantineRecord | null
  open: boolean
  onClose: () => void
}) {
  if (!record) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Quarantined Item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>This action is permanent and cannot be undone. The ingestion and all associated artifacts will be permanently deleted.</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You are about to delete <span className="font-medium text-foreground">{record.ingestionFileName}</span>.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="destructive" onClick={onClose}>Delete Permanently</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function QuarantinePage() {
  const router = useRouter()
  const { role } = useRole()
  const [search, setSearch] = useState("")
  const [selectedReasons, setSelectedReasons] = useState<QuarantineReason[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([])
  const [statusFilter, setStatusFilter] = useState<"active" | "resolved" | "all">("active")
  const [page, setPage] = useState(1)
  const [releaseRecord, setReleaseRecord] = useState<QuarantineRecord | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<QuarantineRecord | null>(null)

  const now = new Date()
  const activeCount = MOCK_QUARANTINE.filter(q => q.status === "active").length
  const criticalCount = MOCK_QUARANTINE.filter(q => q.severity === "critical" && q.status === "active").length
  const expiringCount = MOCK_QUARANTINE.filter(q =>
    q.status === "active" && q.expiresAt && isBefore(q.expiresAt, addDays(now, 7))
  ).length
  const resolvedCount = MOCK_QUARANTINE.filter(q => q.status === "released" || q.status === "deleted").length

  const filtered = useMemo(() => {
    let items = [...MOCK_QUARANTINE]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i => i.ingestionFileName.toLowerCase().includes(q) || i.ingestionId.includes(q))
    }
    if (selectedReasons.length > 0) items = items.filter(i => selectedReasons.includes(i.reason))
    if (selectedSeverities.length > 0) items = items.filter(i => selectedSeverities.includes(i.severity))
    if (statusFilter === "active") items = items.filter(i => i.status === "active")
    if (statusFilter === "resolved") items = items.filter(i => i.status !== "active")
    return items
  }, [search, selectedReasons, selectedSeverities, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = selectedReasons.length > 0 || selectedSeverities.length > 0 || search !== ""

  const toggleReason = (r: QuarantineReason) => {
    setSelectedReasons(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])
    setPage(1)
  }
  const toggleSeverity = (s: Severity) => {
    setSelectedSeverities(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
    setPage(1)
  }
  const clearFilters = () => { setSelectedReasons([]); setSelectedSeverities([]); setSearch(""); setPage(1) }

  const isExpiringSoon = (record: QuarantineRecord) =>
    record.expiresAt && record.status === "active" && isBefore(record.expiresAt, addDays(now, 7))

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">Quarantine</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Quarantines" value={activeCount} trend="+1" trendUp={false} description="Pending review" />
        <MetricCard label="Critical Severity" value={criticalCount} trend={criticalCount > 0 ? "Urgent" : "None"} trendUp={false} description="Requires immediate action" />
        <MetricCard label="Expiring < 7 Days" value={expiringCount} trend={expiringCount > 0 ? "Soon" : "None"} trendUp={false} description="Will expire this week" />
        <MetricCard label="Resolved (30d)" value={resolvedCount} trend="+3" trendUp={true} description="Released or deleted" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by file name or ingestion ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-8 bg-muted/50 border-border pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Reason {selectedReasons.length > 0 && `(${selectedReasons.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              {REASON_OPTIONS.map(r => (
                <DropdownMenuItem key={r} onClick={() => toggleReason(r)} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", selectedReasons.includes(r) ? "bg-foreground" : "bg-muted")} />
                  {reasonLabel(r)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Severity {selectedSeverities.length > 0 && `(${selectedSeverities.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              {SEVERITY_OPTIONS.map(s => (
                <DropdownMenuItem key={s} onClick={() => toggleSeverity(s)} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", selectedSeverities.includes(s) ? "bg-foreground" : "bg-muted")} />
                  {severityLabel(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {statusFilter === "active" ? "Active Only" : statusFilter === "resolved" ? "Resolved Only" : "All"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active Only {statusFilter === "active" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>Resolved Only {statusFilter === "resolved" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All {statusFilter === "all" && "✓"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <ShieldCheck className="size-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">No quarantined items</p>
              <p className="text-xs text-muted-foreground mt-1">All ingestions are clear.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_10rem_6rem_1fr_9rem_7rem_7rem_auto] gap-4 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">File Name</span>
              <span className="text-xs font-medium text-muted-foreground">Reason</span>
              <span className="text-xs font-medium text-muted-foreground">Severity</span>
              <span className="text-xs font-medium text-muted-foreground">Details</span>
              <span className="text-xs font-medium text-muted-foreground">Quarantined</span>
              <span className="text-xs font-medium text-muted-foreground">Expires</span>
              <span className="text-xs font-medium text-muted-foreground">Resolution</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {paged.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_10rem_6rem_1fr_9rem_7rem_7rem_auto] gap-4 px-4 py-3 items-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/ingestions/${item.ingestionId}?tab=quarantine`)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.ingestionFileName}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{item.ingestionId}</p>
                  </div>

                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", reasonBadgeClass(item.reason))}>
                    {reasonLabel(item.reason)}
                  </span>

                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", severityBadgeClass(item.severity))}>
                    {severityLabel(item.severity)}
                  </span>

                  <p className="text-xs text-muted-foreground truncate">{item.details}</p>

                  <span className="text-xs text-muted-foreground">{timeAgo(item.quarantinedAt)}</span>

                  <span className={cn(
                    "text-xs",
                    isExpiringSoon(item) ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"
                  )}>
                    {item.expiresAt ? timeAgo(item.expiresAt) : "Never"}
                  </span>

                  <ResolutionBadge status={item.status} />

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {role === "admin" && item.status === "active" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setReleaseRecord(item)}
                        >
                          Release
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-600"
                          onClick={() => setDeleteRecord(item)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    {role !== "viewer" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title="Retry Ingestion"
                        onClick={() => router.push(`/ingestions/${item.ingestionId}`)}
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => router.push(`/ingestions/${item.ingestionId}`)}
                      title="View Ingestion"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="icon" className="size-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ReleaseDialog record={releaseRecord} open={!!releaseRecord} onClose={() => setReleaseRecord(null)} />
      <DeleteDialog record={deleteRecord} open={!!deleteRecord} onClose={() => setDeleteRecord(null)} />
    </div>
  )
}
