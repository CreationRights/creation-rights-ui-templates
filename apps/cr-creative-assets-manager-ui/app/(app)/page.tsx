"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Upload,
  TrendingUp,
  TrendingDown,
  Search,
  Command,
  LayoutList,
  LayoutGrid,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { StateBadge, TypeBadge, LegalHoldBadge } from "@/components/asset-badges";
import {
  MOCK_ASSETS,
  formatBytes,
  relativeTime,
  formatDateTime,
  type Asset,
  type AssetState,
  type AssetType,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PAGE_SIZE = 20;
const ALL_STATES: AssetState[] = [
  "uploaded","draft","under_review","approved","rejected","exported","archived",
];
const ALL_TYPES: AssetType[] = [
  "image","video","audio","document","brand_asset","campaign_file","ai_generated",
];
const STATE_LABEL: Record<AssetState, string> = {
  uploaded: "Uploaded", draft: "Draft", under_review: "Under Review",
  approved: "Approved", rejected: "Rejected", exported: "Exported", archived: "Archived",
};
const TYPE_LABEL: Record<AssetType, string> = {
  image: "Image", video: "Video", audio: "Audio", document: "Document",
  brand_asset: "Brand Asset", campaign_file: "Campaign File", ai_generated: "AI Generated",
};

type SortKey = "name" | "type" | "state" | "sizeBytes" | "createdAt" | "createdBy";
type SortDir = "asc" | "desc";

function MetricCard({
  label,
  value,
  sub,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span
          className={cn(
            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
            trendUp
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          )}
        >
          {trendUp ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {trend}
        </span>
      </div>
      <span className="text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          {label}
          {selected.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-foreground text-background text-[10px] font-medium">
              {selected.length}
            </span>
          )}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={(e) => {
                e.preventDefault();
                onChange(
                  checked
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value]
                );
              }}
              className="flex items-center gap-2 text-xs"
            >
              <div
                className={cn(
                  "size-3.5 rounded border border-border flex items-center justify-center",
                  checked && "bg-foreground border-foreground"
                )}
              >
                {checked && <X className="size-2 text-background" />}
              </div>
              {opt.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="size-3 text-muted-foreground/40" />;
  return dir === "asc" ? (
    <ChevronUp className="size-3 text-foreground" />
  ) : (
    <ChevronDown className="size-3 text-foreground" />
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const { can } = useRole();

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "grid">("table");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let assets = [...MOCK_ASSETS];
    if (search.length >= 2) {
      const q = search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.originalFilename.toLowerCase().includes(q)
      );
    }
    if (stateFilter.length > 0)
      assets = assets.filter((a) => stateFilter.includes(a.state));
    if (typeFilter.length > 0)
      assets = assets.filter((a) => typeFilter.includes(a.type));

    assets.sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "name") { av = a.name; bv = b.name; }
      else if (sortKey === "type") { av = a.type; bv = b.type; }
      else if (sortKey === "state") { av = a.state; bv = b.state; }
      else if (sortKey === "sizeBytes") { av = a.sizeBytes; bv = b.sizeBytes; }
      else if (sortKey === "createdAt") { av = a.createdAt; bv = b.createdAt; }
      else if (sortKey === "createdBy") { av = a.createdBy.name; bv = b.createdBy.name; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return assets;
  }, [search, stateFilter, typeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else { setSortKey(key); setSortDir("asc"); }
    },
    [sortKey]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((a) => a.id)));
  };

  const clearFilters = () => {
    setStateFilter([]);
    setTypeFilter([]);
    setSearch("");
    setPage(1);
  };

  const hasFilters = stateFilter.length > 0 || typeFilter.length > 0 || search.length > 0;

  const SortTh = ({
    col,
    label,
    className,
  }: {
    col: SortKey;
    label: string;
    className?: string;
  }) => (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
        className
      )}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon active={sortKey === col} dir={sortDir} />
      </div>
    </th>
  );

  return (
    <TooltipProvider>
      <div className="p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          {can("upload") && (
            <Link href="/upload">
              <Button size="sm" className="gap-2">
                <Upload className="size-4" />
                Upload Asset
              </Button>
            </Link>
          )}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Total Assets"
            value="24,592"
            sub="+342 this week"
            trend="+1.4%"
            trendUp
          />
          <MetricCard
            label="Storage Used"
            value="14.2 GB"
            sub="of 50 GB (28.4%)"
            trend="28.4%"
            trendUp
          />
          <MetricCard
            label="Pending Review"
            value="8"
            sub="Requires attention"
            trend="8 items"
            trendUp={false}
          />
          <MetricCard
            label="Exported (7d)"
            value="23"
            sub="Across all formats"
            trend="+4 vs last week"
            trendUp
          />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name..."
              className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs pointer-events-none">
              <Command className="size-3" />
              <span>K</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MultiSelect
              label="State"
              options={ALL_STATES.map((s) => ({ value: s, label: STATE_LABEL[s] }))}
              selected={stateFilter}
              onChange={(v) => { setStateFilter(v); setPage(1); }}
            />
            <MultiSelect
              label="Type"
              options={ALL_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))}
              selected={typeFilter}
              onChange={(v) => { setTypeFilter(v); setPage(1); }}
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1">
                <X className="size-3" />
                Clear Filters
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("table")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      view === "table"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutList className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Table view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView("grid")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      view === "grid"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && can("bulk_actions") && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-muted rounded-xl border border-border">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="flex items-center gap-2 ml-2">
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Transition State
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Archive
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Export
              </Button>
            </div>
            <button
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              onClick={() => setSelected(new Set())}
            >
              <X className="size-3" />
              Clear
            </button>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="border border-border rounded-xl bg-card p-16 flex flex-col items-center gap-4 text-center">
            <ImageIcon className="size-12 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">No assets found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {hasFilters
                  ? "Try adjusting your filters."
                  : "Upload your first creative asset to start tracking rights, provenance, and compliance."}
              </p>
            </div>
            {!hasFilters && can("upload") && (
              <Link href="/upload">
                <Button size="sm" className="gap-2 mt-2">
                  <Upload className="size-4" />
                  Upload Asset
                </Button>
              </Link>
            )}
          </div>
        ) : view === "table" ? (
          /* Table view */
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <button onClick={toggleAll} className="flex items-center justify-center">
                        {selected.size === paginated.length && paginated.length > 0 ? (
                          <CheckSquare className="size-4 text-foreground" />
                        ) : selected.size > 0 ? (
                          <Minus className="size-4 text-muted-foreground" />
                        ) : (
                          <div className="size-4 border border-border rounded" />
                        )}
                      </button>
                    </th>
                    <SortTh col="name" label="Name" />
                    <SortTh col="type" label="Type" className="w-36" />
                    <SortTh col="state" label="State" className="w-36" />
                    <SortTh col="sizeBytes" label="Size" className="w-24" />
                    <SortTh col="createdAt" label="Created" className="w-36" />
                    <SortTh col="createdBy" label="Created By" className="w-36" />
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/assets/${asset.id}`)}
                    >
                      <td
                        className="w-10 px-4 py-3"
                        onClick={(e) => { e.stopPropagation(); toggleSelect(asset.id); }}
                      >
                        <div
                          className={cn(
                            "size-4 border border-border rounded flex items-center justify-center",
                            selected.has(asset.id) && "bg-foreground border-foreground"
                          )}
                        >
                          {selected.has(asset.id) && <X className="size-2 text-background" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{asset.name}</span>
                          <span className="text-xs text-muted-foreground">{asset.originalFilename}</span>
                          {asset.legalHold && (
                            <LegalHoldBadge />
                          )}
                        </div>
                      </td>
                      <td className="w-36 px-4 py-3">
                        <TypeBadge type={asset.type} />
                      </td>
                      <td className="w-36 px-4 py-3">
                        <StateBadge state={asset.state} />
                      </td>
                      <td className="w-24 px-4 py-3 text-muted-foreground text-xs">
                        {formatBytes(asset.sizeBytes)}
                      </td>
                      <td className="w-36 px-4 py-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground cursor-default">
                              {relativeTime(asset.createdAt)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{formatDateTime(asset.createdAt)}</TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="w-36 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                              {asset.createdBy.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{asset.createdBy.name}</span>
                        </div>
                      </td>
                      <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push(`/assets/${asset.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            {can("edit_metadata") && (
                              <DropdownMenuItem>Edit Metadata</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {can("transition_state") && (
                              <DropdownMenuItem>Transition State</DropdownMenuItem>
                            )}
                            {can("export") && (
                              <DropdownMenuItem>Export</DropdownMenuItem>
                            )}
                            {can("archive") && (
                              <DropdownMenuItem className="text-muted-foreground">
                                Archive
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-4 gap-4">
            {paginated.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`}>
                <div className="border border-border rounded-xl bg-card overflow-hidden hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <ImageIcon className="size-10 text-muted-foreground/40" />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <TypeBadge type={asset.type} />
                      <StateBadge state={asset.state} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{formatBytes(asset.sizeBytes)}</span>
                      <span className="text-xs text-muted-foreground">{relativeTime(asset.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} assets
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="size-3" />
                Prev
              </Button>
              <span className="text-sm text-muted-foreground px-1">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
