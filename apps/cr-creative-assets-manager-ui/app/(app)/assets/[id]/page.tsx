"use client";

import { useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Copy,
  MoreHorizontal,
  Download,
  GitBranch,
  Tags,
  Plus,
  Shield,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Minus,
  ArrowRight,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { StateBadge, TypeBadge, LegalHoldBadge } from "@/components/asset-badges";
import {
  MOCK_ASSETS,
  MOCK_ACTIVITY,
  formatBytes,
  relativeTime,
  formatDateTime,
  LIFECYCLE_TRANSITIONS,
  STATE_LABELS,
  type AssetState,
  type Asset,
} from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "versions", label: "Versions", icon: GitBranch },
  { id: "metadata", label: "Metadata", icon: Tags },
  { id: "provenance", label: "Provenance", icon: Shield },
  { id: "activity", label: "Activity", icon: Clock },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ALL_STATES: AssetState[] = [
  "uploaded","draft","under_review","approved","rejected","exported","archived",
];

const STATE_NODE_STYLE: Record<AssetState, string> = {
  uploaded: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  draft: "bg-muted text-muted-foreground border-border",
  under_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  exported: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  archived: "bg-muted text-muted-foreground border-border",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <CheckCircle className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function InfoRow({ label, value, mono = false, action }: { label: string; value: React.ReactNode; mono?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <div className={cn("flex-1 text-xs text-foreground flex items-center gap-1.5 min-w-0", mono && "font-mono")}>
        <span className="truncate">{value}</span>
        {action}
      </div>
    </div>
  );
}

// ── Transition State Dialog ──────────────────────────────────────────────────
function TransitionDialog({
  asset,
  open,
  onClose,
  onTransition,
}: {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onTransition: (newState: AssetState) => void;
}) {
  const targets = LIFECYCLE_TRANSITIONS[asset.state];
  const [target, setTarget] = useState<AssetState | "">(targets[0] ?? "");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!target) return;
    if (asset.legalHold && target === "archived") return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onTransition(target as AssetState);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transition State</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {targets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No valid transitions from {STATE_LABELS[asset.state]}.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <StateBadge state={asset.state} />
                <ArrowRight className="size-4 text-muted-foreground" />
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as AssetState)}
                  className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {targets.map((s) => (
                    <option key={s} value={s}>{STATE_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {target === "archived" && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Archiving is permanent. The asset will no longer be available for export or state transitions.
                  </p>
                </div>
              )}
              {target === "rejected" && (
                <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    The asset must return to draft before it can be re-submitted for review.
                  </p>
                </div>
              )}
              {asset.legalHold && target === "archived" && (
                <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <Shield className="size-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Cannot archive an asset under legal hold.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Provide context for this transition..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          {targets.length > 0 && (
            <Button
              size="sm"
              onClick={confirm}
              disabled={loading || !target || (asset.legalHold && target === "archived")}
            >
              {loading ? "Confirming..." : "Confirm"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Export Dialog ────────────────────────────────────────────────────────────
function ExportDialog({ asset, open, onClose }: { asset: Asset; open: boolean; onClose: () => void }) {
  const [format, setFormat] = useState("Original");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); setDone(false); setLoading(false); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Asset</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="size-10 text-emerald-500" />
            <p className="font-medium text-foreground">Export complete</p>
            <p className="text-xs text-muted-foreground text-center">
              Your asset has been exported. Download link: dl.creationrights.io/exp_new
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <TypeBadge type={asset.type} />
              <span className="text-sm font-medium text-foreground">{asset.name}</span>
              <StateBadge state={asset.state} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none"
              >
                {["Original","PNG","JPG","PDF","MP4"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Destination URL</label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="https://... (optional)"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                A compliance check will be performed before the export is finalized.
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          {!done ? (
            <>
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={submit} disabled={loading}>
                {loading ? "Running compliance check..." : "Export"}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => { onClose(); setDone(false); }}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Legal Hold Dialog ────────────────────────────────────────────────────────
function LegalHoldDialog({
  asset,
  open,
  onClose,
  onToggle,
}: {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onToggle();
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{asset.legalHold ? "Remove Legal Hold" : "Apply Legal Hold"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {asset.legalHold ? (
            <>
              <p className="text-sm text-muted-foreground">
                Removing the legal hold will allow this asset to be modified, archived, or deleted.
              </p>
              <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">
                  Ensure legal counsel has approved the removal of this hold before proceeding.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Applying a legal hold prevents this asset from being archived, deleted, or modified until the hold is removed.
              </p>
              <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <Shield className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This action will be logged in the audit trail with your identity and timestamp.
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            variant={asset.legalHold ? "destructive" : "default"}
            onClick={confirm}
            disabled={loading}
          >
            {loading ? "Processing..." : asset.legalHold ? "Remove Hold" : "Apply Hold"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Version Dialog ───────────────────────────────────────────────────────
function AddVersionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Version</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => document.getElementById("version-file")?.click()}
          >
            <input
              id="version-file"
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
            />
            {file ? (
              <>
                <CheckCircle className="size-8 text-emerald-500" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </>
            ) : (
              <>
                <Download className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop file or click to browse</p>
              </>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Version Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Describe what changed in this version..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={loading || !file}>
            {loading ? "Uploading..." : "Add Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  asset,
  onTransition,
}: {
  asset: Asset;
  onTransition: (s: AssetState) => void;
}) {
  const { can, role } = useRole();
  const [showTransition, setShowTransition] = useState(false);
  const validTargets = LIFECYCLE_TRANSITIONS[asset.state];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 flex flex-col gap-6">
        {/* Asset Information */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Asset Information</h3>
          </div>
          <div className="px-6">
            <InfoRow label="Asset ID" value={asset.id} mono action={<CopyButton text={asset.id} />} />
            <InfoRow label="Original Filename" value={asset.originalFilename} />
            <InfoRow label="MIME Type" value={asset.mimeType} mono />
            <InfoRow label="File Size" value={formatBytes(asset.sizeBytes)} />
            <InfoRow label="Checksum" value={asset.checksum} mono action={<CopyButton text={asset.checksum} />} />
            {(role === "admin") && (
              <InfoRow label="Storage Path" value={asset.storagePath} mono action={<CopyButton text={asset.storagePath} />} />
            )}
            <InfoRow label="Created By" value={
              <div className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">{asset.createdBy.initials}</AvatarFallback>
                </Avatar>
                {asset.createdBy.name}
              </div>
            } />
            <InfoRow label="Created" value={formatDateTime(asset.createdAt)} />
            <InfoRow label="Last Updated" value={formatDateTime(asset.updatedAt)} />
            {asset.project && <InfoRow label="Project" value={asset.project} />}
          </div>
        </div>

        {/* Lifecycle state */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Lifecycle State</h3>
          </div>
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              {ALL_STATES.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                    STATE_NODE_STYLE[s],
                    s === asset.state && "ring-2 ring-offset-1 ring-foreground/30"
                  )}>
                    {STATE_LABELS[s]}
                  </span>
                  {i < ALL_STATES.length - 1 && <ArrowRight className="size-3 text-muted-foreground/40" />}
                </div>
              ))}
            </div>
            {can("transition_state") && validTargets.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                {validTargets.map((t) => (
                  <Button
                    key={t}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onTransition(t)}
                  >
                    → {STATE_LABELS[t]}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Quick Actions</h3>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {asset.state === "draft" && can("transition_state") && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <ArrowRight className="size-3" />Submit for Review
              </Button>
            )}
            {asset.state === "under_review" && can("transition_state") && (
              <>
                <Button size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                  <CheckCircle className="size-3" />Approve
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-red-600">
                  <X className="size-3" />Reject
                </Button>
              </>
            )}
            {asset.state === "approved" && can("export") && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <Download className="size-3" />Export Asset
              </Button>
            )}
            {can("apply_legal_hold") && (
              <Button variant="outline" size="sm" className={cn("w-full justify-start gap-2 h-8 text-xs", asset.legalHold && "text-red-600")}>
                <Shield className="size-3" />{asset.legalHold ? "Remove Legal Hold" : "Apply Legal Hold"}
              </Button>
            )}
            {can("archive") && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground">
                <Minus className="size-3" />Archive
              </Button>
            )}
          </div>
        </div>

        {/* Retention & Compliance */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-base">Retention & Compliance</h3>
          </div>
          <div className="px-6 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Legal Hold</span>
              {asset.legalHold ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">Active</span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">None</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Retention Policy</span>
              <span className="text-xs text-foreground">Standard (7yr)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Compliance</span>
              {asset.state === "approved" ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="size-3" />Eligible
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Minus className="size-3" />Not eligible
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Versions Tab ─────────────────────────────────────────────────────────────
function VersionsTab({ asset }: { asset: Asset }) {
  const { can } = useRole();
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Version History</h3>
        {can("add_version") && (
          <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => setShowAdd(true)}>
            <Plus className="size-3" />Add Version
          </Button>
        )}
      </div>
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {[...asset.versions].reverse().map((v) => (
            <div key={v.id} className="px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">v{v.versionNumber}</span>
                  {v.versionNumber === asset.versions.length && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{v.comment}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">{v.checksum}</span>
                  <span className="text-xs text-muted-foreground">{formatBytes(v.sizeBytes)}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(v.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Download className="size-3" />Download
                </Button>
                {asset.versions.length > 1 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Compare</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddVersionDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

// ── Metadata Tab ─────────────────────────────────────────────────────────────
function MetadataTab({ asset }: { asset: Asset }) {
  const { can } = useRole();
  const [editing, setEditing] = useState(false);
  const [localMeta, setLocalMeta] = useState({ ...asset.metadata });

  const save = () => {
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Asset Metadata</h3>
        {can("edit_metadata") && !editing && (
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground w-48">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground flex-1">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground w-24">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.entries(localMeta).map(([key, value]) => (
              <tr key={key}>
                <td className="px-6 py-3 text-xs font-mono text-muted-foreground">{key}</td>
                <td className="px-6 py-3 text-xs text-foreground">
                  {editing ? (
                    <Input
                      value={value}
                      onChange={(e) => setLocalMeta((m) => ({ ...m, [key]: e.target.value }))}
                      className="h-7 text-xs"
                    />
                  ) : (
                    value
                  )}
                </td>
                <td className="px-6 py-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium",
                    value === "System"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {key === "source" ? value : (asset.metadata[key] === "System" ? "System" : "User")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setLocalMeta({ ...asset.metadata }); setEditing(false); }}>Cancel</Button>
          <Button size="sm" className="h-8 text-xs" onClick={save}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

// ── Provenance Tab ────────────────────────────────────────────────────────────
function ProvenanceTab({ asset }: { asset: Asset }) {
  const p = asset.provenance;
  if (!p) {
    return (
      <div className="border border-border rounded-xl bg-card p-16 flex flex-col items-center gap-4 text-center">
        <Shield className="size-10 text-muted-foreground/40" />
        <p className="font-medium text-foreground">No provenance data</p>
        <p className="text-sm text-muted-foreground">This asset does not have AI provenance information recorded.</p>
      </div>
    );
  }

  const riskColor =
    p.riskScore < 40
      ? "text-emerald-600 dark:text-emerald-400"
      : p.riskScore < 70
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  const riskBg =
    p.riskScore < 40
      ? "bg-emerald-500/10"
      : p.riskScore < 70
      ? "bg-amber-500/10"
      : "bg-red-500/10";

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-base">Provenance Record</h3>
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", riskBg, riskColor)}>
            Risk Score: {p.riskScore}
          </span>
        </div>
        <div className="px-6">
          <InfoRow label="Source Type" value={<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">{p.source}</span>} />
          {p.modelId && <InfoRow label="AI Model" value={p.modelId} mono />}
          {p.promptRef && <InfoRow label="Prompt Reference" value={p.promptRef} />}
          {p.parentAssetId && (
            <InfoRow label="Derived From" value={
              <Link href={`/assets/${p.parentAssetId}`} className="underline underline-offset-2 text-foreground hover:text-muted-foreground">
                {p.parentAssetId}
              </Link>
            } />
          )}
          <InfoRow label="Attribution" value={p.attribution} />
          <InfoRow label="Captured At" value={formatDateTime(p.capturedAt)} />
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-base">Asset Lineage</h3>
        </div>
        <div className="px-6 py-8 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="px-4 py-2 border border-border rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                Root
              </div>
              <span className="text-[10px] text-muted-foreground">Origin</span>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2">
              <div className="px-4 py-2 border-2 border-foreground rounded-lg bg-card text-xs font-medium text-foreground">
                {asset.id}
              </div>
              <span className="text-[10px] text-muted-foreground">Current</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Activity Tab ─────────────────────────────────────────────────────────────
const ACTION_ICONS = {
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

function ActivityTab({ asset }: { asset: Asset }) {
  const { role } = useRole();
  const isPrivileged = role === "admin" || role === "compliance_officer";
  const [expanded, setExpanded] = useState<string | null>(null);

  const entries = MOCK_ACTIVITY.filter((e) => e.assetId === asset.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Activity Log</h3>
      </div>
      {entries.length === 0 ? (
        <div className="border border-border rounded-xl bg-card p-12 flex flex-col items-center gap-3 text-center">
          <Clock className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No activity recorded for this asset.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {entries.map((entry) => {
              const Icon = ACTION_ICONS[entry.action] ?? Clock;
              const isExpanded = expanded === entry.id;
              return (
                <div key={entry.id}>
                  <div
                    className="px-6 py-4 flex items-start gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                  >
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", ACTION_BADGE[entry.action])}>
                          {entry.action}
                        </span>
                        <span className="text-xs text-muted-foreground">by {entry.actor.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(entry.timestamp)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
                    </div>
                    <div className="shrink-0 ml-2">
                      {entry.integrityValid ? (
                        <CheckCircle className="size-4 text-emerald-500" />
                      ) : entry.integrityHash ? (
                        <AlertCircle className="size-4 text-red-500" />
                      ) : (
                        <Minus className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-16 pb-4 flex flex-col gap-3 bg-muted/10">
                      {entry.previousState && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Previous:</span>
                          <StateBadge state={entry.previousState as AssetState} />
                          <ArrowRight className="size-3 text-muted-foreground" />
                          <StateBadge state={entry.newState as AssetState} />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Hash:</span>
                        <span className="text-xs font-mono text-foreground">{entry.integrityHash}</span>
                        <CopyButton text={entry.integrityHash} />
                      </div>
                      {isPrivileged && entry.ip && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">IP:</span>
                          <span className="text-xs font-mono text-foreground">{entry.ip}</span>
                        </div>
                      )}
                      {isPrivileged && entry.userAgent && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">UA:</span>
                          <span className="text-xs text-muted-foreground truncate max-w-sm">{entry.userAgent}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { can, role } = useRole();

  const activeTab = (searchParams.get("tab") as TabId) ?? "overview";
  const [asset, setAsset] = useState<Asset | null>(
    () => MOCK_ASSETS.find((a) => a.id === id) ?? null
  );

  const [showTransition, setShowTransition] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showLegalHold, setShowLegalHold] = useState(false);

  const setTab = (tab: TabId) => {
    router.push(`/assets/${id}?tab=${tab}`);
  };

  if (!asset) {
    return (
      <div className="p-8 flex flex-col items-center gap-6 text-center">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">Asset not found</p>
          <p className="text-sm text-muted-foreground mt-1">The asset you are looking for does not exist or has been removed.</p>
        </div>
        <Link href="/">
          <Button size="sm">Back to Library</Button>
        </Link>
      </div>
    );
  }

  const handleTransition = (newState: AssetState) => {
    setAsset((a) => a ? { ...a, state: newState } : a);
  };

  const handleLegalHoldToggle = () => {
    setAsset((a) => a ? { ...a, legalHold: !a.legalHold } : a);
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Library</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium truncate max-w-xs">{asset.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{asset.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StateBadge state={asset.state} />
            <TypeBadge type={asset.type} />
            {asset.legalHold && <LegalHoldBadge />}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatBytes(asset.sizeBytes)}</span>
            <span>·</span>
            <span>Created {formatDateTime(asset.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {can("transition_state") && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowTransition(true)}>
              <GitBranch className="size-3" />Transition State
            </Button>
          )}
          {can("export") && asset.state === "approved" && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowExport(true)}>
              <Download className="size-3" />Export
            </Button>
          )}
          {can("apply_legal_hold") && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowLegalHold(true)}>
              <Shield className="size-3" />{asset.legalHold ? "Remove Hold" : "Legal Hold"}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>
                <Download className="size-4 mr-2" />Download Original
              </DropdownMenuItem>
              {can("archive") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground">Archive</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-foreground text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab asset={asset} onTransition={(s) => { handleTransition(s); }} />
        )}
        {activeTab === "versions" && <VersionsTab asset={asset} />}
        {activeTab === "metadata" && <MetadataTab asset={asset} />}
        {activeTab === "provenance" && <ProvenanceTab asset={asset} />}
        {activeTab === "activity" && <ActivityTab asset={asset} />}
      </div>

      {/* Modals */}
      <TransitionDialog
        asset={asset}
        open={showTransition}
        onClose={() => setShowTransition(false)}
        onTransition={handleTransition}
      />
      <ExportDialog
        asset={asset}
        open={showExport}
        onClose={() => setShowExport(false)}
      />
      <LegalHoldDialog
        asset={asset}
        open={showLegalHold}
        onClose={() => setShowLegalHold(false)}
        onToggle={handleLegalHoldToggle}
      />
    </div>
  );
}
