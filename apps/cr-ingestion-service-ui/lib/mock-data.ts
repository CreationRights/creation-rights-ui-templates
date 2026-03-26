import { formatDistanceToNow, subHours, subMinutes, subDays } from "date-fns"

export type IngestionStatus =
  | "pending"
  | "validating"
  | "accepted"
  | "quarantined"
  | "retrying"
  | "deduplicating"
  | "finalizing"
  | "completed"
  | "failed"
  | "cancelled"

export type SourceType = "upload" | "api_payload" | "cloud_object" | "connected_tool"

export type QuarantineReason =
  | "malware_detected"
  | "validation_failed"
  | "size_exceeded"
  | "mime_type_blocked"
  | "integrity_mismatch"
  | "policy_violation"
  | "manual_hold"

export type Severity = "critical" | "high" | "medium" | "low"

export type DedupStrategy = "checksum_exact" | "content_hash" | "filename_match"
export type DedupResolution = "unresolved" | "skip" | "replace" | "keep_both"

export type ActivityAction =
  | "Ingestion Created"
  | "Validated"
  | "Accepted"
  | "Quarantined"
  | "Retrying"
  | "Deduplicating"
  | "Finalizing"
  | "Completed"
  | "Failed"
  | "Cancelled"
  | "Quarantine Released"
  | "Quarantine Deleted"
  | "Quarantine Expired"
  | "Artifact Validated"
  | "Artifact Rejected"
  | "Dedup Detected"
  | "Dedup Resolved"

export interface Ingestion {
  id: string
  fileName: string
  mimeType: string
  fileSize: number
  sourceType: SourceType
  sourceUri: string
  status: IngestionStatus
  retryCount: number
  maxRetries: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  failedAt?: Date
  failureReason?: string
  checksum?: string
  checksumAlgorithm?: string
  metadata: Record<string, string>
}

export interface QuarantineRecord {
  id: string
  ingestionId: string
  ingestionFileName: string
  reason: QuarantineReason
  severity: Severity
  details: string
  quarantinedAt: Date
  expiresAt: Date | null
  status: "active" | "released" | "deleted" | "expired"
  resolvedBy?: string
  resolvedAt?: Date
}

export interface DuplicateRecord {
  id: string
  sourceIngestionId: string
  sourceFileName: string
  matchedIngestionId: string
  matchedFileName: string
  strategy: DedupStrategy
  confidence: number
  checksum: string
  detectedAt: Date
  resolution: DedupResolution
}

export interface ActivityEntry {
  id: string
  timestamp: Date
  action: ActivityAction
  ingestionId: string
  ingestionFileName: string
  actorId: string
  actorName: string
  previousState?: IngestionStatus
  newState?: IngestionStatus
  details?: Record<string, unknown>
}

export interface Artifact {
  id: string
  ingestionId: string
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  checksumAlgorithm: string
  storageKey: string
  validationStatus: "valid" | "invalid" | "pending"
  validationErrors?: string[]
  validatedAt?: Date
}

const now = new Date()

