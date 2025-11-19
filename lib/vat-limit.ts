/**
 * VAT Limit Calculator for Czech Non-VAT Payers
 * Tracks 12-month rolling revenue and warns when approaching 2M CZK limit
 */

import { getAllInvoices } from "./cash-flow"
import type { Invoice } from "./cash-flow"

export interface VATLimitStatus {
  totalRevenueLast12Months: number
  limitCZK: number // 2 000 000
  percentageUsed: number // 0-100
  remainingCZK: number
  projectedOverrun: boolean // zda při současném tempu překročíš
  monthsUntilLimit: number | null
}

const VAT_LIMIT_CZK = 2_000_000

/**
 * Calculate VAT limit status
 */
export function calculateVATLimit(): VATLimitStatus {
  const invoices = getAllInvoices()

  // Calculate date 12 months ago
  const now = new Date()
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(now.getMonth() - 12)

  // Filter paid income invoices from last 12 months
  const recentPaidIncome = invoices.filter((inv: Invoice) => {
    if (inv.type !== "income" || !inv.isPaid || !inv.paidDate) return false

    const paidDate = new Date(inv.paidDate)
    return paidDate >= twelveMonthsAgo && paidDate <= now
  })

  // Sum revenue
  const totalRevenue = recentPaidIncome.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0)

  // Calculate percentages
  const percentageUsed = Math.min((totalRevenue / VAT_LIMIT_CZK) * 100, 100)
  const remainingCZK = Math.max(VAT_LIMIT_CZK - totalRevenue, 0)

  // Calculate projection (last 3 months average)
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(now.getMonth() - 3)

  const last3MonthsIncome = recentPaidIncome.filter((inv: Invoice) => {
    const paidDate = new Date(inv.paidDate!)
    return paidDate >= threeMonthsAgo
  })

  const last3MonthsRevenue = last3MonthsIncome.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0)
  const monthlyAverage = last3MonthsRevenue / 3

  let monthsUntilLimit: number | null = null
  let projectedOverrun = false

  if (monthlyAverage > 0 && remainingCZK > 0) {
    monthsUntilLimit = Math.ceil(remainingCZK / monthlyAverage)
    projectedOverrun = monthsUntilLimit <= 12
  } else if (remainingCZK === 0) {
    projectedOverrun = true
    monthsUntilLimit = 0
  }

  return {
    totalRevenueLast12Months: totalRevenue,
    limitCZK: VAT_LIMIT_CZK,
    percentageUsed: Math.round(percentageUsed * 10) / 10,
    remainingCZK,
    projectedOverrun,
    monthsUntilLimit,
  }
}

/**
 * Get severity level for UI
 */
export function getVATLimitSeverity(status: VATLimitStatus): "safe" | "warning" | "danger" {
  if (status.percentageUsed >= 95) return "danger"
  if (status.percentageUsed >= 80) return "warning"
  return "safe"
}

/**
 * Get user-friendly message about VAT limit
 */
export function getVATLimitMessage(status: VATLimitStatus): string {
  const severity = getVATLimitSeverity(status)

  if (severity === "danger") {
    if (status.percentageUsed >= 100) {
      return "Překročil jsi limit pro plátce DPH! Musíš se zaregistrovat k DPH."
    }
    return `Blížíš se k limitu! Zbývá jen ${Math.round(status.remainingCZK).toLocaleString("cs-CZ")} Kč.`
  }

  if (severity === "warning") {
    const remaining = Math.round(status.remainingCZK).toLocaleString("cs-CZ")
    if (status.projectedOverrun && status.monthsUntilLimit) {
      return `Pozor: Při současném tempu překročíš limit za ${status.monthsUntilLimit} ${status.monthsUntilLimit === 1 ? "měsíc" : status.monthsUntilLimit <= 4 ? "měsíce" : "měsíců"}.`
    }
    return `Zbývá ${remaining} Kč do limitu pro plátce DPH.`
  }

  const percentage = Math.round(status.percentageUsed)
  return `Jsi na ${percentage}% limitu. Zatím v pohodě!`
}
