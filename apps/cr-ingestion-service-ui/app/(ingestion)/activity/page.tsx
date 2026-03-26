"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  CheckCircle,
  Shield,
  RotateCcw,
  Copy,
  Loader,
  XCircle,
  ShieldCheck,
  Trash2,
  FileCheck,
  FileX,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MOCK_ACTIVITY, timeAgo, type ActivityAction } from "@/lib/mock-data"
import { activityActionBadgeClass } from "@/lib/badges"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const PAGE_SIZE = 50

const ACTION_OPTIONS: ActivityAction[] = [
  "Ingestion Created", "Validated", "Accepted", "Quarantined", "Retrying",
  "Deduplicating", "Finalizing", "Completed", "Failed", "Cancelled",
  "Quarantine Released", "Quarantine Deleted", "Quarantine Expired",
  "Artifact Validated", "Artifact Rejected", "Dedup Detected", "Dedup Resolved",
]

const ACTOR_OPTIONS = ["Sarah Chen", "James Wu", "Maria Lopez", "David Kim", "System"]

function actionIcon(action: ActivityAction) {
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

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase()
}

export default function ActivityPage() {
  const [search, setSearch] = useState("")
  const [selectedActions, setSelectedActions] = useState<ActivityAction[]>([])
  const [selectedActor, setSelectedActor] = useState<string>("")
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let items = [...MOCK_ACTIVITY].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i =>
        i.ingestionFileName.toLowerCase().includes(q) ||
        i.actorName.toLowerCase().includes(q) ||
        i.action.toLowerCase().includes(q)
      )
    }
    if (selectedActions.length > 0) items = items.filter(i => selectedActions.includes(i.action))
    if (selectedActor) items = items.filter(i => i.actorName === selectedActor)
    return items
  }, [search, selectedActions, selectedActor])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = selectedActions.length > 0 || !!selectedActor || search !== ""

  const toggleAction = (a: ActivityAction) => {
    setSelectedActions(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a])
    setPage(1)
  }
  const clearFilters = () => { setSelectedActions([]); setSelectedActor(""); setSearch(""); setPage(1) }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">Activity Log</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by file, actor or action..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-8 bg-muted/50 border-border pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Action {selectedActions.length > 0 && `(${selectedActions.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 max-h-72 overflow-y-auto">
              {ACTION_OPTIONS.map(a => (
                <DropdownMenuItem key={a} onClick={() => toggleAction(a)} className="flex items-center gap-2 text-xs">
                  <span className={cn("size-2 rounded-full", selectedActions.includes(a) ? "bg-foreground" : "bg-muted")} />
                  {a}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Actor {selectedActor && `(${selectedActor.split(" ")[0]})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuItem onClick={() => setSelectedActor("")} className="text-xs">
                All actors {!selectedActor && "✓"}
              </DropdownMenuItem>
              {ACTOR_OPTIONS.map(a => (
                <DropdownMenuItem key={a} onClick={() => setSelectedActor(a)} className="text-xs">
                  {a} {selectedActor === a && "✓"}
                </DropdownMenuItem>
              ))}
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
            <Clock className="size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No activity recorded</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[11rem_11rem_1fr_8rem_10rem_2.5rem] gap-4 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Timestamp</span>
              <span className="text-xs font-medium text-muted-foreground">Action</span>
              <span className="text-xs font-medium text-muted-foreground">Ingestion</span>
              <span className="text-xs font-medium text-muted-foreground">Actor</span>
              <span className="text-xs font-medium text-muted-foreground">State Change</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {paged.map(item => {
                const isExpanded = expanded.has(item.id)
                return (
                  <div key={item.id}>
                    <div className="grid grid-cols-[11rem_11rem_1fr_8rem_10rem_2.5rem] gap-4 px-4 py-3 items-center hover:bg-muted/50 transition-colors">
                      {/* Timestamp */}
                      <div>
                        <p className="text-xs text-foreground font-mono">{format(item.timestamp, "MMM d, HH:mm")}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(item.timestamp)}</p>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          activityActionBadgeClass(item.action)
                        )}>
                          {actionIcon(item.action)}
                          {item.action}
                        </span>
                      </div>

                      {/* Ingestion */}
                      <div className="min-w-0">
                        <Link
                          href={`/ingestions/${item.ingestionId}`}
                          className="text-sm font-medium text-foreground hover:underline truncate block"
                        >
                          {item.ingestionFileName}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">{item.ingestionId}</p>
                      </div>

                      {/* Actor */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-6 shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                            {initials(item.actorName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{item.actorName}</span>
                      </div>

                      {/* State Change */}
                      <div className="flex items-center gap-1.5 text-xs min-w-0">
                        {item.previousState && item.newState ? (
                          <>
                            <span className="text-muted-foreground capitalize truncate">{item.previousState}</span>
                            <span className="text-muted-foreground shrink-0">→</span>
                            <span className="text-foreground capitalize truncate">{item.newState}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Expand */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 rounded hover:bg-muted transition-colors flex items-center justify-center"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                      </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && item.details && (
                      <div className="px-4 pb-4 bg-muted/20">
                        <div className="rounded-lg border border-border bg-card p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Details</p>
                          <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(item.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
    </div>
  )
}
