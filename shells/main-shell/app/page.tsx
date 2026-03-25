"use client"

import { useState, useEffect, useCallback } from "react"
import { TopBar } from "@/components/shell/top-bar"
import { GlobalSidebar } from "@/components/shell/global-sidebar"
import { AppSidebar } from "@/components/shell/app-sidebar"
import { OverviewDashboard } from "@/components/shell/overview-dashboard"
import { NotificationsPanel } from "@/components/shell/notifications-panel"
import { ContentArea } from "@/components/shell/content-area"

const defaultAppItems: Record<string, string> = {
  "asset-studio": "library",
  "rights-licensing": "rights-list",
  "ai-governance": "models",
  "compliance-audit": "dashboard",
  "workflow-delivery": "queue",
}

export default function CreationRightsShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activeAppItem, setActiveAppItem] = useState<string>("library")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handle section switching with loading state
  const handleSectionClick = useCallback((sectionId: string) => {
    if (activeSection === sectionId) {
      // Toggle off if clicking same section
      setActiveSection(null)
    } else {
      setIsLoading(true)
      setActiveSection(sectionId)
      setActiveAppItem(defaultAppItems[sectionId] || "library")
      
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }
  }, [activeSection])

  // Handle app item switching with loading state
  const handleAppItemClick = useCallback((itemId: string) => {
    setIsLoading(true)
    setActiveAppItem(itemId)
    
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }, [])

  // Keyboard shortcut for search (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      // Escape to close notifications
      if (e.key === "Escape" && notificationsOpen) {
        setNotificationsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [notificationsOpen])

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <TopBar
        onNotificationsClick={() => setNotificationsOpen(!notificationsOpen)}
        hasUnreadNotifications={true}
      />

      {/* Main Area below Top Bar */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Global Sidebar (L1) */}
        <GlobalSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />

        {/* App Sidebar (L2) - Only shows when a section is active */}
        {activeSection && (
          <AppSidebar
            sectionId={activeSection}
            activeItem={activeAppItem}
            onItemClick={handleAppItemClick}
          />
        )}

        {/* Main Content Area */}
        {activeSection ? (
          <ContentArea
            sectionId={activeSection}
            activeItem={activeAppItem}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 overflow-hidden">
            <OverviewDashboard />
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}
