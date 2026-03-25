"use client"

import { cn } from "@/lib/utils"

interface AppNavItem {
  id: string
  label: string
}

interface AppSidebarConfig {
  title: string
  items: AppNavItem[]
}

const appSidebarConfigs: Record<string, AppSidebarConfig> = {
  "asset-studio": {
    title: "Asset Studio",
    items: [
      { id: "library", label: "Asset Library" },
      { id: "upload", label: "Upload Center" },
      { id: "projects", label: "Projects" },
      { id: "collections", label: "Collections" },
      { id: "tags", label: "Tags & Metadata" },
      { id: "search", label: "Advanced Search" },
    ],
  },
  "rights-licensing": {
    title: "Rights Registry",
    items: [
      { id: "rights-list", label: "Rights List" },
      { id: "ownership", label: "Ownership" },
      { id: "transfers", label: "Transfers" },
      { id: "conflicts", label: "Conflicts" },
      { id: "assertions", label: "Assertions" },
      { id: "search", label: "Search" },
    ],
  },
  "ai-governance": {
    title: "AI Governance",
    items: [
      { id: "models", label: "Approved Models" },
      { id: "prompts", label: "Prompt Library" },
      { id: "logs", label: "Generation Logs" },
      { id: "policies", label: "Usage Policies" },
      { id: "risk", label: "Risk Assessment" },
      { id: "reports", label: "Reports" },
    ],
  },
  "compliance-audit": {
    title: "Compliance & Audit",
    items: [
      { id: "dashboard", label: "Compliance Dashboard" },
      { id: "policies", label: "Policy Manager" },
      { id: "violations", label: "Violations" },
      { id: "audit-trail", label: "Audit Trail" },
      { id: "reports", label: "Export Reports" },
      { id: "certificates", label: "Certificates" },
    ],
  },
  "workflow-delivery": {
    title: "Workflow & Delivery",
    items: [
      { id: "queue", label: "Approval Queue" },
      { id: "workflows", label: "Workflows" },
      { id: "assignments", label: "Assignments" },
      { id: "delivery", label: "Delivery Portal" },
      { id: "integrations", label: "Integrations" },
      { id: "templates", label: "Templates" },
    ],
  },
}

interface AppSidebarProps {
  sectionId: string
  activeItem: string
  onItemClick: (itemId: string) => void
}

export function AppSidebar({ sectionId, activeItem, onItemClick }: AppSidebarProps) {
  const config = appSidebarConfigs[sectionId]

  if (!config) return null

  return (
    <aside className="w-56 h-full border-r border-border bg-sidebar">
      {/* Header */}
      <div className="h-14 px-4 flex items-center border-b border-border">
        <h2 className="font-medium text-sm text-foreground">{config.title}</h2>
      </div>

      {/* Navigation Links */}
      <nav className="py-2">
        {config.items.map((item) => {
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                "w-full h-8 px-4 flex items-center text-[13px] transition-colors",
                isActive
                  ? "border-l-2 border-foreground bg-muted text-foreground"
                  : "border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
