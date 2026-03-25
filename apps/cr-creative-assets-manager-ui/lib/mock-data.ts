export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "brand_asset"
  | "campaign_file"
  | "ai_generated";

export type AssetState =
  | "uploaded"
  | "draft"
  | "under_review"
  | "approved"
  | "rejected"
  | "exported"
  | "archived";

export type UserRole =
  | "admin"
  | "manager"
  | "editor"
  | "viewer"
  | "compliance_officer";

export interface User {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
}

export interface AssetVersion {
  id: string;
  versionNumber: number;
  storagePath: string;
  checksum: string;
  sizeBytes: number;
  comment: string;
  createdAt: string;
  createdBy: User;
}

export interface Provenance {
  source: "ai_model" | "human" | "imported";
  modelId?: string;
  promptRef?: string;
  parentAssetId?: string;
  riskScore: number;
  attribution: string;
  capturedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  originalFilename: string;
  type: AssetType;
  state: AssetState;
  sizeBytes: number;
  mimeType: string;
  checksum: string;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  project?: string;
  legalHold: boolean;
  legalHoldAppliedAt?: string;
  provenance?: Provenance;
  metadata: Record<string, string>;
  versions: AssetVersion[];
}

export interface ExportRecord {
  id: string;
  assetId: string;
  assetName: string;
  format: string;
  destination: string | null;
  exportedBy: User;
  exportedAt: string;
  linkStatus: "active" | "expired";
  downloadUrl?: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  action:
    | "asset.created"
    | "state.changed"
    | "metadata.updated"
    | "version.added"
    | "exported"
    | "legal_hold.applied"
    | "legal_hold.removed"
    | "archived"
    | "provenance.recorded";
  assetId: string;
  assetName: string;
  actor: User;
  details: string;
  previousState?: string;
  newState?: string;
  ip?: string;
  userAgent?: string;
  integrityHash: string;
  previousHash?: string;
  integrityValid: boolean;
}

