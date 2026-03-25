'use client'

import { useState } from 'react'
import { AdminTopBar } from '@/components/admin-top-bar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { OverviewDashboard } from '@/components/overview-dashboard'
import { SectionPage } from '@/components/section-page'

export default function AdminConsolePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)

  function handleSectionClick(sectionId: string) {
    if (activeSection === sectionId) {
      setActiveSection(null)
      setActiveItem(null)
    } else {
      setActiveSection(sectionId)
      setActiveItem(null)
    }
  }

  function handleItemClick(itemId: string) {
    setActiveItem(itemId)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <AdminTopBar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          activeSection={activeSection}
          activeItem={activeItem}
          onSectionClick={handleSectionClick}
          onItemClick={handleItemClick}
        />

        <main className="flex-1 h-full bg-background overflow-hidden">
          {activeItem ? (
            <SectionPage itemId={activeItem} />
          ) : (
            <OverviewDashboard />
          )}
        </main>
      </div>
    </div>
  )
}
