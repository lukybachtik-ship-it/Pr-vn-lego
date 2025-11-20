import { supabase } from "./supabase"

export interface Invoice {
  id: string
  type: "income" | "expense"
  from: string // Kdo platí / Komu platím
  clientId?: string // ID klienta z databáze klientů
  amount: number
  dueDate: string
  isPaid: boolean
  paidDate?: string
  description?: string
  createdAt: string
  // QR payment data
  invoiceNumber?: string // číslo faktury
  variableSymbol?: string // variabilní symbol
  bankAccountId?: string // ID bankovního účtu pro platbu
}

export interface CashFlowSummary {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  overdueIncome: number
  overdueExpenses: number
  upcomingIncome: number // Next 30 days
  upcomingExpenses: number // Next 30 days
}

export interface MonthlyStats {
  month: string // YYYY-MM
  income: number
  expenses: number
  net: number
}

/**
 * Sync invoice to cloud
 */
async function syncInvoiceToCloud(invoice: Invoice) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { error } = await supabase.from("invoices").upsert({
      id: invoice.id,
      user_id: user.data.user.id,
      type: invoice.type,
      from_name: invoice.from,
      client_id: invoice.clientId || null,
      amount: invoice.amount,
      due_date: invoice.dueDate,
      is_paid: invoice.isPaid,
      paid_date: invoice.paidDate || null,
      description: invoice.description || null,
      invoice_number: invoice.invoiceNumber || null,
      variable_symbol: invoice.variableSymbol || null,
      bank_account_id: invoice.bankAccountId || null,
      created_at: invoice.createdAt,
    } as any)
    if (error) throw error
  } catch (error) {
    console.error("Invoice cloud sync failed:", error)
  }
}

/**
 * Load invoices from cloud
 */
async function loadInvoicesFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { data } = await supabase.from("invoices").select("*").eq("user_id", user.data.user.id)

    if (!data || data.length === 0) return

    const localStr = localStorage.getItem("invoices")
    const local: Record<string, Invoice> = localStr ? JSON.parse(localStr) : {}

    data.forEach((inv: any) => {
      local[inv.id] = {
        id: inv.id,
        type: inv.type,
        from: inv.from_name,
        clientId: inv.client_id || undefined,
        amount: inv.amount,
        dueDate: inv.due_date,
        isPaid: inv.is_paid,
        paidDate: inv.paid_date || undefined,
        description: inv.description || undefined,
        invoiceNumber: inv.invoice_number || undefined,
        variableSymbol: inv.variable_symbol || undefined,
        bankAccountId: inv.bank_account_id || undefined,
        createdAt: inv.created_at,
      }
    })

    localStorage.setItem("invoices", JSON.stringify(local))
  } catch (error) {
    console.error("Invoices cloud load failed:", error)
  }
}

// Auto-load on module import
if (typeof window !== "undefined") {
  loadInvoicesFromCloud()
}

/**
 * Create new invoice
 */
export function createInvoice(
  type: "income" | "expense",
  from: string,
  amount: number,
  dueDate: string,
  description?: string,
  clientId?: string,
): Invoice {
  const invoice: Invoice = {
    id: `invoice-${Date.now()}`,
    type,
    from,
    clientId,
    amount,
    dueDate,
    isPaid: false,
    description,
    createdAt: new Date().toISOString(),
  }

  return invoice
}

/**
 * Save invoice to localStorage
 */
export function saveInvoice(invoice: Invoice): void {
  if (typeof window === "undefined") return

  const invoicesJson = localStorage.getItem("invoices")
  const invoices = invoicesJson ? JSON.parse(invoicesJson) : {}

  invoices[invoice.id] = invoice
  localStorage.setItem("invoices", JSON.stringify(invoices))

  // Sync to cloud
  syncInvoiceToCloud(invoice)
}

/**
 * Get all invoices
 */
