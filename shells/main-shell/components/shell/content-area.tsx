"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface ContentAreaProps {
  sectionId: string
  activeItem: string
  isLoading: boolean
}

const sectionNames: Record<string, string> = {
  "asset-studio": "Asset Studio",
  "rights-licensing": "Rights Registry",
  "ai-governance": "AI Governance",
  "compliance-audit": "Compliance & Audit",
  "workflow-delivery": "Workflow & Delivery",
}

const itemNames: Record<string, Record<string, string>> = {
  "asset-studio": {
    library: "Asset Library",
    upload: "Upload Center",
    projects: "Projects",
    collections: "Collections",
    tags: "Tags & Metadata",
    search: "Advanced Search",
  },
  "rights-licensing": {
    "rights-list": "Rights List",
    ownership: "Ownership",
    transfers: "Transfers",
    conflicts: "Conflicts",
    assertions: "Assertions",
    search: "Search",
  },
  "ai-governance": {
    models: "Approved Models",
    prompts: "Prompt Library",
    logs: "Generation Logs",
    policies: "Usage Policies",
    risk: "Risk Assessment",
    reports: "Reports",
  },
  "compliance-audit": {
    dashboard: "Compliance Dashboard",
    policies: "Policy Manager",
    violations: "Violations",
    "audit-trail": "Audit Trail",
    reports: "Export Reports",
    certificates: "Certificates",
  },
  "workflow-delivery": {
    queue: "Approval Queue",
    workflows: "Workflows",
    assignments: "Assignments",
    delivery: "Delivery Portal",
    integrations: "Integrations",
    templates: "Templates",
  },
}

export function ContentArea({ sectionId, activeItem, isLoading }: ContentAreaProps) {
  const sectionName = sectionNames[sectionId]
  const itemName = itemNames[sectionId]?.[activeItem]

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-background p-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full bg-background relative overflow-hidden flex flex-col">
      {/* Content Header */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{sectionName}</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-medium">{itemName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5"
        >
          <ExternalLink className="size-3.5" />
          Pop-out
        </Button>
      </div>

      {/* Simulated App Content (iframe placeholder) */}
      <div className="flex-1 p-8">
        <div className="h-full rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-center gap-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl text-muted-foreground">
              {sectionName?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">{itemName}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              This is where the {itemName?.toLowerCase()} micro-frontend would load via iframe
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground">
              Section: {sectionId}
            </div>
            <div className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground">
              View: {activeItem}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
