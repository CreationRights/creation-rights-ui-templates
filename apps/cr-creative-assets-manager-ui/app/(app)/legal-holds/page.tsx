"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  Command,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StateBadge, TypeBadge } from "@/components/asset-badges";
import {
  MOCK_ASSETS,
  formatDateTime,
  type Asset,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function LegalHoldsPage() {
  const { can } = useRole();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [heldAssets, setHeldAssets] = useState<Asset[]>(
    MOCK_ASSETS.filter((a) => a.legalHold)
  );
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Asset | null>(null);
  const [sortKey, setSortKey] = useState<"name" | "type" | "state" | "appliedAt">("appliedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let items = [...heldAssets];
    if (search.length >= 2) {
      const q = search.toLowerCase();
      items = items.filter((a) => a.name.toLowerCase().includes(q));
    }
    items.sort((a, b) => {
      let av = "";
      let bv = "";
      if (sortKey === "name") { av = a.name; bv = b.name; }
      else if (sortKey === "type") { av = a.type; bv = b.type; }
      else if (sortKey === "state") { av = a.state; bv = b.state; }
      else if (sortKey === "appliedAt") {
        av = a.legalHoldAppliedAt ?? "";
        bv = b.legalHoldAppliedAt ?? "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [heldAssets, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleRemove = (asset: Asset) => {
    setHeldAssets((prev) => prev.filter((a) => a.id !== asset.id));
    setRemoveTarget(null);
  };

  const SortTh = ({ col, label, className }: { col: typeof sortKey; label: string; className?: string }) => (
    <th
      className={cn("px-4 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors", className)}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === col ? (
          sortDir === "asc" ? <ChevronUp className="size-3 text-foreground" /> : <ChevronDown className="size-3 text-foreground" />
        ) : (
          <ChevronUp className="size-3 text-muted-foreground/40" />
        )}
      </div>
    </th>
  );

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Legal Holds</h1>
        {can("apply_legal_hold") && (
          <Button size="sm" className="gap-2" onClick={() => setShowApplyDialog(true)}>
            <Shield className="size-4" />
            Apply Legal Hold
          </Button>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Active Legal Holds</span>
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {heldAssets.length}
          </span>
          <span className="text-xs text-muted-foreground">Assets under legal protection</span>
        </div>
        <div className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Assets Under Hold</span>
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {heldAssets.length}
          </span>
          <span className="text-xs text-muted-foreground">Cannot be modified or archived</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search held assets by name..."
          className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs pointer-events-none">
          <Command className="size-3" />
          <span>K</span>
        </div>
      </div>

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-card p-16 flex flex-col items-center gap-4 text-center">
          <Shield className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">No legal holds</p>
            <p className="text-sm text-muted-foreground mt-1">
              Assets placed under legal hold will appear here. They cannot be modified or archived while a hold is active.
            </p>
          </div>
          {can("apply_legal_hold") && (
            <Button size="sm" className="gap-2 mt-2" onClick={() => setShowApplyDialog(true)}>
              <Shield className="size-4" />Apply Legal Hold
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <SortTh col="name" label="Asset Name" />
                  <SortTh col="type" label="Asset Type" className="w-36" />
                  <SortTh col="state" label="Current State" className="w-40" />
                  <SortTh col="appliedAt" label="Hold Applied" className="w-44" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-28">Retention</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-24">Status</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-sm font-medium text-foreground hover:underline underline-offset-2"
                      >
                        {asset.name}
                      </Link>
                    </td>
                    <td className="w-36 px-4 py-3">
                      <TypeBadge type={asset.type} />
                    </td>
                    <td className="w-40 px-4 py-3">
                      <StateBadge state={asset.state} />
                    </td>
                    <td className="w-44 px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {asset.legalHoldAppliedAt ? formatDateTime(asset.legalHoldAppliedAt) : "—"}
                      </span>
                    </td>
                    <td className="w-28 px-4 py-3">
                      <span className="text-xs text-muted-foreground">Indefinite</span>
                    </td>
                    <td className="w-24 px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                        Active
                      </span>
                    </td>
                    <td className="w-24 px-4 py-3">
                      <div className="flex items-center gap-1">
                        {can("apply_legal_hold") && (
                          <Button
                            variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-red-600"
                            onClick={() => setRemoveTarget(asset)}
                          >
                            Remove
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <Link href={`/assets/${asset.id}`}>
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
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} holds
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

      {/* Apply Hold Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Legal Hold</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-muted-foreground">
              Select an asset to place under legal hold. This prevents any modification, archival, or deletion until the hold is lifted.
            </p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {MOCK_ASSETS.filter((a) => !a.legalHold).map((asset) => (
                <button
                  key={asset.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  onClick={() => {
                    setHeldAssets((prev) => [
                      ...prev,
                      { ...asset, legalHold: true, legalHoldAppliedAt: new Date().toISOString() },
                    ]);
                    setShowApplyDialog(false);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{asset.name}</span>
                    <span className="text-xs text-muted-foreground">{asset.type}</span>
                  </div>
                  <StateBadge state={asset.state} />
                </button>
              ))}
              {MOCK_ASSETS.filter((a) => !a.legalHold).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">All assets are already under legal hold.</p>
              )}
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This action will be permanently logged in the audit trail.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowApplyDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Hold Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Legal Hold</DialogTitle>
          </DialogHeader>
          {removeTarget && (
            <div className="flex flex-col gap-4 py-2">
              <p className="text-sm text-muted-foreground">
                You are about to remove the legal hold from{" "}
                <span className="font-medium text-foreground">{removeTarget.name}</span>.
                This will allow the asset to be modified or archived.
              </p>
              <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">
                  Ensure legal counsel has approved the removal of this hold before proceeding.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeTarget && handleRemove(removeTarget)}
            >
              Remove Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
