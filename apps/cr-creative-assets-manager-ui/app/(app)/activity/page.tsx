"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  Command,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  GitBranch,
  Tags,
  Download,
  Shield,
  Minus,
  CheckCircle,
  AlertCircle,
  Copy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StateBadge } from "@/components/asset-badges";
import {
  MOCK_ACTIVITY,
  USERS,
  formatDateTime,
  type ActivityEntry,
  type AssetState,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

const ACTION_ICONS: Record<string, React.ElementType> = {
  "asset.created": Plus,
  "state.changed": GitBranch,
  "metadata.updated": Tags,
  "version.added": GitBranch,
  exported: Download,
  "legal_hold.applied": Shield,
  "legal_hold.removed": Shield,
  archived: Minus,
  "provenance.recorded": Shield,
};

const ACTION_BADGE: Record<string, string> = {
  "asset.created": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "state.changed": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "metadata.updated": "bg-muted text-muted-foreground",
  "version.added": "bg-muted text-muted-foreground",
  exported: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "legal_hold.applied": "bg-red-500/10 text-red-600 dark:text-red-400",
  "legal_hold.removed": "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  "provenance.recorded": "bg-muted text-muted-foreground",
};

const ALL_ACTIONS = [
  "asset.created",
  "state.changed",
  "metadata.updated",
  "version.added",
  "exported",
  "legal_hold.applied",
  "legal_hold.removed",
  "archived",
  "provenance.recorded",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <CheckCircle className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export default function ActivityPage() {
  const { role } = useRole();
  const isPrivileged = role === "admin" || role === "compliance_officer";

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [actorFilter, setActorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = [...MOCK_ACTIVITY];
    if (search.length >= 2) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) =>
          e.assetName.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.actor.name.toLowerCase().includes(q)
      );
    }
    if (actionFilter.length > 0)
      items = items.filter((e) => actionFilter.includes(e.action));
    if (actorFilter)
      items = items.filter((e) => e.actor.id === actorFilter);

    items.sort((a, b) => {
      if (a.timestamp < b.timestamp) return sortDir === "asc" ? -1 : 1;
      if (a.timestamp > b.timestamp) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [search, actionFilter, actorFilter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleAction = (action: string) => {
    setActionFilter((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
    setPage(1);
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Activity Log</h1>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by asset name, action, or user..."
            className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs pointer-events-none">
            <Command className="size-3" />
            <span>K</span>
          </div>
        </div>

        {/* Action multi-select */}
        <div className="relative">
          <select
            className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value=""
            onChange={(e) => { if (e.target.value) toggleAction(e.target.value); }}
          >
            <option value="">
              Action{actionFilter.length > 0 ? ` (${actionFilter.length})` : ""}
            </option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {actionFilter.includes(a) ? "✓ " : ""}{a}
              </option>
            ))}
          </select>
        </div>

        {/* Actor filter */}
        <select
          value={actorFilter}
          onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Actors</option>
          {USERS.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        {/* Sort toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
        >
          Timestamp
          {sortDir === "desc" ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
        </Button>

        {(actionFilter.length > 0 || actorFilter || search) && (
          <Button
            variant="ghost" size="sm" className="h-8 text-xs gap-1"
            onClick={() => { setActionFilter([]); setActorFilter(""); setSearch(""); setPage(1); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Active action filters */}
      {actionFilter.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap -mt-3">
          {actionFilter.map((a) => (
            <button
              key={a}
              onClick={() => toggleAction(a)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              {a}
              <span className="ml-0.5 text-muted-foreground/70">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-card p-16 flex flex-col items-center gap-4 text-center">
          <Clock className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">No activity recorded</p>
            <p className="text-sm text-muted-foreground mt-1">
              Asset activity across the platform will appear here as a full audit trail.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-44">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-44">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-40">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-52">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-20">Integrity</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((entry) => {
                const Icon = ACTION_ICONS[entry.action] ?? Clock;
                const isExpanded = expanded === entry.id;
                return (
                  <>
                    <tr
                      key={entry.id}
                      className={cn("hover:bg-muted/20 transition-colors cursor-pointer", isExpanded && "bg-muted/10")}
                      onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    >
                      <td className="w-44 px-4 py-3">
                        <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
                      </td>
                      <td className="w-44 px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1", ACTION_BADGE[entry.action])}>
                          <Icon className="size-3" />
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/assets/${entry.assetId}`}
                          className="text-sm text-foreground hover:underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entry.assetName}
                        </Link>
                      </td>
                      <td className="w-40 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                              {entry.actor.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{entry.actor.name}</span>
                        </div>
                      </td>
                      <td className="w-52 px-4 py-3">
                        <span className="text-xs text-muted-foreground line-clamp-2">{entry.details}</span>
                      </td>
                      <td className="w-20 px-4 py-3">
                        {entry.integrityValid ? (
                          <CheckCircle className="size-4 text-emerald-500" />
                        ) : entry.integrityHash ? (
                          <AlertCircle className="size-4 text-red-500" />
                        ) : (
                          <Minus className="size-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="w-10 px-4 py-3">
                        {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${entry.id}-expanded`} className="bg-muted/10">
                        <td colSpan={7} className="px-6 pb-4 pt-2">
                          <div className="flex flex-col gap-2 pl-4 border-l-2 border-border">
                            {entry.previousState && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground w-24">State change:</span>
                                <StateBadge state={entry.previousState as AssetState} />
                                <ArrowRight className="size-3 text-muted-foreground" />
                                <StateBadge state={entry.newState as AssetState} />
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground w-24">Integrity hash:</span>
                              <span className="font-mono text-foreground">{entry.integrityHash}</span>
                              <CopyButton text={entry.integrityHash} />
                            </div>
                            {entry.previousHash && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground w-24">Previous hash:</span>
                                <span className="font-mono text-muted-foreground">{entry.previousHash}</span>
                              </div>
                            )}
                            {isPrivileged && entry.ip && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground w-24">IP address:</span>
                                <span className="font-mono text-foreground">{entry.ip}</span>
                              </div>
                            )}
                            {isPrivileged && entry.userAgent && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground w-24">User agent:</span>
                                <span className="text-muted-foreground max-w-lg truncate">{entry.userAgent}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="size-3" />Prev
            </Button>
            <span className="text-sm text-muted-foreground px-1">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next<ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