export const MOCK_INGESTIONS: Ingestion[] = [
  {
    id: "ing_01",
    fileName: "spring-hero-2026-final.jpg",
    mimeType: "image/jpeg",
    fileSize: 4_200_000,
    sourceType: "upload",
    sourceUri: "direct-upload://spring-hero-2026-final.jpg",
    status: "validating",
    retryCount: 0,
    maxRetries: 3,
    createdBy: "Sarah Chen",
    createdAt: subMinutes(now, 5),
    updatedAt: subMinutes(now, 2),
    metadata: { campaign: "Spring 2026", department: "Marketing" },
  },
  {
    id: "ing_02",
    fileName: "product-mockups-batch-01.png",
    mimeType: "image/png",
    fileSize: 12_800_000,
    sourceType: "upload",
    sourceUri: "direct-upload://product-mockups-batch-01.png",
    status: "accepted",
    retryCount: 0,
    maxRetries: 3,
    createdBy: "James Wu",
    createdAt: subMinutes(now, 30),
    updatedAt: subMinutes(now, 28),
    metadata: { project: "Product Line 2026" },
  },
  {
    id: "ing_03",
    fileName: "brand-video-v3-master.mp4",
    mimeType: "video/mp4",
    fileSize: 890_000_000,
    sourceType: "cloud_object",
    sourceUri: "s3://brand-assets-bucket/brand-video-v3-master.mp4",
    status: "quarantined",
    retryCount: 1,
    maxRetries: 3,
    createdBy: "Maria Lopez",
    createdAt: subHours(now, 2),
    updatedAt: subHours(now, 1),
    failureReason: "File failed integrity check during cloud import",
    metadata: { client: "Acme Corp" },
  },
  {
    id: "ing_04",
    fileName: "client-pres-nov2025.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    fileSize: 8_400_000,
    sourceType: "api_payload",
    sourceUri: "https://api.partner.com/assets/client-pres-nov2025",
    status: "completed",
    retryCount: 0,
    maxRetries: 3,
    createdBy: "David Kim",
    createdAt: subHours(now, 5),
    updatedAt: subHours(now, 4),
    completedAt: subHours(now, 4),
    checksum: "a3f4b2c1d5e6f7a8b9c0d1e2f3a4b5c6",
    checksumAlgorithm: "sha256",
    metadata: { client: "Northstar", priority: "high" },
  },
  {
    id: "ing_05",
    fileName: "ai-generated-banners.zip",
    mimeType: "application/zip",
    fileSize: 56_000_000,
    sourceType: "connected_tool",
    sourceUri: "tool://midjourney-export/ai-generated-banners",
    status: "deduplicating",
    retryCount: 0,
    maxRetries: 3,
    createdBy: "Sarah Chen",
    createdAt: subHours(now, 1),
    updatedAt: subMinutes(now, 45),
    metadata: { generator: "Midjourney", batch: "q2-2026" },
  },
  {
    id: "ing_06",
    fileName: "holiday-thumbnails-2025.psd",
    mimeType: "image/vnd.adobe.photoshop",
    fileSize: 234_000_000,
    sourceType: "upload",
    sourceUri: "direct-upload://holiday-thumbnails-2025.psd",
    status: "failed",
    retryCount: 3,
    maxRetries: 3,
    createdBy: "James Wu",
    createdAt: subHours(now, 8),
    updatedAt: subHours(now, 6),
    failedAt: subHours(now, 6),
    failureReason: "File size exceeds maximum allowed limit of 200MB",
    metadata: {},
  },
  {
    id: "ing_07",
    fileName: "social-media-pack-q2.zip",
    mimeType: "application/zip",
    fileSize: 78_000_000,
    sourceType: "cloud_object",
    sourceUri: "gs://creative-storage/q2-packs/social-media-pack-q2.zip",
    status: "finalizing",
    retryCount: 0,
    maxRetries: 3,
    createdBy: "Maria Lopez",
    createdAt: subHours(now, 3),
    updatedAt: subMinutes(now, 15),
    checksum: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    checksumAlgorithm: "sha256",
    metadata: { quarter: "Q2 2026", channel: "social" },
  },
  {
    id: "ing_08",
    fileName: "campaign-brief-draft.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 1_200_000,
    sourceType: "api_payload",
    sourceUri: "https://api.collab.io/docs/campaign-brief-draft",
    status: "retrying",
    retryCount: 2,
    maxRetries: 3,
    createdBy: "David Kim",
    createdAt: subHours(now, 4),
    updatedAt: subMinutes(now, 10),
    metadata: { department: "Creative", project: "Summer Campaign" },
  },
]

export const MOCK_QUARANTINE: QuarantineRecord[] = [
  {
    id: "qr_01",
    ingestionId: "ing_03",
    ingestionFileName: "brand-video-v3-master.mp4",
    reason: "integrity_mismatch",
    severity: "critical",
    details: "SHA-256 checksum mismatch detected during cloud import. Expected hash does not match computed hash. Possible file corruption or tampering.",
    quarantinedAt: subHours(now, 1),
    expiresAt: subDays(now, -5),
    status: "active",
  },
  {
    id: "qr_02",
    ingestionId: "ing_06",
    ingestionFileName: "holiday-thumbnails-2025.psd",
    reason: "size_exceeded",
    severity: "medium",
    details: "File size of 234 MB exceeds the tenant limit of 200 MB for PSD uploads.",
    quarantinedAt: subHours(now, 6),
    expiresAt: null,
    status: "active",
  },
  {
    id: "qr_03",
    ingestionId: "ing_01",
    ingestionFileName: "spring-hero-2026-final.jpg",
    reason: "validation_failed",
    severity: "high",
    details: "EXIF metadata contains prohibited GPS coordinates. Policy requires stripping location data before ingestion.",
    quarantinedAt: subHours(now, 12),
    expiresAt: subDays(now, -3),
    status: "active",
  },
  {
    id: "qr_04",
    ingestionId: "ing_02",
    ingestionFileName: "product-mockups-batch-01.png",
    reason: "malware_detected",
    severity: "critical",
    details: "Embedded payload detected in PNG metadata chunk. Quarantined by automated scanner v2.4.1.",
    quarantinedAt: subDays(now, 2),
    expiresAt: subDays(now, 5),
    status: "released",
    resolvedBy: "Sarah Chen",
    resolvedAt: subDays(now, 1),
  },
]

