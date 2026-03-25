"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  Search,
  Command,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormatBadge } from "@/components/asset-badges";
import {
  MOCK_EXPORTS,
  formatDateTime,
  type ExportRecord,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
type SortKey = "assetName" | "format" | "exportedBy" | "exportedAt" | "linkStatus";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="size-3 text-muted-foreground/40" />;
  return dir === "asc" ? <ChevronUp className="size-3 text-foreground" /> : <ChevronDown className="size-3 text-foreground" />;
}

export default function ExportsPage() {
  const { can } = useRole();
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("exportedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...MOCK_EXPORTS];
    if (search.length >= 2) {
      const q = search.toLowerCase();
      items = items.filter((e) => e.assetName.toLowerCase().includes(q));
    }
    if (formatFilter) items = items.filter((e) => e.format === formatFilter);

    items.sort((a, b) => {
      let av: string = "";
      let bv: string = "";
      if (sortKey === "assetName") { av = a.assetName; bv = b.assetName; }
      else if (sortKey === "format") { av = a.format; bv = b.format; }
      else if (sortKey === "exportedBy") { av = a.exportedBy.name; bv = b.exportedBy.name; }
      else if (sortKey === "exportedAt") { av = a.exportedAt; bv = b.exportedAt; }
      else if (sortKey === "linkStatus") { av = a.linkStatus; bv = b.linkStatus; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [search, formatFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortTh = ({ col, label, className }: { col: SortKey; label: string; className?: string }) => (
    <th
      className={cn("px-4 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors", className)}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon active={sortKey === col} dir={sortDir} />
      </div>
    </th>
  );

  const formats = [...new Set(MOCK_EXPORTS.map((e) => e.format))];

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Exports</h1>
        {can("export") && (
          <Button size="sm" className="gap-2">
            <Download className="size-4" />
            Export Asset
          </Button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search exports by asset name..."
            className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs pointer-events-none">
            <Command className="size-3" />
            <span>K</span>
          </div>
        </div>

        <select
          value={formatFilter}
          onChange={(e) => { setFormatFilter(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Formats</option>
          {formats.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-card p-16 flex flex-col items-center gap-4 text-center">
          <Download className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">No exports yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When assets are exported, they will appear here with full audit details.
            </p>
          </div>
          {can("export") && (
            <Button size="sm" className="gap-2 mt-2">
              <Download className="size-4" />Export an Asset
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <SortTh col="assetName" label="Asset Name" />
                  <SortTh col="format" label="Format" className="w-24" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-52">Destination</th>
                  <SortTh col="exportedBy" label="Exported By" className="w-40" />
                  <SortTh col="exportedAt" label="Date" className="w-44" />
                  <SortTh col="linkStatus" label="Link Status" className="w-28" />
                  <th className="w-20 px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/assets/${exp.assetId}`}
                        className="text-sm font-medium text-foreground hover:underline underline-offset-2"
                      >
                        {exp.assetName}
                      </Link>
                    </td>
                    <td className="w-24 px-4 py-3">
                      <FormatBadge format={exp.format} />
                    </td>
                    <td className="w-52 px-4 py-3">
                      {exp.destination ? (
                        <span className="text-xs text-muted-foreground truncate block max-w-44" title={exp.destination}>
                          {exp.destination}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Direct download</span>
                      )}
                    </td>
                    <td className="w-40 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                            {exp.exportedBy.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{exp.exportedBy.name}</span>
                      </div>
                    </td>
                    <td className="w-44 px-4 py-3">
                      <span className="text-xs text-muted-foreground">{formatDateTime(exp.exportedAt)}</span>
                    </td>
                    <td className="w-28 px-4 py-3">
                      {exp.linkStatus === "active" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="w-20 px-4 py-3">
                      <div className="flex items-center gap-1">
                        {exp.linkStatus === "active" && exp.downloadUrl && (
                          <Button variant="ghost" size="icon" className="size-7" asChild>
                            <a href={exp.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="size-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <Link href={`/assets/${exp.assetId}`}>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} exports
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" className="h-8 gap-1"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-3" />Prev
            </Button>
            <span className="text-sm text-muted-foreground px-1">{page} / {totalPages}</span>
            <Button
              variant="outline" size="sm" className="h-8 gap-1"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next<ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