export const USERS: User[] = [
  { id: "u1", name: "Sarah Chen", initials: "SC" },
  { id: "u2", name: "James Wu", initials: "JW" },
  { id: "u3", name: "Maria Lopez", initials: "ML" },
  { id: "u4", name: "David Kim", initials: "DK" },
  { id: "u5", name: "Lisa Park", initials: "LP" },
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: "ast_001",
    name: "Q4 Campaign Hero Banner",
    originalFilename: "q4-hero-banner-final-v3.psd",
    type: "image",
    state: "approved",
    sizeBytes: 24_800_000,
    mimeType: "image/vnd.adobe.photoshop",
    checksum: "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    storagePath: "s3://cr-assets/tenants/t001/ast_001/q4-hero-banner.psd",
    createdAt: "2025-11-01T09:12:00Z",
    updatedAt: "2025-11-15T14:30:00Z",
    createdBy: USERS[0],
    project: "Q4 Campaign 2025",
    legalHold: false,
    metadata: {
      campaign: "Q4 2025",
      dimensions: "1920x1080",
      colorProfile: "sRGB",
      source: "User",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_001/v1/q4-hero.psd",
        checksum: "sha256:aabbcc001122",
        sizeBytes: 22_000_000,
        comment: "Initial upload",
        createdAt: "2025-11-01T09:12:00Z",
        createdBy: USERS[0],
      },
      {
        id: "v2",
        versionNumber: 2,
        storagePath: "s3://cr-assets/tenants/t001/ast_001/v2/q4-hero.psd",
        checksum: "sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
        sizeBytes: 24_800_000,
        comment: "Updated CTA text and color adjustments",
        createdAt: "2025-11-10T11:00:00Z",
        createdBy: USERS[0],
      },
    ],
  },
  {
    id: "ast_002",
    name: "Product Lifestyle Shots",
    originalFilename: "product-lifestyle-batch-01.zip",
    type: "image",
    state: "under_review",
    sizeBytes: 156_300_000,
    mimeType: "application/zip",
    checksum: "sha256:b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
    storagePath: "s3://cr-assets/tenants/t001/ast_002/lifestyle-shots.zip",
    createdAt: "2025-11-05T14:20:00Z",
    updatedAt: "2025-11-05T14:20:00Z",
    createdBy: USERS[1],
    project: "Spring Collection 2026",
    legalHold: true,
    legalHoldAppliedAt: "2025-11-20T10:00:00Z",
    metadata: {
      photographer: "James Wu",
      location: "Studio B",
      source: "User",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_002/v1/lifestyle.zip",
        checksum: "sha256:b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
        sizeBytes: 156_300_000,
        comment: "Initial upload",
        createdAt: "2025-11-05T14:20:00Z",
        createdBy: USERS[1],
      },
    ],
  },
  {
    id: "ast_003",
    name: "Brand Video v3",
    originalFilename: "brand-video-v3-master.mp4",
    type: "video",
    state: "approved",
    sizeBytes: 890_000_000,
    mimeType: "video/mp4",
    checksum: "sha256:c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    storagePath: "s3://cr-assets/tenants/t001/ast_003/brand-video-v3.mp4",
    createdAt: "2025-10-20T10:00:00Z",
    updatedAt: "2025-10-28T16:00:00Z",
    createdBy: USERS[2],
    project: "Brand Refresh 2025",
    legalHold: false,
    metadata: {
      duration: "2:35",
      resolution: "4K",
      codec: "H.264",
      source: "User",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_003/v1/brand-v1.mp4",
        checksum: "sha256:cc001122aabb",
        sizeBytes: 750_000_000,
        comment: "Draft cut",
        createdAt: "2025-10-15T09:00:00Z",
        createdBy: USERS[2],
      },
      {
        id: "v2",
        versionNumber: 2,
        storagePath: "s3://cr-assets/tenants/t001/ast_003/v2/brand-v2.mp4",
        checksum: "sha256:cc001122ccdd",
        sizeBytes: 820_000_000,
        comment: "Director cut with revised audio",
        createdAt: "2025-10-22T11:30:00Z",
        createdBy: USERS[2],
      },
      {
        id: "v3",
        versionNumber: 3,
        storagePath: "s3://cr-assets/tenants/t001/ast_003/v3/brand-v3.mp4",
        checksum: "sha256:c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
        sizeBytes: 890_000_000,
        comment: "Final approved master",
        createdAt: "2025-10-28T16:00:00Z",
        createdBy: USERS[2],
      },
    ],
  },
  {
    id: "ast_004",
    name: "Social Media Pack Q2",
    originalFilename: "social-pack-q2-all-formats.zip",
    type: "campaign_file",
    state: "exported",
    sizeBytes: 45_600_000,
    mimeType: "application/zip",
    checksum: "sha256:d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
    storagePath: "s3://cr-assets/tenants/t001/ast_004/social-pack-q2.zip",
    createdAt: "2025-09-15T08:00:00Z",
    updatedAt: "2025-09-30T12:00:00Z",
    createdBy: USERS[3],
    project: "Q2 Social Campaign",
    legalHold: false,
    metadata: { platforms: "Instagram, TikTok, LinkedIn", source: "User" },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_004/v1/social-q2.zip",
        checksum: "sha256:d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
        sizeBytes: 45_600_000,
        comment: "Final pack",
        createdAt: "2025-09-15T08:00:00Z",
        createdBy: USERS[3],
      },
    ],
  },
  {
    id: "ast_005",
    name: "Holiday Collection Thumbnails",
    originalFilename: "holiday-thumbnails-2025.psd",
    type: "image",
    state: "draft",
    sizeBytes: 12_400_000,
    mimeType: "image/vnd.adobe.photoshop",
    checksum: "sha256:e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    storagePath:
      "s3://cr-assets/tenants/t001/ast_005/holiday-thumbnails.psd",
    createdAt: "2025-11-18T13:45:00Z",
    updatedAt: "2025-11-18T13:45:00Z",
    createdBy: USERS[4],
    project: "Holiday 2025",
    legalHold: false,
    metadata: { source: "User" },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath:
          "s3://cr-assets/tenants/t001/ast_005/v1/holiday-thumbnails.psd",
        checksum: "sha256:e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        sizeBytes: 12_400_000,
        comment: "Initial draft",
        createdAt: "2025-11-18T13:45:00Z",
        createdBy: USERS[4],
      },
    ],
  },
  {
    id: "ast_006",
    name: "AI-Generated Product Mockups",
    originalFilename: "ai-product-mockups-batch-01.png",
    type: "ai_generated",
    state: "under_review",
    sizeBytes: 8_900_000,
    mimeType: "image/png",
    checksum: "sha256:f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    storagePath: "s3://cr-assets/tenants/t001/ast_006/ai-mockups.png",
    createdAt: "2025-11-10T16:30:00Z",
    updatedAt: "2025-11-11T09:00:00Z",
    createdBy: USERS[0],
    project: "Product Line Alpha",
    legalHold: false,
    provenance: {
      source: "ai_model",
      modelId: "midjourney-v6",
      promptRef: "PRF-2025-1110-001",
      riskScore: 62,
      attribution: "Generated via Midjourney API v6",
      capturedAt: "2025-11-10T16:30:00Z",
    },
    metadata: {
      model: "midjourney-v6",
      promptReference: "PRF-2025-1110-001",
      source: "System",
      aiGenerated: "true",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_006/v1/ai-mockups.png",
        checksum: "sha256:f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
        sizeBytes: 8_900_000,
        comment: "Initial AI generation",
        createdAt: "2025-11-10T16:30:00Z",
        createdBy: USERS[0],
      },
    ],
  },
  {
    id: "ast_007",
    name: "Spring Campaign Hero Image",
    originalFilename: "spring-hero-2026-final.jpg",
    type: "image",
    state: "uploaded",
    sizeBytes: 6_200_000,
    mimeType: "image/jpeg",
    checksum: "sha256:a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5",
    storagePath: "s3://cr-assets/tenants/t001/ast_007/spring-hero.jpg",
    createdAt: "2025-11-22T10:15:00Z",
    updatedAt: "2025-11-22T10:15:00Z",
    createdBy: USERS[1],
    project: "Spring Collection 2026",
    legalHold: false,
    metadata: { dimensions: "3840x2160", source: "User" },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_007/v1/spring-hero.jpg",
        checksum: "sha256:a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5",
        sizeBytes: 6_200_000,
        comment: "Initial upload",
        createdAt: "2025-11-22T10:15:00Z",
        createdBy: USERS[1],
      },
    ],
  },
  {
    id: "ast_008",
    name: "Client Presentation Assets",
    originalFilename: "client-pres-nov2025.pptx",
    type: "document",
    state: "rejected",
    sizeBytes: 34_100_000,
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    checksum: "sha256:b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6",
    storagePath: "s3://cr-assets/tenants/t001/ast_008/client-pres.pptx",
    createdAt: "2025-11-08T11:30:00Z",
    updatedAt: "2025-11-12T15:00:00Z",
    createdBy: USERS[2],
    project: "Client XYZ",
    legalHold: false,
    metadata: {
      pages: "42",
      client: "XYZ Corp",
      source: "User",
    },
    versions: [
      {
        id: "v1",
        versionNumber: 1,
        storagePath: "s3://cr-assets/tenants/t001/ast_008/v1/client-pres.pptx",
        checksum: "sha256:b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6",
        sizeBytes: 34_100_000,
        comment: "Submitted for review",
        createdAt: "2025-11-08T11:30:00Z",
        createdBy: USERS[2],
      },
    ],
  },
];

