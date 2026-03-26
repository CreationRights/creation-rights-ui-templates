import type {
  IngestionStatus,
  SourceType,
  QuarantineReason,
  Severity,
  DedupStrategy,
  DedupResolution,
  ActivityAction,
} from "./mock-data"

export function statusBadgeClass(status: IngestionStatus): string {
  const map: Record<IngestionStatus, string> = {
    pending: "bg-muted text-muted-foreground",
    validating: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    quarantined: "bg-red-500/10 text-red-600 dark:text-red-400",
    retrying: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    deduplicating: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    finalizing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400",
    cancelled: "bg-muted text-muted-foreground",
  }
  return map[status] ?? "bg-muted text-muted-foreground"
}

export function statusLabel(status: IngestionStatus): string {
  const map: Record<IngestionStatus, string> = {
    pending: "Pending",
    validating: "Validating",
    accepted: "Accepted",
    quarantined: "Quarantined",
    retrying: "Retrying",
    deduplicating: "Deduplicating",
    finalizing: "Finalizing",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  }
  return map[status] ?? status
}

export function sourceBadgeClass(source: SourceType): string {
  const map: Record<SourceType, string> = {
    upload: "bg-muted text-muted-foreground",
    api_payload: "bg-muted text-muted-foreground",
    cloud_object: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    connected_tool: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }
  return map[source] ?? "bg-muted text-muted-foreground"
}

export function sourceLabel(source: SourceType): string {
  const map: Record<SourceType, string> = {
    upload: "Upload",
    api_payload: "API",
    cloud_object: "Cloud",
    connected_tool: "Tool",
  }
  return map[source] ?? source
}

export function reasonBadgeClass(reason: QuarantineReason): string {
  const map: Record<QuarantineReason, string> = {
    malware_detected: "bg-red-500/10 text-red-600 dark:text-red-400",
    validation_failed: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    size_exceeded: "bg-muted text-muted-foreground",
    mime_type_blocked: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    integrity_mismatch: "bg-red-500/10 text-red-600 dark:text-red-400",
    policy_violation: "bg-red-500/10 text-red-600 dark:text-red-400",
    manual_hold: "bg-muted text-muted-foreground",
  }
  return map[reason] ?? "bg-muted text-muted-foreground"
}

export function reasonLabel(reason: QuarantineReason): string {
  const map: Record<QuarantineReason, string> = {
    malware_detected: "Malware",
    validation_failed: "Validation Failed",
    size_exceeded: "Size Exceeded",
    mime_type_blocked: "MIME Blocked",
    integrity_mismatch: "Integrity Mismatch",
    policy_violation: "Policy Violation",
    manual_hold: "Manual Hold",
  }
  return map[reason] ?? reason
}

export function severityBadgeClass(severity: Severity): string {
  const map: Record<Severity, string> = {
    critical: "bg-red-500/10 text-red-600 dark:text-red-400",
    high: "bg-red-500/10 text-red-600 dark:text-red-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    low: "bg-muted text-muted-foreground",
  }
  return map[severity] ?? "bg-muted text-muted-foreground"
}

export function severityLabel(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

export function strategyLabel(strategy: DedupStrategy): string {
  const map: Record<DedupStrategy, string> = {
    checksum_exact: "Checksum Exact",
    content_hash: "Content Hash",
    filename_match: "Filename Match",
  }
  return map[strategy] ?? strategy
}

export function resolutionLabel(resolution: DedupResolution): string {
  const map: Record<DedupResolution, string> = {
    unresolved: "—",
    skip: "Skip",
    replace: "Replace",
    keep_both: "Keep Both",
  }
  return map[resolution] ?? resolution
}

export function resolutionBadgeClass(resolution: DedupResolution): string {
  const map: Record<DedupResolution, string> = {
    unresolved: "bg-muted text-muted-foreground",
    skip: "bg-muted text-muted-foreground",
    replace: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    keep_both: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }
  return map[resolution] ?? "bg-muted text-muted-foreground"
}

export function confidenceColor(confidence: number): string {
  if (confidence === 100) return "text-emerald-600 dark:text-emerald-400"
  if (confidence >= 85) return "text-amber-600 dark:text-amber-400"
  return "text-muted-foreground"
}

export function activityActionBadgeClass(action: ActivityAction): string {
  const green = ["Ingestion Created", "Completed", "Quarantine Released", "Artifact Validated", "Dedup Resolved"]
  const blue = ["Validated", "Accepted", "Deduplicating", "Finalizing", "Artifact Rejected"]
  const amber = ["Retrying", "Quarantine Expired", "Dedup Detected"]
  const red = ["Quarantined", "Failed", "Cancelled", "Quarantine Deleted"]

  if (green.includes(action)) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  if (blue.includes(action)) return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  if (amber.includes(action)) return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  if (red.includes(action)) return "bg-red-500/10 text-red-600 dark:text-red-400"
  return "bg-muted text-muted-foreground"
}

export function isTerminalStatus(status: IngestionStatus): boolean {
  return ["completed", "failed", "cancelled"].includes(status)
}
