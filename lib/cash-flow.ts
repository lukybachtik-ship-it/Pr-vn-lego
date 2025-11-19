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
