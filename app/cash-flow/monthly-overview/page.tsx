"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import {
  getAllInvoices,
  formatCurrency,
  type Invoice,
} from "@/lib/cash-flow"

// Skeleton component
function SkeletonMonthlyOverview() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-md">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <div className="p-4 bg-card border border-border rounded-md mb-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-md stagger-item">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

const MONTH_NAMES = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
]

interface MonthData {
  month: string // YYYY-MM
  label: string
  income: number
  expenses: number
  net: number
  invoiceCount: number
  unpaidCount: number
  overdueCount: number
  paidCount: number
}

export default function MonthlyOverviewPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const allInvoices = getAllInvoices()
    setInvoices(allInvoices)
    setIsLoading(false)
  }, [])

  // Calculate monthly data for the current year
  const monthlyData = useMemo((): MonthData[] => {
    const data: MonthData[] = []

    for (let month = 0; month < 12; month++) {
      const monthStr = `${currentYear}-${String(month + 1).padStart(2, "0")}`

      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.dueDate)
        return invDate.getFullYear() === currentYear && invDate.getMonth() === month
      })

      const income = monthInvoices
        .filter((inv) => inv.type === "income")
        .reduce((sum, inv) => sum + inv.amount, 0)

      const expenses = monthInvoices
        .filter((inv) => inv.type === "expense")
        .reduce((sum, inv) => sum + inv.amount, 0)

      const unpaidCount = monthInvoices.filter((inv) => !inv.isPaid).length
      const paidCount = monthInvoices.filter((inv) => inv.isPaid).length
      const overdueCount = monthInvoices.filter((inv) => !inv.isPaid && new Date(inv.dueDate) < new Date()).length

      data.push({
        month: monthStr,
        label: MONTH_NAMES[month],
        income,
        expenses,
        net: income - expenses,
        invoiceCount: monthInvoices.length,
        unpaidCount,
        overdueCount,
        paidCount,
      })
    }

    return data
  }, [invoices, currentYear])

  // Year totals
  const yearTotals = useMemo(() => {
    const yearInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.dueDate)
      return invDate.getFullYear() === currentYear
    })

    const income = yearInvoices
      .filter((inv) => inv.type === "income")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const expenses = yearInvoices
      .filter((inv) => inv.type === "expense")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const unpaidIncome = yearInvoices
      .filter((inv) => inv.type === "income" && !inv.isPaid)
      .reduce((sum, inv) => sum + inv.amount, 0)

    const unpaidExpenses = yearInvoices
      .filter((inv) => inv.type === "expense" && !inv.isPaid)
      .reduce((sum, inv) => sum + inv.amount, 0)

    return {
      income,
      expenses,
      net: income - expenses,
      unpaidIncome,
      unpaidExpenses,
      invoiceCount: yearInvoices.length,
      unpaidCount: yearInvoices.filter((inv) => !inv.isPaid).length,
      overdueCount: yearInvoices.filter((inv) => !inv.isPaid && new Date(inv.dueDate) < new Date()).length,
    }
  }, [invoices, currentYear])

  // Find max value for chart scaling
  const maxValue = useMemo(() => {
    return Math.max(...monthlyData.map((d) => Math.max(d.income, d.expenses)), 1)
  }, [monthlyData])

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonMonthlyOverview />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Měsíční přehled
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Přehled příjmů a výdajů po měsících</p>
            </div>

            {/* Year Navigation */}
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon-sm" onClick={() => setCurrentYear((y) => y - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold px-3">{currentYear}</span>
              <Button variant="outline" size="icon-sm" onClick={() => setCurrentYear((y) => y + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

          {/* Year Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <div className="p-4 bg-success/5 border border-success/20 rounded-md stagger-item" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-md">
                  <TrendingUp className="w-4 h-4 text-success" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs text-success">Celkové příjmy {currentYear}</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(yearTotals.income)}</p>
                  {yearTotals.unpaidIncome > 0 && (
                    <p className="text-[10px] text-success/80">Nezaplaceno: {formatCurrency(yearTotals.unpaidIncome)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-md stagger-item" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-md">
                  <TrendingDown className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs text-destructive">Celkové výdaje {currentYear}</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(yearTotals.expenses)}</p>
                  {yearTotals.unpaidExpenses > 0 && (
                    <p className="text-[10px] text-destructive/80">Nezaplaceno: {formatCurrency(yearTotals.unpaidExpenses)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-md stagger-item ${yearTotals.net >= 0 ? "bg-primary/5 border border-primary/20" : "bg-warning/5 border border-warning/20"}`} style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${yearTotals.net >= 0 ? "bg-primary/10" : "bg-warning/10"}`}>
                  <Wallet className={`w-4 h-4 ${yearTotals.net >= 0 ? "text-primary" : "text-warning"}`} strokeWidth={1.75} />
                </div>
                <div>
                  <p className={`text-xs ${yearTotals.net >= 0 ? "text-primary" : "text-warning"}`}>
                    Čistý zisk {currentYear}
                  </p>
                  <p className={`text-lg font-bold ${yearTotals.net >= 0 ? "text-primary" : "text-warning"}`}>
                    {formatCurrency(yearTotals.net)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-warning/5 border border-warning/20 rounded-md stagger-item" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-md">
                  <Clock className="w-4 h-4 text-warning" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs text-warning">Faktur celkem</p>
                  <p className="text-lg font-bold text-warning">{yearTotals.invoiceCount}</p>
                  <p className="text-[10px] text-warning/80">
                    Nezaplaceno: {yearTotals.unpaidCount}
                    {yearTotals.overdueCount > 0 && (
                      <span className="text-destructive"> ({yearTotals.overdueCount} po splatnosti)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="p-4 bg-card border border-border rounded-md mb-6 stagger-item" style={{ animationDelay: "200ms" }}>
            <div className="mb-4">
              <h3 className="text-sm font-medium">Graf příjmů a výdajů {currentYear}</h3>
              <p className="text-xs text-muted-foreground">Vizuální přehled cash-flow po měsících</p>
            </div>
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map((month) => {
                const incomeHeight = (month.income / maxValue) * 100
                const expenseHeight = (month.expenses / maxValue) * 100
                const isCurrentMonth =
                  new Date().getFullYear() === currentYear &&
                  new Date().getMonth() === MONTH_NAMES.indexOf(month.label)

                return (
                  <div
                    key={month.month}
                    className={`flex-1 flex flex-col items-center gap-1 ${
                      isCurrentMonth ? "bg-primary/5 rounded-t-md -mx-0.5 px-0.5" : ""
                    }`}
                  >
                    <div className="flex gap-0.5 items-end h-32">
                      {/* Income bar */}
                      <div
                        className="w-3 bg-success rounded-t transition-all hover:bg-success/80"
                        style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                        title={`Příjmy: ${formatCurrency(month.income)}`}
                      />
                      {/* Expense bar */}
                      <div
                        className="w-3 bg-destructive rounded-t transition-all hover:bg-destructive/80"
                        style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                        title={`Výdaje: ${formatCurrency(month.expenses)}`}
                      />
                    </div>
                    <span className={`text-[10px] ${isCurrentMonth ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {month.label.slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded" />
                <span>Příjmy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive rounded" />
                <span>Výdaje</span>
              </div>
            </div>
          </div>

          {/* Monthly Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyData.map((month, index) => {
              const isCurrentMonth =
                new Date().getFullYear() === currentYear &&
                new Date().getMonth() === MONTH_NAMES.indexOf(month.label)
              const hasData = month.invoiceCount > 0

              return (
                <div
                  key={month.month}
                  className={`p-4 bg-card border rounded-md cursor-pointer transition-all hover:shadow-md interactive-card stagger-item ${
                    isCurrentMonth ? "border-primary border-2" : "border-border"
                  } ${!hasData ? "opacity-60" : ""}`}
                  style={{ animationDelay: `${250 + index * 30}ms` }}
                  onClick={() => router.push(`/cash-flow?month=${month.month}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      {month.label}
                      {isCurrentMonth && (
                        <Badge variant="default" className="text-[10px]">Aktuální</Badge>
                      )}
                    </h3>
                    {hasData && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {hasData && (
                    <p className="text-[10px] text-muted-foreground mb-3">
                      {month.invoiceCount} {month.invoiceCount === 1 ? "faktura" : month.invoiceCount < 5 ? "faktury" : "faktur"}
                    </p>
                  )}
                  {hasData ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Příjmy</p>
                          <p className="text-sm font-bold text-success">{formatCurrency(month.income)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Výdaje</p>
                          <p className="text-sm font-bold text-destructive">{formatCurrency(month.expenses)}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Čistý zisk:</span>
                          <span className={`text-sm font-bold ${month.net >= 0 ? "text-primary" : "text-warning"}`}>
                            {formatCurrency(month.net)}
                          </span>
                        </div>
                      </div>
                      {/* Status indicators */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {month.paidCount > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {month.paidCount} zaplaceno
                          </Badge>
                        )}
                        {month.unpaidCount > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                            <Clock className="w-3 h-3 mr-1" />
                            {month.unpaidCount} čeká
                          </Badge>
                        )}
                        {month.overdueCount > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {month.overdueCount} po splatnosti
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Žádné faktury
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
    </AppLayout>
  )
}
