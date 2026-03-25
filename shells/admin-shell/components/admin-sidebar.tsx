'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Activity,
  Building,
  ChevronRight,
  Database,
  PanelLeft,
  PanelLeftClose,
  Plug,
  Settings,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavSection {
  id: string
  label: string
  icon: React.ElementType
  items: { label: string; id: string }[]
}

const navSections: NavSection[] = [
  {
    id: 'organization',
    label: 'Organization',
    icon: Building,
    items: [
      { label: 'Tenant & Org', id: 'tenant-org' },
      { label: 'Entitlements', id: 'entitlements' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    items: [
      { label: 'Webhooks', id: 'webhooks' },
      { label: 'Cloud Storage', id: 'cloud-storage' },
      { label: 'Notifications', id: 'notifications' },
      { label: 'Feature Flags', id: 'feature-flags' },
      { label: 'Adobe Connector', id: 'adobe-connector' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Activity,
    items: [
      { label: 'Incident Watch', id: 'incident-watch' },
      { label: 'Omniplex', id: 'omniplex' },
    ],
  },
  {
    id: 'data-governance',
    label: 'Data Governance',
    icon: Database,
    items: [
      { label: 'Retention & Archive', id: 'retention-archive' },
      { label: 'Secrets', id: 'secrets' },
    ],
  },
]

interface AdminSidebarProps {
  activeSection: string | null
  activeItem: string | null
  onSectionClick: (sectionId: string) => void
  onItemClick: (itemId: string) => void
}

export function AdminSidebar({
  activeSection,
  activeItem,
  onSectionClick,
  onItemClick,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const currentSection = navSections.find((s) => s.id === activeSection)

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full">
        {/* L1 Sidebar */}
        <aside
          className={cn(
            'h-full flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0',
            isCollapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Nav sections */}
          <nav className="flex-1 py-3 overflow-y-auto">
            <div className="flex flex-col gap-0.5 px-2">
              {navSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                if (isCollapsed) {
                  return (
                    <Tooltip key={section.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSectionClick(section.id)}
                          className={cn(
                            'h-9 w-full flex items-center justify-center rounded-md transition-colors',
                            isActive
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{section.label}</TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionClick(section.id)}
                    className={cn(
                      'h-9 w-full flex items-center justify-between px-3 rounded-md transition-colors text-sm',
                      isActive
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 shrink-0" />
                      <span>{section.label}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'size-3.5 transition-transform text-muted-foreground',
                        isActive && 'rotate-90'
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Bottom: Settings + Collapse */}
          <div className="border-t border-border py-2 px-2 flex flex-col gap-0.5">
            {isCollapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="h-9 w-full flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      <Settings className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsCollapsed(false)}
                      className="h-9 w-full flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      aria-label="Expand sidebar"
                    >
                      <PanelLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expand</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <button className="h-9 w-full flex items-center gap-2.5 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                  <Settings className="size-4 shrink-0" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="h-9 w-full flex items-center gap-2.5 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="size-4 shrink-0" />
                  <span>Collapse</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* L2 Sidebar */}
        {activeSection && currentSection && (
          <aside className="w-56 h-full border-r border-border bg-sidebar shrink-0 flex flex-col">
            {/* Section header */}
            <div className="h-10 px-4 flex items-center border-b border-border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {currentSection.label}
              </span>
            </div>

            {/* L2 nav items */}
            <nav className="flex-1 py-2 overflow-y-auto">
              <div className="flex flex-col">
                {currentSection.items.map((item) => {
                  const isItemActive = activeItem === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => onItemClick(item.id)}
                      className={cn(
                        'h-9 w-full flex items-center px-4 text-[13px] border-l-2 transition-colors',
                        isItemActive
                          ? 'border-foreground bg-muted text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </nav>
          </aside>
        )}
      </div>
    </TooltipProvider>
  )
}