export const MOCK_EXPORTS: ExportRecord[] = [
  {
    id: "exp_001",
    assetId: "ast_001",
    assetName: "Q4 Campaign Hero Banner",
    format: "PNG",
    destination: "https://cdn.client.com/assets/q4-hero.png",
    exportedBy: USERS[3],
    exportedAt: "2025-11-16T10:30:00Z",
    linkStatus: "active",
    downloadUrl: "https://cdn.client.com/assets/q4-hero.png",
  },
  {
    id: "exp_002",
    assetId: "ast_003",
    assetName: "Brand Video v3",
    format: "MP4",
    destination: null,
    exportedBy: USERS[0],
    exportedAt: "2025-11-14T14:00:00Z",
    linkStatus: "active",
    downloadUrl: "https://dl.creationrights.io/exp_002/brand-video-v3.mp4",
  },
  {
    id: "exp_003",
    assetId: "ast_004",
    assetName: "Social Media Pack Q2",
    format: "Original",
    destination: "https://storage.partner.net/social-q2.zip",
    exportedBy: USERS[1],
    exportedAt: "2025-10-01T09:15:00Z",
    linkStatus: "expired",
  },
  {
    id: "exp_004",
    assetId: "ast_001",
    assetName: "Q4 Campaign Hero Banner",
    format: "JPG",
    destination: null,
    exportedBy: USERS[2],
    exportedAt: "2025-11-18T16:45:00Z",
    linkStatus: "active",
    downloadUrl: "https://dl.creationrights.io/exp_004/q4-hero.jpg",
  },
  {
    id: "exp_005",
    assetId: "ast_003",
    assetName: "Brand Video v3",
    format: "MP4",
    destination: "https://vimeo.com/upload/api/v2",
    exportedBy: USERS[4],
    exportedAt: "2025-11-20T11:00:00Z",
    linkStatus: "active",
    downloadUrl: "https://dl.creationrights.io/exp_005/brand-v3.mp4",
  },
  {
    id: "exp_006",
    assetId: "ast_004",
    assetName: "Social Media Pack Q2",
    format: "PNG",
    destination: null,
    exportedBy: USERS[0],
    exportedAt: "2025-09-28T08:00:00Z",
    linkStatus: "expired",
  },
];