export const MOCK_DUPLICATES: DuplicateRecord[] = [
  {
    id: "dup_01",
    sourceIngestionId: "ing_05",
    sourceFileName: "ai-generated-banners.zip",
    matchedIngestionId: "ing_07",
    matchedFileName: "social-media-pack-q2.zip",
    strategy: "checksum_exact",
    confidence: 100,
    checksum: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    detectedAt: subMinutes(now, 45),
    resolution: "unresolved",
  },
  {
    id: "dup_02",
    sourceIngestionId: "ing_01",
    sourceFileName: "spring-hero-2026-final.jpg",
    matchedIngestionId: "ing_04",
    matchedFileName: "client-pres-nov2025.pptx",
    strategy: "content_hash",
    confidence: 87,
    checksum: "a3f4b2c1d5e6f7a8b9c0d1e2f3a4b5c6",
    detectedAt: subHours(now, 3),
    resolution: "skip",
  },
  {
    id: "dup_03",
    sourceIngestionId: "ing_08",
    sourceFileName: "campaign-brief-draft.docx",
    matchedIngestionId: "ing_06",
    matchedFileName: "holiday-thumbnails-2025.psd",
    strategy: "filename_match",
    confidence: 72,
    checksum: "f1e2d3c4b5a6978869504132f2e1d0c9",
    detectedAt: subHours(now, 1),
    resolution: "keep_both",
  },
]

export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: "act_01",
    timestamp: subMinutes(now, 2),
    action: "Validated",
    ingestionId: "ing_01",
    ingestionFileName: "spring-hero-2026-final.jpg",
    actorId: "sys_validator",
    actorName: "System",
    previousState: "validating",
    newState: "accepted",
    details: { validatorVersion: "2.4.1", checksumOk: true },
  },
  {
    id: "act_02",
    timestamp: subMinutes(now, 10),
    action: "Retrying",
    ingestionId: "ing_08",
    ingestionFileName: "campaign-brief-draft.docx",
    actorId: "usr_david",
    actorName: "David Kim",
    previousState: "failed",
    newState: "retrying",
    details: { attempt: 2, reason: "Manual retry by editor" },
  },
  {
    id: "act_03",
    timestamp: subMinutes(now, 15),
    action: "Dedup Detected",
    ingestionId: "ing_05",
    ingestionFileName: "ai-generated-banners.zip",
    actorId: "sys_dedup",
    actorName: "System",
    previousState: "accepted",
    newState: "deduplicating",
    details: { matchedWith: "ing_07", strategy: "checksum_exact", confidence: 100 },
  },
  {
    id: "act_04",
    timestamp: subHours(now, 1),
    action: "Quarantined",
    ingestionId: "ing_03",
    ingestionFileName: "brand-video-v3-master.mp4",
    actorId: "sys_scanner",
    actorName: "System",
    previousState: "validating",
    newState: "quarantined",
    details: { reason: "integrity_mismatch", severity: "critical" },
  },
  {
    id: "act_05",
    timestamp: subHours(now, 4),
    action: "Completed",
    ingestionId: "ing_04",
    ingestionFileName: "client-pres-nov2025.pptx",
    actorId: "sys_finalizer",
    actorName: "System",
    previousState: "finalizing",
    newState: "completed",
    details: { artifactsCount: 1, storageKey: "assets/2026/q1/client-pres-nov2025.pptx" },
  },
  {
    id: "act_06",
    timestamp: subHours(now, 6),
    action: "Failed",
    ingestionId: "ing_06",
    ingestionFileName: "holiday-thumbnails-2025.psd",
    actorId: "sys_validator",
    actorName: "System",
    previousState: "retrying",
    newState: "failed",
    details: { error: "FILE_SIZE_EXCEEDED", maxSizeMb: 200, actualSizeMb: 234 },
  },
]

export const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: "art_01",
    ingestionId: "ing_04",
    fileName: "client-pres-nov2025.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    fileSize: 8_400_000,
    checksum: "a3f4b2c1d5e6f7a8b9c0d1e2f3a4b5c6",
    checksumAlgorithm: "sha256",
    storageKey: "assets/2026/q1/client-pres-nov2025.pptx",
    validationStatus: "valid",
    validatedAt: subHours(now, 4),
  },
  {
    id: "art_02",
    ingestionId: "ing_07",
    fileName: "social-media-pack-q2.zip",
    mimeType: "application/zip",
    fileSize: 78_000_000,
    checksum: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    checksumAlgorithm: "sha256",
    storageKey: "assets/2026/q2/social-media-pack-q2.zip",
    validationStatus: "pending",
  },
  {
    id: "art_03",
    ingestionId: "ing_06",
    fileName: "holiday-thumbnails-2025.psd",
    mimeType: "image/vnd.adobe.photoshop",
    fileSize: 234_000_000,
    checksum: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    checksumAlgorithm: "md5",
    storageKey: "quarantine/2026/q1/holiday-thumbnails-2025.psd",
    validationStatus: "invalid",
    validationErrors: ["File size exceeds tenant limit (200MB)", "PSD version not supported"],
  },
]

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}
