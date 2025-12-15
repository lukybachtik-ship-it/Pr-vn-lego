"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  Wallet,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react"
import { ContractTypeSelector } from "@/components/contract-type-selector"
import { getFinalizedContracts } from "@/lib/contract-storage"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import { getAllInvoices, calculateCashFlowSummary, formatCurrency, type Invoice } from "@/lib/cash-flow"
import { useAuth } from "@/components/auth-provider"
import type { SavedContract } from "@/lib/contract-storage"
import { AppLayout } from "@/components/app-layout"

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    // Load initial contracts
    setContracts(getFinalizedContracts())
    // Load invoices for financial summary
    setInvoices(getAllInvoices())

    // Listen for localStorage changes (when cloud data loads)
    const handleStorageChange = () => {
      setContracts(getFinalizedContracts())
      setInvoices(getAllInvoices())
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom event when data loads from cloud
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

  // Calculate financial summary
  const summary = calculateCashFlowSummary(invoices)

  // Calculate total income/expenses including paid
  const totalIncome = invoices
    .filter((inv) => inv.type === "income")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpenses = invoices
    .filter((inv) => inv.type === "expense")
    .reduce((sum, inv) => sum + inv.amount, 0)
  const paidIncome = invoices
    .filter((inv) => inv.type === "income" && inv.isPaid)
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Hero Section */}
        <section className="mb-10">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Vítejte v <span className="text-primary">BusinessHub</span>
            </h1>
            <p className="text-muted-foreground">
              Spravujte své smlouvy, faktury a finance na jednom místě
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Nová smlouva */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-transparent hover:border-primary/20"
              onClick={() => setShowTypeSelector(true)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Nová smlouva</h3>
                <p className="text-sm text-muted-foreground">
                  Vytvořte smlouvu jako stavebnici
                </p>
              </CardContent>
            </Card>

            {/* Nová faktura */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-transparent hover:border-primary/20"
              onClick={() => router.push("/cash-flow")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Nová faktura</h3>
                <p className="text-sm text-muted-foreground">
                  Vystavte nebo evidujte fakturu
                </p>
              </CardContent>
            </Card>

            {/* Rychlá zakázka */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-transparent hover:border-accent/50 bg-accent/5"
              onClick={() => router.push("/quick-orders")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Rychlá zakázka</h3>
                <p className="text-sm text-muted-foreground">
                  Rychlý záznam bez smlouvy
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Financial Overview Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Finanční přehled</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/cash-flow")}>
              <Eye className="w-4 h-4 mr-2" />
              Zobrazit vše
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Příjmy */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Příjmy celkem</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Zaplaceno: {formatCurrency(paidIncome)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                {summary.overdueIncome > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Po splatnosti: {formatCurrency(summary.overdueIncome)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Výdaje */}
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Výdaje celkem</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nezaplaceno: {formatCurrency(summary.totalExpenses)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                {summary.overdueExpenses > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Po splatnosti: {formatCurrency(summary.overdueExpenses)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zůstatek */}
            <Card className={`border-l-4 ${summary.netCashFlow >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Očekávaný zůstatek</p>
                    <p className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                      {formatCurrency(summary.netCashFlow)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nezaplacené pohledávky
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${summary.netCashFlow >= 0 ? "bg-blue-100" : "bg-orange-100"}`}>
                    <Wallet className={`w-5 h-5 ${summary.netCashFlow >= 0 ? "text-blue-600" : "text-orange-600"}`} />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {summary.netCashFlow >= 0 ? "Dobrá finanční situace" : "Pozor na cash-flow"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Active Contracts Section */}
        {contracts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Aktivní smlouvy</h2>
                <Badge variant="secondary">{contracts.length}</Badge>
              </div>
              {contracts.length > 6 && (
                <Button variant="outline" size="sm" onClick={() => router.push("/contracts")}>
                  Zobrazit všechny
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.slice(0, 6).map((contract) => {
                const status = getUpcomingStatus(contract)
                const nextDeadline = getNextDeadline(contract)

                return (
                  <Card
                    key={contract.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/contract/${contract.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-1">{contract.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {getContractTypeName(contract.type)}
                          </CardDescription>
                        </div>
                        {status && (
                          <Badge
                            variant={status.type === "overdue" ? "destructive" : "default"}
                            className="ml-2 shrink-0"
                          >
                            {status.count}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(contract.finalizedAt || contract.savedAt).toLocaleDateString("cs-CZ")}
                          </span>
                        </div>

                        {nextDeadline && (
                          <div
                            className={`flex items-center gap-2 ${
                              nextDeadline.isPast
                                ? "text-destructive"
                                : nextDeadline.isUpcoming
                                  ? "text-yellow-600"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {nextDeadline.isPast ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            <span className="text-xs">
                              {nextDeadline.title} -{" "}
                              {nextDeadline.isPast
                                ? `Po termínu (${Math.abs(nextDeadline.daysUntil)} dnů)`
                                : `Za ${nextDeadline.daysUntil} dnů`}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state if no contracts */}
        {contracts.length === 0 && (
          <section className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Zatím nemáte žádné smlouvy</h3>
            <p className="text-muted-foreground mb-4">
              Začněte vytvořením první smlouvy nebo rychlé zakázky
            </p>
            <Button onClick={() => setShowTypeSelector(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Vytvořit první smlouvu
            </Button>
          </section>
        )}

        {/* Type Selector Dialog */}
        {showTypeSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Vyber typ smlouvy</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowTypeSelector(false)}>
                    ✕
                  </Button>
                </div>
                <ContractTypeSelector onSelect={handleSelectType} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
