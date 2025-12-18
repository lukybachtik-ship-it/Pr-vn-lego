"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  FileText,
  Receipt,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  formatRelativeTime,
  type Notification,
  type NotificationType,
  type NotificationCategory,
} from "@/lib/notifications"

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  info: {
    icon: <Info className="w-4 h-4" />,
    color: "text-primary bg-primary/10",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-warning bg-warning/10",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-success bg-success/10",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-destructive bg-destructive/10",
  },
}

const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
  contract: <FileText className="w-4 h-4" />,
  invoice: <Receipt className="w-4 h-4" />,
  deadline: <Calendar className="w-4 h-4" />,
  system: <Info className="w-4 h-4" />,
}

export function NotificationCenter() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    // Refresh notifications every minute
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    setNotifications(getNotifications())
    setUnreadCount(getUnreadCount())
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    loadNotifications()
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    loadNotifications()
  }

  const handleClearAll = () => {
    clearAllNotifications()
    loadNotifications()
  }

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative touch-target touch-feedback"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-xl z-50 scale-in overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Notifikace</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {unreadCount} nových
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleMarkAllAsRead}
                    title="Označit vše jako přečtené"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto scroll-smooth-touch">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Žádné notifikace</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => {
                    const typeConfig = TYPE_CONFIG[notification.type]

                    return (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`p-1.5 rounded-md shrink-0 ${typeConfig.color}`}>
                            {typeConfig.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium truncate ${
                                !notification.read ? "text-foreground" : "text-foreground/80"
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeTime(notification.timestamp)}
                              </span>
                              {notification.actionLabel && (
                                <span className="text-[10px] text-primary flex items-center gap-0.5">
                                  {notification.actionLabel}
                                  <ChevronRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                title="Označit jako přečtené"
                                className="h-6 w-6"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(notification.id)
                              }}
                              title="Smazat"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Smazat všechny notifikace
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
