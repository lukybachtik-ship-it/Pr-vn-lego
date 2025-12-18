// Notification system for BusinessHub
export type NotificationType = "info" | "warning" | "success" | "error"
export type NotificationCategory = "contract" | "invoice" | "deadline" | "system"

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

const NOTIFICATIONS_KEY = "businesshub_notifications"

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load notifications:", error)
  }

  return []
}

export function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error("Failed to save notifications:", error)
  }
}

export function addNotification(
  notification: Omit<Notification, "id" | "timestamp" | "read">
): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  }

  const notifications = getNotifications()
  notifications.unshift(newNotification)

  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50)
  saveNotifications(trimmed)

  return newNotification
}

export function markAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  )
  saveNotifications(updated)
}

export function markAllAsRead(): void {
  const notifications = getNotifications()
  const updated = notifications.map((n) => ({ ...n, read: true }))
  saveNotifications(updated)
}

export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications()
  const filtered = notifications.filter((n) => n.id !== notificationId)
  saveNotifications(filtered)
}

export function clearAllNotifications(): void {
  saveNotifications([])
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length
}

// Generate notifications based on app state
export function generateSystemNotifications(
  contracts: Array<{ id: string; name: string; finalizedAt?: string }>,
  invoices: Array<{
    id: string
    clientName: string
    amount: number
    dueDate: string
    isPaid: boolean
    type: "income" | "expense"
  }>
): void {
  const now = new Date()
  const notifications = getNotifications()
  const existingIds = new Set(notifications.map((n) => n.id))

  // Check for overdue invoices
  invoices
    .filter((inv) => !inv.isPaid && new Date(inv.dueDate) < now)
    .forEach((inv) => {
      const id = `overdue_${inv.id}`
      if (!existingIds.has(id)) {
        const daysPastDue = Math.floor(
          (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        addNotification({
          type: "warning",
          category: "invoice",
          title: inv.type === "income" ? "Faktura po splatnosti" : "Nezaplacený výdaj",
          message: `${inv.clientName} - ${inv.amount.toLocaleString("cs-CZ")} Kč je ${daysPastDue} dní po splatnosti`,
          actionUrl: "/cash-flow",
          actionLabel: "Zobrazit faktury",
        })
      }
    })

  // Check for invoices due soon (within 3 days)
  invoices
    .filter((inv) => {
      if (inv.isPaid) return false
      const dueDate = new Date(inv.dueDate)
      const daysUntil = Math.floor(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntil >= 0 && daysUntil <= 3
    })
    .forEach((inv) => {
      const id = `due_soon_${inv.id}`
      if (!existingIds.has(id)) {
        const daysUntil = Math.floor(
          (new Date(inv.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        addNotification({
          type: "info",
          category: "invoice",
          title: "Blížící se splatnost",
          message: `${inv.clientName} - splatnost za ${daysUntil === 0 ? "dnes" : `${daysUntil} dny`}`,
          actionUrl: "/cash-flow",
          actionLabel: "Zobrazit faktury",
        })
      }
    })
}

// Format relative time
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Právě teď"
  if (minutes < 60) return `Před ${minutes} min`
  if (hours < 24) return `Před ${hours} h`
  if (days < 7) return `Před ${days} d`

  return date.toLocaleDateString("cs-CZ")
}
