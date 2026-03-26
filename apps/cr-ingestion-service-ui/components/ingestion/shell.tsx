"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Inbox,
  Plus,
  Shield,
  Copy,
  Clock,
  Sun,
  Moon,
  Bell,
  ChevronLeft,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { MOCK_INGESTIONS, MOCK_QUARANTINE } from "@/lib/mock-data"
import { useRole } from "./role-context"

const ACTIVE_STATUSES = ["pending", "validating", "accepted", "retrying", "deduplicating", "finalizing"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const standalone = searchParams.get("standalone") === "true"
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { role, setRole } = useRole()

  useEffect(() => { setMounted(true) }, [])

  const activeCount = MOCK_INGESTIONS.filter(i => ACTIVE_STATUSES.includes(i.status)).length
  const quarantineActiveCount = MOCK_QUARANTINE.filter(q => q.status === "active").length

  const navItems = [
    {
      label: "Queue",
      href: "/",
      icon: Inbox,
      badge: activeCount > 0 ? String(activeCount) : null,
      redDot: false,
      roles: ["admin", "editor", "viewer"],
    },
    {
      label: "New Ingestion",
      href: "/new",
      icon: Plus,
      badge: null,
      redDot: false,
      roles: ["admin", "editor"],
    },
    {
      label: "Quarantine",
      href: "/quarantine",
      icon: Shield,
      badge: null,
      redDot: quarantineActiveCount > 0,
      roles: ["admin", "editor", "viewer"],
    },
    {
      label: "Duplicates",
      href: "/duplicates",
      icon: Copy,
      badge: null,
      redDot: false,
      roles: ["admin", "editor", "viewer"],
    },
    {
      label: "Activity Log",
      href: "/activity",
      icon: Clock,
      badge: null,
      redDot: false,
      roles: ["admin", "editor", "viewer"],
    },
  ]

  const visibleNav = navItems.filter(item => (item.roles as string[]).includes(role))

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 w-full px-4 flex justify-between items-center border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          {standalone && (
            <Link
              href="#"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <ChevronLeft className="size-4" />
              Return to Creation Rights
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-foreground flex items-center justify-center">
              <Inbox className="size-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold text-foreground">Ingestion</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="size-4 text-muted-foreground" />
              ) : (
                <Moon className="size-4 text-muted-foreground" />
              )
            ) : (
              <div className="size-4" />
            )}
          </button>

          <button className="relative p-2 rounded-md hover:bg-muted transition-colors" aria-label="Notifications">
            <Bell className="size-4 text-muted-foreground" />
            {quarantineActiveCount > 0 && (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none" aria-label="User menu">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">SC</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sarah Chen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* L2 Sidebar */}
        <aside className="w-56 h-full flex flex-col border-r border-border bg-sidebar shrink-0">
          <nav className="flex-1 py-2 overflow-y-auto">
            {visibleNav.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 h-9 mx-2 rounded-md text-[13px] transition-colors border-l-2",
                    active
                      ? "border-foreground bg-muted text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-foreground text-background rounded-full px-1.5 py-0.5 leading-none font-medium">
                      {item.badge}
                    </span>
                  )}
                  {item.redDot && !item.badge && (
                    <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Role Selector Footer */}
          <div className="border-t border-border p-3">
            <p className="text-xs text-muted-foreground mb-2 px-1">Role</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 h-8 rounded-md border border-border bg-background text-sm hover:bg-muted transition-colors">
                  <span className="capitalize">{role}</span>
                  <svg className="size-3 text-muted-foreground" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Switch role (demo)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["admin", "editor", "viewer"] as const).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn("capitalize", role === r && "font-medium")}
                  >
                    {r}
                    {role === r && <span className="ml-auto text-foreground">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 h-full bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
