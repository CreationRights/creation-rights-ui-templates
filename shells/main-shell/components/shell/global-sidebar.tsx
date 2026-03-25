"use client"

import {
  Layers,
  Shield,
  Cpu,
  ClipboardCheck,
  GitBranch,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface NavSection {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export const navSections: NavSection[] = [
  { id: "asset-studio", label: "Asset Studio", icon: <Layers className="size-4" /> },
  { id: "rights-licensing", label: "Rights & Licensing", icon: <Shield className="size-4" /> },
  { id: "ai-governance", label: "AI Governance", icon: <Cpu className="size-4" /> },
  { id: "compliance-audit", label: "Compliance & Audit", icon: <ClipboardCheck className="size-4" /> },
  { id: "workflow-delivery", label: "Workflow & Delivery", icon: <GitBranch className="size-4" />, badge: 3 },
]

interface GlobalSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  activeSection: string | null
  onSectionClick: (sectionId: string) => void
}

export function GlobalSidebar({
  isCollapsed,
  onToggleCollapse,
  activeSection,
  onSectionClick,
}: GlobalSidebarProps) {
  return (
    <aside
      className={cn(
        "h-full flex flex-col border-r border-border bg-sidebar transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Navigation Items */}
      <nav className="flex-1 py-2">
        {navSections.map((section) => {
          const isActive = activeSection === section.id
          
          if (isCollapsed) {
            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSectionClick(section.id)}
                    className={cn(
                      "w-full h-9 flex items-center justify-center mx-auto my-1 rounded-md transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="relative">
                      {section.icon}
                      {section.badge && (
                        <span className="absolute -top-1 -right-1 size-3 text-[8px] bg-muted-foreground/20 rounded-full flex items-center justify-center text-muted-foreground">
                          {section.badge}
                        </span>
                      )}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {section.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "w-[calc(100%-1rem)] h-9 px-3 flex items-center gap-3 rounded-md text-sm transition-colors mx-2 mt-1",
                isActive
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {section.icon}
              <span className="flex-1 text-left">{section.label}</span>
              {section.badge && (
                <span className="text-[10px] bg-muted-foreground/20 px-1.5 rounded-full text-muted-foreground">
                  {section.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border py-2">
        {isCollapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-full h-9 flex items-center justify-center mx-auto my-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Settings className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Settings
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleCollapse}
                  className="w-full h-9 flex items-center justify-center mx-auto my-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <PanelLeft className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Expand Sidebar
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <button className="w-[calc(100%-1rem)] h-9 px-3 flex items-center gap-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mx-2 mt-1">
              <Settings className="size-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={onToggleCollapse}
              className="w-[calc(100%-1rem)] h-9 px-3 flex items-center gap-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mx-2 mt-1"
            >
              <PanelLeftClose className="size-4" />
              <span>Collapse</span>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
