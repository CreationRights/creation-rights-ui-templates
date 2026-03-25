'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Command, Moon, Search, Shield, Sun } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const notifications = [
  {
    id: '1',
    title: 'Rights engine timeout spikes',
    description: 'INC-041 is being investigated.',
    time: '14m ago',
    type: 'critical' as const,
    read: false,
  },
  {
    id: '2',
    title: 'Adobe Connector latency elevated',
    description: 'Latency is 3x above baseline.',
    time: '1h ago',
    type: 'warning' as const,
    read: false,
  },
  {
    id: '3',
    title: 'Webhook retry queue backlog',
    description: 'Queue depth at 1,240 items.',
    time: '3h ago',
    type: 'warning' as const,
    read: false,
  },
  {
    id: '4',
    title: 'Incident INC-037 resolved',
    description: 'Notification delivery restored.',
    time: '1d ago',
    type: 'resolved' as const,
    read: true,
  },
]

function NotificationIcon({ type }: { type: 'critical' | 'warning' | 'resolved' }) {
  if (type === 'critical')
    return <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
  if (type === 'warning')
    return <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
  return <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
}

export function AdminTopBar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="h-14 w-full px-4 flex items-center justify-between border-b border-border bg-background shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="size-7 rounded-md bg-foreground flex items-center justify-center shrink-0">
          <Shield className="size-4 text-background" />
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          Creation Rights Admin
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants, incidents, integrations..."
            className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs pointer-events-none">
            <Command className="size-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === 'dark' ? (
              <Sun className="size-4 text-muted-foreground" />
            ) : (
              <Moon className="size-4 text-muted-foreground" />
            )
          ) : (
            <div className="size-4" />
          )}
        </button>

        {/* Notification bell dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-2 rounded-md hover:bg-muted transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="size-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n, i) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors',
                    i !== notifications.length - 1 && 'border-b border-border',
                    !n.read && 'bg-muted/30'
                  )}
                >
                  <NotificationIcon type={n.type} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{n.title}</span>
                      {!n.read && <span className="size-1.5 rounded-full bg-foreground shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground leading-snug">{n.description}</span>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none ml-1">
              <Avatar className="size-8">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                  AD
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">Platform Admin</span>
                <span className="text-xs text-muted-foreground">admin@creationrights.io</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuItem>Audit Log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
