"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Copy, Search, ChevronLeft, ChevronRight, ClipboardCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  MOCK_DUPLICATES,
  timeAgo,
  type DedupStrategy,
  type DedupResolution,
} from "@/lib/mock-data"
import {
  strategyLabel,
  resolutionLabel,
  resolutionBadgeClass,
  confidenceColor,
} from "@/lib/badges"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

const STRATEGY_OPTIONS: { value: DedupStrategy; label: string }[] = [
  { value: "checksum_exact", label: "Checksum Exact" },
  { value: "content_hash", label: "Content Hash" },
  { value: "filename_match", label: "Filename Match" },
]

const CONFIDENCE_OPTIONS = [
  { value: "exact", label: "Exact 100%" },
  { value: "high", label: "High ≥85%" },
  { value: "partial", label: "Partial <85%" },
]

const RESOLUTION_OPTIONS: { value: DedupResolution; label: string }[] = [
  { value: "unresolved", label: "Unresolved" },
  { value: "skip", label: "Skip" },
  { value: "replace", label: "Replace" },
  { value: "keep_both", label: "Keep Both" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Copy checksum"
          >
            <ClipboardCopy className="size-3 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function DuplicatesPage() {
  const [search, setSearch] = useState("")
  const [selectedStrategies, setSelectedStrategies] = useState<DedupStrategy[]>([])
  const [selectedConfidences, setSelectedConfidences] = useState<string[]>([])
  const [selectedResolutions, setSelectedResolutions] = useState<DedupResolution[]>([])
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let items = [...MOCK_DUPLICATES]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(i =>
        i.checksum.toLowerCase().includes(q) ||
        i.sourceFileName.toLowerCase().includes(q) ||
        i.matchedFileName.toLowerCase().includes(q)
      )
    }
    if (selectedStrategies.length > 0) {
      items = items.filter(i => selectedStrategies.includes(i.strategy))
    }
    if (selectedConfidences.length > 0) {
      items = items.filter(i => {
        if (selectedConfidences.includes("exact") && i.confidence === 100) return true
        if (selectedConfidences.includes("high") && i.confidence >= 85 && i.confidence < 100) return true
        if (selectedConfidences.includes("partial") && i.confidence < 85) return true
        return false
      })
    }
    if (selectedResolutions.length > 0) {
      items = items.filter(i => selectedResolutions.includes(i.resolution))
    }
    return items
  }, [search, selectedStrategies, selectedConfidences, selectedResolutions])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = selectedStrategies.length > 0 || selectedConfidences.length > 0 || selectedResolutions.length > 0 || search !== ""

  const toggle = <T,>(arr: T[], item: T, set: (f: (prev: T[]) => T[]) => void) => {
    set(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
    setPage(1)
  }

  const clearFilters = () => {
    setSelectedStrategies([]); setSelectedConfidences([]); setSelectedResolutions([]); setSearch(""); setPage(1)
  }

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">Duplicates</h1>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by checksum or file name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="h-8 bg-muted/50 border-border pl-9 text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Strategy {selectedStrategies.length > 0 && `(${selectedStrategies.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {STRATEGY_OPTIONS.map(s => (
                <DropdownMenuItem key={s.value} onClick={() => toggle(selectedStrategies, s.value, setSelectedStrategies as any)} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", selectedStrategies.includes(s.value) ? "bg-foreground" : "bg-muted")} />
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Confidence {selectedConfidences.length > 0 && `(${selectedConfidences.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              {CONFIDENCE_OPTIONS.map(c => (
                <DropdownMenuItem key={c.value} onClick={() => toggle(selectedConfidences, c.value, setSelectedConfidences as any)} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", selectedConfidences.includes(c.value) ? "bg-foreground" : "bg-muted")} />
                  {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Resolution {selectedResolutions.length > 0 && `(${selectedResolutions.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {RESOLUTION_OPTIONS.map(r => (
                <DropdownMenuItem key={r.value} onClick={() => toggle(selectedResolutions, r.value, setSelectedResolutions as any)} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", selectedResolutions.includes(r.value) ? "bg-foreground" : "bg-muted")} />
                  {r.label}
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
            <Copy className="size-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No duplicates detected</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_1fr_8rem_6rem_9rem_9rem_7rem] gap-4 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Source Ingestion</span>
              <span className="text-xs font-medium text-muted-foreground">Matched With</span>
              <span className="text-xs font-medium text-muted-foreground">Strategy</span>
              <span className="text-xs font-medium text-muted-foreground">Confidence</span>
              <span className="text-xs font-medium text-muted-foreground">Checksum</span>
              <span className="text-xs font-medium text-muted-foreground">Detected</span>
              <span className="text-xs font-medium text-muted-foreground">Resolution</span>
            </div>

            <div className="divide-y divide-border">
              {paged.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_8rem_6rem_9rem_9rem_7rem] gap-4 px-4 py-3 items-center hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <Link href={`/ingestions/${item.sourceIngestionId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-foreground hover:underline truncate block">
                      {item.sourceFileName}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono truncate">{item.sourceIngestionId}</p>
                  </div>

                  <div className="min-w-0">
                    <Link href={`/ingestions/${item.matchedIngestionId}`} onClick={e => e.stopPropagation()} className="text-sm font-medium text-foreground hover:underline truncate block">
                      {item.matchedFileName}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono truncate">{item.matchedIngestionId}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground w-fit">
                    {strategyLabel(item.strategy)}
                  </span>

                  <span className={cn("text-sm font-medium", confidenceColor(item.confidence))}>
                    {item.confidence}%
                  </span>

                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground truncate">
                      {item.checksum.slice(0, 10)}…
                    </span>
                    <CopyButton text={item.checksum} />
                  </div>

                  <span className="text-xs text-muted-foreground">{timeAgo(item.detectedAt)}</span>

                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium w-fit",
                    item.resolution === "unresolved" ? "text-muted-foreground" : resolutionBadgeClass(item.resolution)
                  )}>
                    {resolutionLabel(item.resolution)}
                  </span>
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
    </div>
  )
}
