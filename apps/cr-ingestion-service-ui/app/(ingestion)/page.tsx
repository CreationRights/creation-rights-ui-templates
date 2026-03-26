"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Inbox,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  RotateCcw,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MOCK_INGESTIONS,
  MOCK_QUARANTINE,
  formatFileSize,
  timeAgo,
  type IngestionStatus,
  type SourceType,
} from "@/lib/mock-data"
import {
  statusBadgeClass,
  statusLabel,
  sourceBadgeClass,
  sourceLabel,
  isTerminalStatus,
} from "@/lib/badges"
import { cn } from "@/lib/utils"
import { useRole } from "@/components/ingestion/role-context"

const PAGE_SIZE = 20

const STATUS_OPTIONS: IngestionStatus[] = [
  "pending", "validating", "accepted", "quarantined", "retrying",
  "deduplicating", "finalizing", "completed", "failed", "cancelled",
]
const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: "upload", label: "Upload" },
  { value: "api_payload", label: "API Payload" },
  { value: "cloud_object", label: "Cloud Object" },
  { value: "connected_tool", label: "Connected Tool" },
]

function MetricCard({
  label,
  value,
  trend,
  trendUp,
  description,
}: {
  label: string
  value: string | number
  trend: string
  trendUp: boolean
  description: string
}) {
  return (
    <div className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className={cn(
          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
          trendUp
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          {trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {trend}
        </span>
      </div>
      <span className="text-3xl font-semibold tracking-tight text-foreground">{value}</span>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {trendUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
        {description}
      </div>
    </div>
  )
}

export default function QueuePage() {
  const router = useRouter()
  const { role } = useRole()
  const [search, setSearch] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<IngestionStatus[]>([])
  const [selectedSources, setSelectedSources] = useState<SourceType[]>([])
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)

  const activeCount = MOCK_INGESTIONS.filter(i =>
    ["pending", "validating", "accepted", "retrying", "deduplicating", "finalizing"].includes(i.status)
  ).length
  const quarantinedCount = MOCK_QUARANTINE.filter(q => q.status === "active").length
  const completedCount = MOCK_INGESTIONS.filter(i => i.status === "completed").length
  const failedCount = MOCK_INGESTIONS.filter(i => i.status === "failed").length

  const filtered = useMemo(() => {
    let items = [...MOCK_INGESTIONS]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i => i.fileName.toLowerCase().includes(q))
    }
    if (selectedStatuses.length > 0) {
      items = items.filter(i => selectedStatuses.includes(i.status))
    }
    if (selectedSources.length > 0) {
      items = items.filter(i => selectedSources.includes(i.sourceType))
    }
    items.sort((a, b) => {
      const aVal = sortBy === "createdAt" ? a.createdAt.getTime() : a.updatedAt.getTime()
      const bVal = sortBy === "createdAt" ? b.createdAt.getTime() : b.updatedAt.getTime()
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal
    })
    return items
  }, [search, selectedStatuses, selectedSources, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasFilters = selectedStatuses.length > 0 || selectedSources.length > 0 || search !== ""

  const toggleStatus = (s: IngestionStatus) => {
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    setPage(1)
  }
  const toggleSource = (s: SourceType) => {
    setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    setPage(1)
  }
  const clearFilters = () => {
    setSelectedStatuses([])
    setSelectedSources([])
    setSearch("")
    setPage(1)
  }

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase()

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Ingestion Queue</h1>
        {role !== "viewer" && (
          <Button size="sm" asChild>
            <Link href="/new">
              <Plus className="size-4" />
              New Ingestion
            </Link>
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Ingestions"
          value={activeCount}
          trend="+2"
          trendUp={true}
          description="Currently processing"
        />
        <MetricCard
          label="Quarantined"
          value={quarantinedCount}
          trend="+1"
          trendUp={false}
          description="Needs review"
        />
        <MetricCard
          label="Completed (24h)"
          value={completedCount}
          trend="+5"
          trendUp={true}
          description="Successfully ingested"
        />
        <MetricCard
          label="Failed"
          value={failedCount}
          trend={failedCount > 0 ? `${failedCount} active` : "None"}
          trendUp={failedCount === 0}
          description="Require intervention"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by file name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-8 bg-muted/50 border-border pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              {STATUS_OPTIONS.map(s => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className="flex items-center gap-2"
                >
                  <span className={cn(
                    "size-2 rounded-full",
                    selectedStatuses.includes(s) ? "bg-foreground" : "bg-muted"
                  )} />
                  {statusLabel(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Source filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Source {selectedSources.length > 0 && `(${selectedSources.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {SOURCE_OPTIONS.map(s => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => toggleSource(s.value)}
                  className="flex items-center gap-2"
                >
                  <span className={cn(
                    "size-2 rounded-full",
                    selectedSources.includes(s.value) ? "bg-foreground" : "bg-muted"
                  )} />
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort By */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Sort: {sortBy === "createdAt" ? "Created" : "Updated"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem onClick={() => setSortBy("createdAt")}>
                Created At {sortBy === "createdAt" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>
                Updated At {sortBy === "updatedAt" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Order */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {sortOrder === "desc" ? "Newest first" : "Oldest first"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                Newest first {sortOrder === "desc" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                Oldest first {sortOrder === "asc" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {(selectedStatuses.length > 0 || selectedSources.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {selectedStatuses.map(s => (
              <span
                key={s}
                onClick={() => toggleStatus(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer",
                  statusBadgeClass(s)
                )}
              >
                {statusLabel(s)} ×
              </span>
            ))}
            {selectedSources.map(s => (
              <span
                key={s}
                onClick={() => toggleSource(s)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer",
                  sourceBadgeClass(s)
                )}
              >
                {sourceLabel(s)} ×
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Inbox className="size-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">No ingestions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start by creating a new ingestion</p>
            </div>
            {role !== "viewer" && (
              <Button size="sm" asChild>
                <Link href="/new"><Plus className="size-4" /> New Ingestion</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_8rem_9rem_4rem_9rem_8rem_2.5rem] gap-4 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">File Name</span>
              <span className="text-xs font-medium text-muted-foreground">Source</span>
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <span className="text-xs font-medium text-muted-foreground">Retry</span>
              <span className="text-xs font-medium text-muted-foreground">Created</span>
              <span className="text-xs font-medium text-muted-foreground">Created By</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {paged.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_8rem_9rem_4rem_9rem_8rem_2.5rem] gap-4 px-4 py-3 items-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/ingestions/${item.id}`)}
                >
                  {/* File Name */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.mimeType} · {formatFileSize(item.fileSize)}</p>
                  </div>

                  {/* Source */}
                  <div>
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", sourceBadgeClass(item.sourceType))}>
                      {sourceLabel(item.sourceType)}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusBadgeClass(item.status))}>
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  {/* Retry */}
                  <div>
                    {item.retryCount > 0 ? (
                      <span className="text-xs text-muted-foreground">{item.retryCount}/{item.maxRetries}</span>
                    ) : null}
                  </div>

                  {/* Created */}
                  <div>
                    <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                  </div>

                  {/* Created By */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="size-6 shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                        {initials(item.createdBy)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">{item.createdBy.split(" ")[0]}</span>
                  </div>

                  {/* Actions */}
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/ingestions/${item.id}`)}>
                          <Eye className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {role !== "viewer" && (item.status === "quarantined" || item.status === "failed") && (
                          <DropdownMenuItem>
                            <RotateCcw className="size-4 mr-2" />
                            Retry
                          </DropdownMenuItem>
                        )}
                        {role === "admin" && item.status === "validating" && (
                          <DropdownMenuItem>
                            <Shield className="size-4 mr-2" />
                            Quarantine
                          </DropdownMenuItem>
                        )}
                        {role === "admin" && (item.status === "accepted" || item.status === "deduplicating") && (
                          <DropdownMenuItem>
                            <CheckCircle className="size-4 mr-2" />
                            Finalize
                          </DropdownMenuItem>
                        )}
                        {role === "admin" && !isTerminalStatus(item.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400">
                              <XCircle className="size-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
