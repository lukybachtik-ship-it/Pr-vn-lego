/**
 * Quick Orders - Rychlé zakázky
 * Zjednodušená evidence menších zakázek bez formální smlouvy
 */

import { supabase } from "./supabase"
import { createInvoice, saveInvoice, type Invoice } from "./cash-flow"

// Stav zakázky
export type QuickOrderStatus = "pending" | "completed" | "invoiced"

// Rychlá zakázka
export interface QuickOrder {
  id: string
  // Kdo - zákazník
  clientId?: string // Odkaz na existujícího klienta
  clientName: string
  clientPhone?: string
  clientEmail?: string
  // Co - popis práce
  description: string
  // Kdy - termín realizace
  dueDate: string
  // Za kolik
  price: number
  // Stav
  status: QuickOrderStatus
  // Metadata
  createdAt: string
  completedAt?: string
  invoiceId?: string // Odkaz na vytvořenou fakturu
  // Poznámky
  notes?: string
}

// Storage key
const QUICK_ORDERS_STORAGE_KEY = "quick_orders"

/**
 * Získá všechny rychlé zakázky
 */
export function getQuickOrders(): QuickOrder[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(QUICK_ORDERS_STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Uloží zakázky do localStorage
 */
function saveQuickOrdersToStorage(orders: QuickOrder[]): void {
  localStorage.setItem(QUICK_ORDERS_STORAGE_KEY, JSON.stringify(orders))
  syncQuickOrdersToCloud(orders)
}

/**
 * Vytvoří novou rychlou zakázku
 */
export function createQuickOrder(data: Omit<QuickOrder, "id" | "status" | "createdAt">): QuickOrder {
  const order: QuickOrder = {
    ...data,
    id: `qo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  const orders = getQuickOrders()
  orders.unshift(order)
  saveQuickOrdersToStorage(orders)

  return order
}

/**
 * Aktualizuje zakázku
 */
export function updateQuickOrder(id: string, updates: Partial<QuickOrder>): QuickOrder | null {
  const orders = getQuickOrders()
  const index = orders.findIndex((o) => o.id === id)

  if (index === -1) return null

  orders[index] = { ...orders[index], ...updates }
  saveQuickOrdersToStorage(orders)

  return orders[index]
}

/**
 * Označí zakázku jako dokončenou
 */
export function completeQuickOrder(id: string): QuickOrder | null {
  return updateQuickOrder(id, {
    status: "completed",
    completedAt: new Date().toISOString(),
  })
}

/**
 * Smaže zakázku
 */
export function deleteQuickOrder(id: string): void {
  const orders = getQuickOrders()
  const filtered = orders.filter((o) => o.id !== id)
  saveQuickOrdersToStorage(filtered)
}

/**
 * Získá zakázku podle ID
 */
export function getQuickOrderById(id: string): QuickOrder | null {
  const orders = getQuickOrders()
  return orders.find((o) => o.id === id) || null
}

/**
 * Vytvoří fakturu z rychlé zakázky
 */
export function createInvoiceFromQuickOrder(order: QuickOrder): Invoice {
  // Vytvoř fakturu
  const invoice = createInvoice(
    "income",
    order.clientName,
    order.price,
    new Date().toISOString().split("T")[0], // Splatnost dnes
    order.description,
    order.clientId,
  )

  // Ulož fakturu
  saveInvoice(invoice)

  // Aktualizuj zakázku
  updateQuickOrder(order.id, {
    status: "invoiced",
    invoiceId: invoice.id,
  })

  return invoice
}

/**
 * Formátování měny
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formátování data
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Sync do cloudu
 */
async function syncQuickOrdersToCloud(orders: QuickOrder[]) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { error } = await supabase.from("quick_orders").upsert({
      user_id: user.data.user.id,
      orders: JSON.stringify(orders),
      updated_at: new Date().toISOString(),
    } as any)

    if (error) throw error
  } catch (error) {
    console.error("Quick orders cloud sync failed:", error)
  }
}

/**
 * Načte zakázky z cloudu
 */
export async function loadQuickOrdersFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { data } = await supabase
      .from("quick_orders")
      .select("*")
      .eq("user_id", user.data.user.id)
      .single()

    if (!data) return

    const ordersRaw = (data as any).orders
    let orders: QuickOrder[] = []

    if (ordersRaw) {
      try {
        orders = typeof ordersRaw === "string" ? JSON.parse(ordersRaw) : ordersRaw
      } catch {
        orders = []
      }
    }

    localStorage.setItem(QUICK_ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error("Quick orders cloud load failed:", error)
  }
}

/**
 * Statistiky zakázek
 */
export function getQuickOrderStats() {
  const orders = getQuickOrders()
  const now = new Date()

  const pending = orders.filter((o) => o.status === "pending")
  const completed = orders.filter((o) => o.status === "completed")
  const invoiced = orders.filter((o) => o.status === "invoiced")

  const overdue = pending.filter((o) => new Date(o.dueDate) < now)
  const upcoming = pending.filter((o) => {
    const due = new Date(o.dueDate)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 7
  })

  const totalPending = pending.reduce((sum, o) => sum + o.price, 0)
  const totalCompleted = completed.reduce((sum, o) => sum + o.price, 0)
  const totalInvoiced = invoiced.reduce((sum, o) => sum + o.price, 0)

  return {
    counts: {
      total: orders.length,
      pending: pending.length,
      completed: completed.length,
      invoiced: invoiced.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
    },
    totals: {
      pending: totalPending,
      completed: totalCompleted,
      invoiced: totalInvoiced,
    },
  }
}

/**
 * Generuje ICS soubor pro kalendář
 */
export function generateICS(order: QuickOrder): string {
  const dueDate = new Date(order.dueDate)
  const dateStr = dueDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pravni LEGO//Quick Order//CS
BEGIN:VEVENT
UID:${order.id}@pravnilego.cz
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART;VALUE=DATE:${order.dueDate.replace(/-/g, "")}
SUMMARY:${order.description} - ${order.clientName}
DESCRIPTION:Zakázka: ${order.description}\\nKlient: ${order.clientName}\\nCena: ${formatCurrency(order.price)}
END:VEVENT
END:VCALENDAR`
}

/**
 * Stáhne ICS soubor
 */
export function downloadICS(order: QuickOrder): void {
  const ics = generateICS(order)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `zakazka-${order.id}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
