"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  CheckCircle,
  Trash2,
  Calendar,
} from "lucide-react"
import {
  getAllInvoices,
  createInvoice,
  saveInvoice,
  markInvoiceAsPaid,
  deleteInvoice,
  calculateCashFlowSummary,
  getCurrentMonthInvoices,
  formatCurrency,
  type Invoice,
} from "@/lib/cash-flow"

export default function CashFlowPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Month filter state
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // Form state
  const [type, setType] = useState<"income" | "expense">("income")
  const [from, setFrom] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = () => {
    const allInvoices = getAllInvoices()
    setInvoices(allInvoices)
    setIsLoading(false)
  }

  const handleAddInvoice = () => {
    const invoice = createInvoice(type, from, parseFloat(amount), dueDate, description || undefined)
    saveInvoice(invoice)
    loadInvoices()

    // Reset form
    setShowAddDialog(false)
    setFrom("")
    setAmount("")
    setDescription("")
    setDueDate(new Date().toISOString().split("T")[0])
    setType("income")
  }

  const handleMarkAsPaid = (invoiceId: string) => {
    markInvoiceAsPaid(invoiceId)
    loadInvoices()
  }

  const handleDelete = (invoiceId: string) => {
    if (confirm("Opravdu chcete smazat tuto fakturu?")) {
      deleteInvoice(invoiceId)
      loadInvoices()
    }
  }

  const getInvoiceStatusBadge = (invoice: Invoice) => {
    if (invoice.isPaid) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Zaplaceno
        </Badge>
      )
    }

    const dueDate = new Date(invoice.dueDate)
    const now = new Date()

    if (dueDate < now) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Po splatnosti
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        <Calendar className="w-3 h-3 mr-1" />
        Čeká
        </Badge>
    )
  }

  // Filter invoices by selected month
  const filteredInvoices = invoices.filter((inv) => {
    const invoiceDate = new Date(inv.dueDate)
    const invoiceMonth = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, "0")}`
    return invoiceMonth === selectedMonth
  })

  // Calculate summary for filtered invoices
  const summary = calculateCashFlowSummary(filteredInvoices)

  // Get available months from all invoices
  const availableMonths = Array.from(
    new Set(
      invoices.map((inv) => {
        const date = new Date(inv.dueDate)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }),
    ),
  ).sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <p className="text-muted-foreground">Načítám...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zpět na domovskou stránku
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Wallet className="w-10 h-10 text-primary" />
                Palubní Deska Peněz
              </h1>
              <p className="text-muted-foreground">Sledujte své příjmy a výdaje na jednom místě</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Přidat fakturu
            </Button>
          </div>

          {/* Month Selector */}
          {availableMonths.length > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <Label htmlFor="month-select" className="text-sm font-medium">
                Zobrazit měsíc:
              </Label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {availableMonths.map((month) => {
                  const [year, monthNum] = month.split("-")
                  const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString("cs-CZ", {
                    month: "long",
                    year: "numeric",
                  })
                  return (
                    <option key={month} value={month}>
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    </option>
                  )
                })}
              </select>
              <span className="text-sm text-muted-foreground">
                (Celkem {filteredInvoices.length} faktur)
              </span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <Card className="border-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Příjmy (nezaplacené)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
              {summary.overdueIncome > 0 && (
                <p className="text-xs text-destructive mt-2">
                  Po splatnosti: {formatCurrency(summary.overdueIncome)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="border-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Výdaje (nezaplacené)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
              {summary.overdueExpenses > 0 && (
                <p className="text-xs text-destructive mt-2">
                  Po splatnosti: {formatCurrency(summary.overdueExpenses)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Net Cash Flow */}
          <Card className={summary.netCashFlow >= 0 ? "border-blue-500" : "border-orange-500"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Očekávaný zůstatek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${summary.netCashFlow >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                {formatCurrency(summary.netCashFlow)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {summary.netCashFlow >= 0 ? "Máte dobrou rezervu" : "Pozor na cash-flow"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Month Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tento měsíc</CardTitle>
            <CardDescription>
              Přehled příjmů a výdajů pro{" "}
              {new Date(selectedMonth + "-01").toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Příjmy</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    filteredInvoices.filter((inv) => inv.type === "income").reduce((sum, inv) => sum + inv.amount, 0),
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Výdaje</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    filteredInvoices.filter((inv) => inv.type === "expense").reduce((sum, inv) => sum + inv.amount, 0),
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Čistý zisk</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(
                    filteredInvoices.filter((inv) => inv.type === "income").reduce((sum, inv) => sum + inv.amount, 0) -
                      filteredInvoices.filter((inv) => inv.type === "expense").reduce((sum, inv) => sum + inv.amount, 0),
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Faktury za vybraný měsíc</CardTitle>
            <CardDescription>
              {filteredInvoices.length} faktur celkem (
              {filteredInvoices.filter((inv) => !inv.isPaid).length} nezaplacených)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Žádné faktury pro vybraný měsíc</p>
            ) : (
              <div className="space-y-3">
                {filteredInvoices
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      new Date(invoice.dueDate) < new Date() ? "bg-destructive/5 border-destructive" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold">
                          {invoice.type === "income" ? (
                            <span className="text-green-600">↓ Od: {invoice.from}</span>
                          ) : (
                            <span className="text-red-600">↑ Pro: {invoice.from}</span>
                          )}
                        </span>
                        {getInvoiceStatusBadge(invoice)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Splatnost: {new Date(invoice.dueDate).toLocaleDateString("cs-CZ")} • {formatCurrency(invoice.amount)}
                      </div>
                      {invoice.description && <div className="text-xs text-muted-foreground mt-1">{invoice.description}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-green-50" onClick={() => handleMarkAsPaid(invoice.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Zaplaceno
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(invoice.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Invoice Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Přidat fakturu</DialogTitle>
            <DialogDescription>Zadejte údaje o faktuře, kterou jste vystavili nebo obdrželi.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Typ faktury</Label>
              <RadioGroup value={type} onValueChange={(val) => setType(val as "income" | "expense")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="font-normal cursor-pointer flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Příjem (faktura, kterou jsem vystavil)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="font-normal cursor-pointer flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Výdaj (faktura, kterou mi přišla)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">{type === "income" ? "Od koho" : "Komu platím"}</Label>
              <Input id="from" placeholder="např. ABC s.r.o." value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Částka (Kč)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="např. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Datum splatnosti</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis (volitelné)</Label>
              <Textarea
                id="description"
                placeholder="např. Faktura za vývoj webu"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleAddInvoice} disabled={!from || !amount || parseFloat(amount) <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              Přidat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
