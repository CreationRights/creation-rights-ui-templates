"use client"

import { X, AlertCircle, CheckCircle, Info, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
  id: number
  type: "alert" | "success" | "info"
  title: string
  message: string
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "alert",
    title: "Compliance Review Required",
    message: "3 assets pending legal review before campaign launch deadline",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "License Approved",
    message: "Stock footage license for Project Alpha has been approved",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "New Team Member",
    message: "James Wilson has joined the Creative Team",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "alert",
    title: "Rights Conflict Detected",
    message: "Duplicate usage rights claim on Asset #2847",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    title: "Workflow Complete",
    message: "Q1 Campaign assets have passed all compliance checks",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 6,
    type: "info",
    title: "System Update",
    message: "New AI model (DALL-E 3) has been added to approved models",
    time: "1 day ago",
    read: true,
  },
]

const iconMap = {
  alert: AlertCircle,
  success: CheckCircle,
  info: Info,
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-14 right-0 w-96 h-[calc(100vh-3.5rem)] bg-background border-l border-border shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="px-4 h-14 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <h2 className="font-medium text-sm text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = iconMap[notification.type]
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            notification.read ? "text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="size-2 bg-red-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-sm"
          >
            Mark all as read
          </Button>
        </div>
      </div>
    </>
  )
}
