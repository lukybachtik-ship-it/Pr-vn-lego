"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContractTypeSelector } from "@/components/contract-type-selector"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { getFinalizedContracts } from "@/lib/contract-storage"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import { getAllInvoices, calculateCashFlowSummary, formatCurrency, type Invoice } from "@/lib/cash-flow"
import { useAuth } from "@/components/auth-provider"
import type { SavedContract } from "@/lib/contract-storage"
import { AppLayout } from "@/components/app-layout"
import { Sparkline } from "@/components/ui/sparkline"

// Using less common Lucide icons for unique professional look
import {
  FilePlus2,
  Receipt,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Clock3,
  CircleAlert,
  CircleCheck,
  ChevronRight,
  LayoutGrid,
  X,
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    setContracts(getFinalizedContracts())
    setInvoices(getAllInvoices())

    const handleStorageChange = () => {
      setContracts(getFinalizedContracts())
      setInvoices(getAllInvoices())
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("contractsLoaded", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("contractsLoaded", handleStorageChange)
    }
  }, [])

  const getContractTypeName = (type: string) => {
    const names: Record<string, string> = {
      "work-contract": "Smlouva o dílo",
      "rental-contract": "Nájemní smlouva",
      "purchase-contract": "Kupní smlouva",
      "trade-contract": "Obchodní podmínky",
      "other-contract": "Vlastní smlouva",
    }
    return names[type] || type
  }

  const getNextDeadline = (contract: SavedContract) => {
    const timeline = extractContractDeadlines(contract.blocks, contract.type)
    return timeline.nextDeadline
  }

  const getUpcomingStatus = (contract: SavedContract) => {
    const timeline = extractContractDeadlines(contract.blocks, contract.type)
    if (timeline.overdueCount > 0) {
      return { type: "overdue" as const, count: timeline.overdueCount }
    }
    if (timeline.upcomingCount > 0) {
      return { type: "upcoming" as const, count: timeline.upcomingCount }
    }
    return null
  }

  const handleSelectType = (type: string) => {
    setShowTypeSelector(false)
    router.push(`/builder?type=${type}`)
  }

  const summary = calculateCashFlowSummary(invoices)

  const totalIncome = invoices
    .filter((inv) => inv.type === "income")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpenses = invoices
    .filter((inv) => inv.type === "expense")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const paidIncome = invoices
    .filter((inv) => inv.type === "income" && inv.isPaid)
    .reduce((sum, inv) => sum + inv.amount, 0)

  // Generate sparkline data from invoices (last 6 months)
  const getMonthlyData = (type: "income" | "expense") => {
    const now = new Date()
    const months: number[] = []

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthTotal = invoices
        .filter((inv) => {
          const invDate = new Date(inv.dueDate)
          return inv.type === type && invDate >= monthStart && invDate <= monthEnd
        })
        .reduce((sum, inv) => sum + inv.amount, 0)

      months.push(monthTotal)
    }

    return months
  }

  const incomeSparklineData = getMonthlyData("income")
  const expenseSparklineData = getMonthlyData("expense")
  const balanceSparklineData = incomeSparklineData.map((inc, i) => inc - expenseSparklineData[i])

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Přehled
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Správa dokumentů, faktur a financí
          </p>
        </header>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Nová smlouva */}
            <button
              onClick={() => setShowTypeSelector(true)}
              className="interactive-card press-effect group flex items-center gap-4 p-4 bg-card border border-border rounded-md hover:border-primary/40 hover:bg-primary/[0.02] text-left stagger-item"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors">
                <FilePlus2 className="w-5 h-5 icon-hover-scale" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground">Nová smlouva</span>
                <span className="block text-xs text-muted-foreground">Vytvořit dokument</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Nová faktura */}
            <button
              onClick={() => router.push("/cash-flow")}
              className="interactive-card press-effect group flex items-center gap-4 p-4 bg-card border border-border rounded-md hover:border-success/40 hover:bg-success/[0.02] text-left stagger-item"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded bg-success/10 text-success group-hover:bg-success/15 transition-colors">
                <Receipt className="w-5 h-5 icon-hover-scale" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground">Nová faktura</span>
                <span className="block text-xs text-muted-foreground">Evidence příjmů</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-success/60 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Rychlá zakázka */}
            <button
              onClick={() => router.push("/quick-orders")}
              className="interactive-card press-effect group flex items-center gap-4 p-4 bg-card border border-border rounded-md hover:border-accent/50 hover:bg-accent/[0.03] text-left stagger-item"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded bg-accent/12 text-accent-foreground group-hover:bg-accent/18 transition-colors">
                <Sparkles className="w-5 h-5 icon-hover-scale" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground">Rychlá zakázka</span>
                <span className="block text-xs text-muted-foreground">Bez smlouvy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent/70 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </section>

        {/* Financial Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Finanční přehled</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/cash-flow")} className="text-xs h-7 px-2">
              Zobrazit vše
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Příjmy */}
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-success" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="metric-label">Příjmy</p>
                  <p className="metric-value text-foreground">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-muted-foreground">
                    Zaplaceno: <span className="text-success font-medium">{formatCurrency(paidIncome)}</span>
                  </p>
                </div>
                <div className="w-20 h-10">
                  <Sparkline data={incomeSparklineData} color="success" height={40} />
                </div>
              </div>
              {summary.overdueIncome > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <CircleAlert className="w-3.5 h-3.5" />
                    Po splatnosti: {formatCurrency(summary.overdueIncome)}
                  </p>
                </div>
              )}
            </div>

            {/* Výdaje */}
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-destructive" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="metric-label">Výdaje</p>
                  <p className="metric-value text-foreground">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground">
                    K úhradě: <span className="text-warning font-medium">{formatCurrency(summary.totalExpenses)}</span>
                  </p>
                </div>
                <div className="w-20 h-10">
                  <Sparkline data={expenseSparklineData} color="destructive" height={40} />
                </div>
              </div>
              {summary.overdueExpenses > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <CircleAlert className="w-3.5 h-3.5" />
                    Po splatnosti: {formatCurrency(summary.overdueExpenses)}
                  </p>
                </div>
              )}
            </div>

            {/* Bilance */}
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className={`absolute top-0 left-0 w-0.5 h-full ${summary.netCashFlow >= 0 ? "bg-primary" : "bg-warning"}`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="metric-label">Bilance</p>
                  <p className={`metric-value ${summary.netCashFlow >= 0 ? "text-foreground" : "text-warning"}`}>
                    {formatCurrency(summary.netCashFlow)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nezaplacené pohledávky
                  </p>
                </div>
                <div className="w-20 h-10">
                  <Sparkline
                    data={balanceSparklineData}
                    color={summary.netCashFlow >= 0 ? "primary" : "warning"}
                    height={40}
                  />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  {summary.netCashFlow >= 0 ? "Pozitivní cash-flow" : "Sledujte výdaje"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Contracts */}
        {contracts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aktivní smlouvy</h2>
                <Badge variant="secondary" className="text-[10px] px-1.5">{contracts.length}</Badge>
              </div>
              {contracts.length > 6 && (
                <Button variant="ghost" size="sm" onClick={() => router.push("/contracts")} className="text-xs h-7 px-2">
                  Zobrazit všechny
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contracts.slice(0, 6).map((contract) => {
                const status = getUpcomingStatus(contract)
                const nextDeadline = getNextDeadline(contract)

                return (
                  <button
                    key={contract.id}
                    className="interactive-card press-effect group p-4 bg-card border border-border rounded-md hover:border-border/80 hover:bg-muted/30 text-left stagger-item"
                    onClick={() => router.push(`/contract/${contract.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {contract.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getContractTypeName(contract.type)}
                        </p>
                      </div>
                      {status && (
                        <Badge
                          variant={status.type === "overdue" ? "destructive" : "outline"}
                          className="ml-2 shrink-0"
                        >
                          {status.count}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock3 className="w-3.5 h-3.5" />
                        <span>
                          {new Date(contract.finalizedAt || contract.savedAt).toLocaleDateString("cs-CZ")}
                        </span>
                      </div>

                      {nextDeadline && (
                        <div
                          className={`flex items-center gap-1.5 ${
                            nextDeadline.isPast
                              ? "text-destructive"
                              : nextDeadline.isUpcoming
                                ? "text-warning"
                                : "text-muted-foreground"
                          }`}
                        >
                          {nextDeadline.isPast ? (
                            <CircleAlert className="w-3.5 h-3.5" />
                          ) : (
                            <CircleCheck className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {nextDeadline.title} –{" "}
                            {nextDeadline.isPast
                              ? `Po termínu (${Math.abs(nextDeadline.daysUntil)} d)`
                              : `Za ${nextDeadline.daysUntil} d`}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {contracts.length === 0 && (
          <section className="text-center py-16">
            <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium mb-1">Zatím nemáte žádné smlouvy</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Začněte vytvořením první smlouvy nebo rychlé zakázky
            </p>
            <Button onClick={() => setShowTypeSelector(true)} size="sm">
              <FilePlus2 className="w-4 h-4 mr-2" />
              Vytvořit smlouvu
            </Button>
          </section>
        )}

        {/* Type Selector Modal */}
        {showTypeSelector && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-card border border-border rounded-md max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl scale-in">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Vyber typ smlouvy</h2>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowTypeSelector(false)}>
                    <X className="w-4 h-4" />
                    <span className="sr-only">Zavřít</span>
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <ContractTypeSelector onSelect={handleSelectType} />
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Wizard */}
        <OnboardingWizard />
      </div>
    </AppLayout>
  )
}