export function getAllInvoices(): Invoice[] {
  if (typeof window === "undefined") return []

  const invoicesJson = localStorage.getItem("invoices")
  if (!invoicesJson) return []

  const invoices = JSON.parse(invoicesJson)
  return Object.values(invoices) as Invoice[]
}

/**
 * Mark invoice as paid
 */
export function markInvoiceAsPaid(invoiceId: string): void {
  if (typeof window === "undefined") return

  const invoicesJson = localStorage.getItem("invoices")
  if (!invoicesJson) return

  const invoices = JSON.parse(invoicesJson)
  if (invoices[invoiceId]) {
    invoices[invoiceId].isPaid = true
    invoices[invoiceId].paidDate = new Date().toISOString()
    localStorage.setItem("invoices", JSON.stringify(invoices))

    // Sync to cloud
    syncInvoiceToCloud(invoices[invoiceId])
  }
}

/**
 * Delete invoice
 */
export function deleteInvoice(invoiceId: string): void {
  if (typeof window === "undefined") return

  const invoicesJson = localStorage.getItem("invoices")
  if (!invoicesJson) return

  const invoices = JSON.parse(invoicesJson)
  delete invoices[invoiceId]
  localStorage.setItem("invoices", JSON.stringify(invoices))

  // Delete from cloud
  supabase.from("invoices").delete().eq("id", invoiceId).then()
}

/**
 * Calculate cash flow summary
 */
export function calculateCashFlowSummary(invoices: Invoice[]): CashFlowSummary {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const unpaidInvoices = invoices.filter((inv) => !inv.isPaid)

  const summary: CashFlowSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    overdueIncome: 0,
    overdueExpenses: 0,
    upcomingIncome: 0,
    upcomingExpenses: 0,
  }

  unpaidInvoices.forEach((inv) => {
    const dueDate = new Date(inv.dueDate)
    const isOverdue = dueDate < now
    const isUpcoming = dueDate >= now && dueDate <= thirtyDaysFromNow

    if (inv.type === "income") {
      summary.totalIncome += inv.amount
      if (isOverdue) summary.overdueIncome += inv.amount
      if (isUpcoming) summary.upcomingIncome += inv.amount
    } else {
      summary.totalExpenses += inv.amount
      if (isOverdue) summary.overdueExpenses += inv.amount
      if (isUpcoming) summary.upcomingExpenses += inv.amount
    }
  })

  summary.netCashFlow = summary.totalIncome - summary.totalExpenses

  return summary
}

/**
 * Get monthly statistics
 */
export function getMonthlyStats(invoices: Invoice[]): MonthlyStats[] {
  const monthsMap = new Map<string, MonthlyStats>()

  invoices.forEach((inv) => {
    const date = new Date(inv.isPaid ? inv.paidDate! : inv.dueDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        month: monthKey,
        income: 0,
        expenses: 0,
        net: 0,
      })
    }

    const stats = monthsMap.get(monthKey)!

    if (inv.type === "income") {
      stats.income += inv.amount
    } else {
      stats.expenses += inv.amount
    }
    stats.net = stats.income - stats.expenses
  })

  return Array.from(monthsMap.values()).sort((a, b) => b.month.localeCompare(a.month))
}

/**
 * Get invoices for current month
 */
export function getCurrentMonthInvoices(invoices: Invoice[]): Invoice[] {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  return invoices.filter((inv) => {
    const date = new Date(inv.dueDate)
    const invoiceMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    return invoiceMonth === currentMonth
  })
}

/**
 * Format currency
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
 * Get invoices for a specific client
 */
export function getInvoicesByClient(clientId: string): Invoice[] {
  if (typeof window === "undefined") return []

  const invoicesJson = localStorage.getItem("invoices")
  if (!invoicesJson) return []

  const invoices = JSON.parse(invoicesJson)
  return (Object.values(invoices) as Invoice[]).filter((inv) => inv.clientId === clientId)
}
