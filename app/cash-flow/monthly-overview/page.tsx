"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
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
      <>
        <AppHeader title="Měsíční přehled" />
        <main className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center">
            <p className="text-muted-foreground">Načítám...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Měsíční přehled" />
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Měsíční přehled</h1>
                  <p className="text-muted-foreground">Přehled příjmů a výdajů po měsících</p>
                </div>
              </div>

              {/* Year Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentYear((y) => y - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold px-4">{currentYear}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentYear((y) => y + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Year Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Celkové příjmy {currentYear}</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(yearTotals.income)}</p>
                    {yearTotals.unpaidIncome > 0 && (
                      <p className="text-xs text-green-600">Nezaplaceno: {formatCurrency(yearTotals.unpaidIncome)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Celkové výdaje {currentYear}</p>
                    <p className="text-2xl font-bold text-red-700">{formatCurrency(yearTotals.expenses)}</p>
                    {yearTotals.unpaidExpenses > 0 && (
                      <p className="text-xs text-red-600">Nezaplaceno: {formatCurrency(yearTotals.unpaidExpenses)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-${yearTotals.net >= 0 ? "blue" : "orange"}-200 bg-${yearTotals.net >= 0 ? "blue" : "orange"}-50/50`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${yearTotals.net >= 0 ? "bg-blue-100" : "bg-orange-100"}`}>
                    <Wallet className={`w-5 h-5 ${yearTotals.net >= 0 ? "text-blue-700" : "text-orange-700"}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${yearTotals.net >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                      Čistý zisk {currentYear}
                    </p>
                    <p className={`text-2xl font-bold ${yearTotals.net >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                      {formatCurrency(yearTotals.net)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-700">Faktur celkem</p>
                    <p className="text-2xl font-bold text-amber-700">{yearTotals.invoiceCount}</p>
                    <p className="text-xs text-amber-600">
                      Nezaplaceno: {yearTotals.unpaidCount}
                      {yearTotals.overdueCount > 0 && (
                        <span className="text-red-600"> ({yearTotals.overdueCount} po splatnosti)</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Graf příjmů a výdajů {currentYear}</CardTitle>
              <CardDescription>Vizuální přehled cash-flow po měsících</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
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
                        isCurrentMonth ? "bg-primary/5 rounded-t-lg -mx-0.5 px-0.5" : ""
                      }`}
                    >
                      <div className="flex gap-0.5 items-end h-36">
                        {/* Income bar */}
                        <div
                          className="w-3 bg-green-500 rounded-t transition-all hover:bg-green-600"
                          style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                          title={`Příjmy: ${formatCurrency(month.income)}`}
                        />
                        {/* Expense bar */}
                        <div
                          className="w-3 bg-red-500 rounded-t transition-all hover:bg-red-600"
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
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Příjmy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Výdaje</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyData.map((month) => {
              const isCurrentMonth =
                new Date().getFullYear() === currentYear &&
                new Date().getMonth() === MONTH_NAMES.indexOf(month.label)
              const hasData = month.invoiceCount > 0

              return (
                <Card
                  key={month.month}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isCurrentMonth ? "border-primary border-2" : ""
                  } ${!hasData ? "opacity-60" : ""}`}
                  onClick={() => router.push(`/cash-flow?month=${month.month}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {month.label}
                        {isCurrentMonth && (
                          <Badge variant="default" className="text-[10px]">Aktuální</Badge>
                        )}
                      </CardTitle>
                      {hasData && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    {hasData && (
                      <CardDescription>
                        {month.invoiceCount} {month.invoiceCount === 1 ? "faktura" : month.invoiceCount < 5 ? "faktury" : "faktur"}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {hasData ? (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Příjmy</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(month.income)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Výdaje</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(month.expenses)}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Čistý zisk:</span>
                            <span className={`font-bold ${month.net >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                              {formatCurrency(month.net)}
                            </span>
                          </div>
                        </div>
                        {/* Status indicators */}
                        <div className="flex gap-2 mt-3">
                          {month.paidCount > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {month.paidCount} zaplaceno
                            </Badge>
                          )}
                          {month.unpaidCount > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="w-3 h-3 mr-1" />
                              {month.unpaidCount} čeká
                            </Badge>
                          )}
                          {month.overdueCount > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {month.overdueCount} po splatnosti
                            </Badge>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Žádné faktury
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
