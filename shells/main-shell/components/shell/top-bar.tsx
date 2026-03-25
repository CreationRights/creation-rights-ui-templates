"use client"

import { Bell, Search, Command, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

interface TopBarProps {
  onNotificationsClick: () => void
  hasUnreadNotifications: boolean
}

export function TopBar({ onNotificationsClick, hasUnreadNotifications }: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-14 w-full px-4 flex justify-between items-center border-b border-border bg-background">
      {/* Left Group */}
      <div className="flex items-center gap-4">
        {/* Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 text-background"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Creation Rights
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-border" />

        {/* Tenant Badge */}
        <span className="bg-muted border border-border text-muted-foreground text-xs py-0.5 px-2 rounded-md">
          Org: Acme Creative
        </span>
      </div>

      {/* Center Group - Global Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search assets, rights, or models..."
            className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs">
            <Command className="size-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
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

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2 rounded-md hover:bg-muted transition-colors"
        >
          <Bell className="size-4 text-muted-foreground" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none ml-2">
              <Avatar className="size-8 cursor-pointer">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  PM
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">Sarah Mitchell</span>
                <span className="text-xs text-muted-foreground font-normal">
                  sarah@acmecreative.com
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Team Management</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
