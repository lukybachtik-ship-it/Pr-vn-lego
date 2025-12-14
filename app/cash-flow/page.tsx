"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Users,
  QrCode,
  Eye,
  Bell,
  CalendarDays,
  BarChart3,
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
  type InvoiceItem,
} from "@/lib/cash-flow"
import { getAllClients, type Client } from "@/lib/clients"
import { ClientSelector } from "@/components/client-selector"
import { QRInvoicePreview } from "@/components/qr-invoice-preview"
import { VATLimitIndicator } from "@/components/vat-limit-indicator"
import { generateInvoiceNumber } from "@/lib/qr-payment"
import { getDefaultBankAccount } from "@/lib/bank-accounts"
import { AppHeader } from "@/components/app-header"
import { InvoiceItemsEditor } from "@/components/invoice-items-editor"
import { MonthlyDetailPopup } from "@/components/monthly-detail-popup"
import { InvoiceReminderDialog } from "@/components/invoice-reminder-dialog"

export default function CashFlowPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showClientSelector, setShowClientSelector] = useState(false)
  const [showQRPreview, setShowQRPreview] = useState(false)
  const [selectedInvoiceForQR, setSelectedInvoiceForQR] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [vatRefreshTrigger, setVatRefreshTrigger] = useState(0)

  // Month filter state
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // Form state
  const [type, setType] = useState<"income" | "expense">("income")
  const [from, setFrom] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState("")
  const [useLineItems, setUseLineItems] = useState(false)
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([])

  // Monthly detail popup state
  const [showMonthlyDetail, setShowMonthlyDetail] = useState(false)
  const [monthlyDetailType, setMonthlyDetailType] = useState<"income" | "expense">("income")

  // Reminder dialog state
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<Invoice | null>(null)

  useEffect(() => {
    loadInvoices()

    // Handle prefilled data from URL parameters
    const prefill = searchParams.get("prefill")
    if (prefill === "contract" || prefill === "time") {
      const fromParam = searchParams.get("from")
      const amountParam = searchParams.get("amount")
      const dueDateParam = searchParams.get("dueDate")
      const descriptionParam = searchParams.get("description")
      const clientIdParam = searchParams.get("clientId")

      if (fromParam) setFrom(fromParam)
      if (amountParam) setAmount(amountParam)
      if (dueDateParam) setDueDate(dueDateParam)
      if (descriptionParam) setDescription(descriptionParam)

      // Load client if provided
      if (clientIdParam) {
        const clients = getAllClients()
        const client = clients.find((c) => c.id === clientIdParam)
        if (client) {
          setSelectedClient(client)
          setFrom(client.name)
        }
      }

      setShowAddDialog(true)
    }
  }, [searchParams])

  const loadInvoices = () => {
    const allInvoices = getAllInvoices()
    setInvoices(allInvoices)
    setVatRefreshTrigger((prev) => prev + 1) // Trigger VAT limit recalculation
    setIsLoading(false)
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setFrom(client.name)
    setShowClientSelector(false)
  }

  const handleAddInvoice = () => {
    const finalAmount = useLineItems
      ? lineItems.reduce((sum, item) => sum + item.total, 0)
      : parseFloat(amount)

    const invoice = createInvoice(
      type,
      from,
      finalAmount,
      dueDate,
      description || undefined,
      selectedClient?.id,
    )

    // Add line items if using itemized billing
    if (useLineItems && lineItems.length > 0) {
      invoice.items = lineItems
    }

    // Add invoice number and bank account for QR payments
    if (type === "income") {
      invoice.invoiceNumber = generateInvoiceNumber()
      invoice.variableSymbol = invoice.invoiceNumber
      const defaultAccount = getDefaultBankAccount()
      if (defaultAccount) {
        invoice.bankAccountId = defaultAccount.id
      }
    }

    saveInvoice(invoice)
    loadInvoices()

    // Reset form
    setShowAddDialog(false)
    setFrom("")
    setSelectedClient(null)
    setAmount("")
    setDescription("")
    setDueDate(new Date().toISOString().split("T")[0])
    setType("income")
    setUseLineItems(false)
    setLineItems([])
  }

  const handleLineItemsChange = (items: InvoiceItem[]) => {
    setLineItems(items)
  }

  const handleLineItemsTotalChange = (total: number) => {
    setAmount(total.toString())
  }

  const handleShowQR = (invoice: Invoice) => {
    setSelectedInvoiceForQR(invoice)
    setShowQRPreview(true)
  }

  const handleMarkAsPaid = (invoiceId: string) => {
    markInvoiceAsPaid(invoiceId)
    loadInvoices()
  }

  const handleShowMonthlyDetail = (detailType: "income" | "expense") => {
    setMonthlyDetailType(detailType)
    setShowMonthlyDetail(true)
  }

  const handleAddReminder = (invoice: Invoice) => {
    setSelectedInvoiceForReminder(invoice)
    setShowReminderDialog(true)
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
    <>
      <AppHeader title="Palubní Deska Peněz" />
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Wallet className="w-10 h-10 text-primary" />
                Palubní Deska Peněz
              </h1>
              <p className="text-muted-foreground">Sledujte své příjmy a výdaje na jednom místě</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/cash-flow/monthly-overview")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Měsíční přehled
              </Button>
              <Button variant="outline" onClick={() => router.push("/cash-flow/tax-calendar")}>
                <CalendarDays className="w-4 h-4 mr-2" />
                Daňový kalendář
              </Button>
              <Button onClick={() => setShowAddDialog(true)} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Přidat fakturu
              </Button>
            </div>
          </div>

          {/* VAT Limit Indicator */}
          <div className="mt-6">
            <VATLimitIndicator refreshTrigger={vatRefreshTrigger} />
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
          <Card
            className="border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleShowMonthlyDetail("income")}
          >
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
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Klikněte pro detail
              </p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card
            className="border-red-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleShowMonthlyDetail("expense")}
          >
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
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Klikněte pro detail
              </p>
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
                      {invoice.type === "income" && !invoice.isPaid && (
                        <Button size="sm" variant="outline" onClick={() => handleShowQR(invoice)}>
                          <QrCode className="w-3 h-3 mr-1" />
                          QR
                        </Button>
                      )}
                      {!invoice.isPaid && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddReminder(invoice)}
                            title="Nastavit připomenutí"
                          >
                            <Bell className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-green-50" onClick={() => handleMarkAsPaid(invoice.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Zaplaceno
                          </Button>
                        </>
                      )}
                      {invoice.isPaid && (
                        <Button size="sm" variant="ghost" onClick={() => handleShowQR(invoice)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Detail
                        </Button>
                      )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="from">{type === "income" ? "Od koho" : "Komu platím"}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClientSelector(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Vybrat z klientů
                </Button>
              </div>
              <Input
                id="from"
                placeholder="např. ABC s.r.o."
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setSelectedClient(null) // Clear selected client if manually typing
                }}
              />
              {selectedClient && (
                <div className="text-xs text-muted-foreground bg-accent/10 p-2 rounded">
                  ✓ Klient: {selectedClient.name}
                  {selectedClient.ico && ` (IČO: ${selectedClient.ico})`}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useLineItems"
                  checked={useLineItems}
                  onChange={(e) => setUseLineItems(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="useLineItems" className="font-normal cursor-pointer">
                  Použít položkovou fakturu (služby, materiál, cestovné)
                </Label>
              </div>
            </div>

            {!useLineItems ? (
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
            ) : (
              <InvoiceItemsEditor
                items={lineItems}
                onChange={handleLineItemsChange}
                onTotalChange={handleLineItemsTotalChange}
              />
            )}

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
            <Button
              onClick={handleAddInvoice}
              disabled={!from || (!useLineItems && (!amount || parseFloat(amount) <= 0)) || (useLineItems && lineItems.length === 0)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Přidat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Selector Dialog */}
      <ClientSelector
        open={showClientSelector}
        onOpenChange={setShowClientSelector}
        onSelect={handleClientSelect}
      />

      {/* QR Invoice Preview */}
      {selectedInvoiceForQR && (
        <QRInvoicePreview
          invoice={selectedInvoiceForQR}
          open={showQRPreview}
          onOpenChange={setShowQRPreview}
        />
      )}

      {/* Monthly Detail Popup */}
      <MonthlyDetailPopup
        open={showMonthlyDetail}
        onOpenChange={setShowMonthlyDetail}
        type={monthlyDetailType}
        invoices={filteredInvoices}
        monthLabel={new Date(selectedMonth + "-01").toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}
        onMarkAsPaid={handleMarkAsPaid}
        onAddReminder={handleAddReminder}
      />

      {/* Invoice Reminder Dialog */}
      <InvoiceReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        invoice={selectedInvoiceForReminder}
      />
      </main>
    </>
  )
}