export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: "act_001",
    timestamp: "2025-11-22T10:15:00Z",
    action: "asset.created",
    assetId: "ast_007",
    assetName: "Spring Campaign Hero Image",
    actor: USERS[1],
    details: "Asset uploaded and registered",
    ip: "10.0.1.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_001_hash",
    integrityValid: true,
  },
  {
    id: "act_002",
    timestamp: "2025-11-20T11:05:00Z",
    action: "exported",
    assetId: "ast_003",
    assetName: "Brand Video v3",
    actor: USERS[4],
    details: "Exported as MP4 to Vimeo",
    ip: "10.0.1.88",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    integrityHash: "sha256:int_act_002_hash",
    previousHash: "sha256:int_act_001_hash",
    integrityValid: true,
  },
  {
    id: "act_003",
    timestamp: "2025-11-20T10:00:00Z",
    action: "legal_hold.applied",
    assetId: "ast_002",
    assetName: "Product Lifestyle Shots",
    actor: USERS[2],
    details: "Legal hold applied per counsel request LGL-2025-112",
    ip: "10.0.2.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_003_hash",
    previousHash: "sha256:int_act_002_hash",
    integrityValid: true,
  },
  {
    id: "act_004",
    timestamp: "2025-11-15T14:30:00Z",
    action: "state.changed",
    assetId: "ast_001",
    assetName: "Q4 Campaign Hero Banner",
    actor: USERS[3],
    details: "State changed from under_review to approved",
    previousState: "under_review",
    newState: "approved",
    ip: "10.0.1.55",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_004_hash",
    previousHash: "sha256:int_act_003_hash",
    integrityValid: true,
  },
  {
    id: "act_005",
    timestamp: "2025-11-12T15:00:00Z",
    action: "state.changed",
    assetId: "ast_008",
    assetName: "Client Presentation Assets",
    actor: USERS[3],
    details: "State changed from under_review to rejected",
    previousState: "under_review",
    newState: "rejected",
    ip: "10.0.1.55",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_005_hash",
    previousHash: "sha256:int_act_004_hash",
    integrityValid: true,
  },
  {
    id: "act_006",
    timestamp: "2025-11-11T09:00:00Z",
    action: "provenance.recorded",
    assetId: "ast_006",
    assetName: "AI-Generated Product Mockups",
    actor: USERS[0],
    details: "AI provenance recorded — model: midjourney-v6, risk score: 62",
    ip: "10.0.1.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_006_hash",
    previousHash: "sha256:int_act_005_hash",
    integrityValid: true,
  },
  {
    id: "act_007",
    timestamp: "2025-11-10T16:30:00Z",
    action: "asset.created",
    assetId: "ast_006",
    assetName: "AI-Generated Product Mockups",
    actor: USERS[0],
    details: "AI-generated asset uploaded and registered",
    ip: "10.0.1.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_007_hash",
    previousHash: "sha256:int_act_006_hash",
    integrityValid: false,
  },
  {
    id: "act_008",
    timestamp: "2025-11-08T11:30:00Z",
    action: "asset.created",
    assetId: "ast_008",
    assetName: "Client Presentation Assets",
    actor: USERS[2],
    details: "Asset uploaded and registered",
    ip: "10.0.2.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    integrityHash: "sha256:int_act_008_hash",
    previousHash: "sha256:int_act_007_hash",
    integrityValid: true,
  },
];

export const LIFECYCLE_TRANSITIONS: Record<AssetState, AssetState[]> = {
  uploaded: ["draft", "archived"],
  draft: ["under_review", "archived"],
  under_review: ["approved", "rejected"],
  approved: ["exported", "archived"],
  rejected: ["draft"],
  exported: ["archived"],
  archived: [],
};

export const STATE_LABELS: Record<AssetState, string> = {
  uploaded: "Uploaded",
  draft: "Draft",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  exported: "Exported",
  archived: "Archived",
};

export const TYPE_LABELS: Record<AssetType, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  document: "Document",
  brand_asset: "Brand Asset",
  campaign_file: "Campaign File",
  ai_generated: "AI Generated",
};

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000)
    return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) {
    const hours = Math.floor(diff / 3_600_000);
    if (hours === 0) return "Just now";
    return `${hours}h ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
