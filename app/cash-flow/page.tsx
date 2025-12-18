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
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  CircleAlert,
  CircleCheck,
  Trash2,
  CalendarClock,
  UsersRound,
  QrCode,
  Eye,
  BellRing,
  CalendarRange,
  BarChart4,
  Filter,
  Receipt,
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
import { AppLayout } from "@/components/app-layout"
import { InvoiceItemsEditor } from "@/components/invoice-items-editor"
import { InvoiceReminderDialog } from "@/components/invoice-reminder-dialog"
import { SkeletonCashFlow } from "@/components/ui/skeleton"

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

  // Reminder dialog state
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<Invoice | null>(null)

  useEffect(() => {
    loadInvoices()

    // Reload after a short delay to catch data loaded by AuthProvider
    const reloadTimer = setTimeout(() => {
      loadInvoices()
    }, 500)

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

    return () => clearTimeout(reloadTimer)
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
        <Badge variant="success">
          <CircleCheck className="w-3 h-3 mr-1" />
          Zaplaceno
        </Badge>
      )
    }

    const dueDate = new Date(invoice.dueDate)
    const now = new Date()

    if (dueDate < now) {
      return (
        <Badge variant="destructive">
          <CircleAlert className="w-3 h-3 mr-1" />
          Po splatnosti
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        <CalendarClock className="w-3 h-3 mr-1" />
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

  // Calculate totals for filtered invoices
  const totalIncome = filteredInvoices.filter((inv) => inv.type === "income").reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpenses = filteredInvoices.filter((inv) => inv.type === "expense").reduce((sum, inv) => sum + inv.amount, 0)
  const netProfit = totalIncome - totalExpenses

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonCashFlow />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <Landmark className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Peníze
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sledujte příjmy a výdaje na jednom místě
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/cash-flow/monthly-overview")}>
                <BarChart4 className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                Měsíční přehled
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/cash-flow/tax-calendar")}>
                <CalendarRange className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                Daňový kalendář
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Přidat fakturu
              </Button>
            </div>
          </div>
        </header>

        {/* VAT Limit Indicator */}
        <div className="mb-6">
          <VATLimitIndicator refreshTrigger={vatRefreshTrigger} />
        </div>

        {/* Financial Overview Cards */}
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Příjmy */}
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-success" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="metric-label">Příjmy</p>
                  <p className="metric-value text-foreground">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="p-2 rounded bg-success/8">
                  <ArrowUpRight className="w-4 h-4 text-success" strokeWidth={2} />
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
                </div>
                <div className="p-2 rounded bg-destructive/8">
                  <ArrowDownRight className="w-4 h-4 text-destructive" strokeWidth={2} />
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

            {/* Čistý zisk */}
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className={`absolute top-0 left-0 w-0.5 h-full ${netProfit >= 0 ? "bg-primary" : "bg-warning"}`} />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="metric-label">Čistý zisk</p>
                  <p className={`metric-value ${netProfit >= 0 ? "text-foreground" : "text-warning"}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
                <div className={`p-2 rounded ${netProfit >= 0 ? "bg-primary/8" : "bg-warning/10"}`}>
                  <Receipt className={`w-4 h-4 ${netProfit >= 0 ? "text-primary" : "text-warning"}`} strokeWidth={2} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
                  {netProfit >= 0 ? "Pozitivní bilance" : "Sledujte výdaje"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Unpaid invoices warning */}
        {(summary.totalIncome > 0 || summary.totalExpenses > 0) && (
          <section className="mb-6">
            <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-md">
              <CircleAlert className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" strokeWidth={2} />
              <div className="text-sm space-y-1">
                <p className="font-medium text-foreground">Nezaplacené faktury</p>
                <div className="text-muted-foreground space-y-0.5">
                  {summary.totalIncome > 0 && (
                    <p>Příjmy k inkasu: <span className="text-success font-medium">{formatCurrency(summary.totalIncome)}</span></p>
                  )}
                  {summary.totalExpenses > 0 && (
                    <p>Výdaje k úhradě: <span className="text-destructive font-medium">{formatCurrency(summary.totalExpenses)}</span></p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Month Selector & Invoices List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Faktury</h2>
              <Badge variant="secondary" className="text-[10px] px-1.5">{filteredInvoices.length}</Badge>
            </div>
            {availableMonths.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-8 rounded border border-border bg-background px-2.5 text-xs transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
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
              </div>
            )}
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-md">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground">Žádné faktury pro vybraný měsíc</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInvoices
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`flex items-center justify-between p-3.5 bg-card border rounded-md stagger-item clickable-row ${
                      !invoice.isPaid && new Date(invoice.dueDate) < new Date()
                        ? "border-destructive/40 bg-destructive/[0.02]"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-sm font-medium">
                          {invoice.type === "income" ? (
                            <span className="text-success flex items-center gap-1.5">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Od: {invoice.from}
                            </span>
                          ) : (
                            <span className="text-destructive flex items-center gap-1.5">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              Pro: {invoice.from}
                            </span>
                          )}
                        </span>
                        {getInvoiceStatusBadge(invoice)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Splatnost: {new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}</span>
                        <span className="text-foreground font-medium">{formatCurrency(invoice.amount)}</span>
                      </div>
                      {invoice.description && (
                        <p className="text-xs text-muted-foreground/80 mt-1 truncate">{invoice.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 ml-4">
                      {invoice.type === "income" && !invoice.isPaid && (
                        <Button size="sm" variant="outline" onClick={() => handleShowQR(invoice)} className="h-7 px-2">
                          <QrCode className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {!invoice.isPaid && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddReminder(invoice)}
                            className="h-7 px-2"
                            title="Nastavit připomenutí"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="h-7 px-2 text-success hover:text-success hover:bg-success/5 hover:border-success/30"
                          >
                            <CircleCheck className="w-3.5 h-3.5 mr-1" />
                            <span className="text-xs">Zaplaceno</span>
                          </Button>
                        </>
                      )}
                      {invoice.isPaid && (
                        <Button size="sm" variant="ghost" onClick={() => handleShowQR(invoice)} className="h-7 px-2">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Detail</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(invoice.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Add Invoice Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Přidat fakturu</DialogTitle>
              <DialogDescription>Zadejte údaje o faktuře, kterou jste vystavili nebo obdrželi.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Typ faktury</Label>
                <RadioGroup value={type} onValueChange={(val) => setType(val as "income" | "expense")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="font-normal cursor-pointer flex items-center gap-2 text-sm">
                      <ArrowUpRight className="w-4 h-4 text-success" />
                      Příjem (faktura, kterou jsem vystavil)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="font-normal cursor-pointer flex items-center gap-2 text-sm">
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                      Výdaj (faktura, kterou mi přišla)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="from" className="text-xs font-medium">{type === "income" ? "Od koho" : "Komu platím"}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClientSelector(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <UsersRound className="w-3.5 h-3.5 mr-1.5" />
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
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <CircleCheck className="w-3 h-3 inline mr-1 text-success" />
                    Klient: {selectedClient.name}
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
                    className="w-4 h-4 rounded border-border"
                  />
                  <Label htmlFor="useLineItems" className="font-normal cursor-pointer text-sm">
                    Použít položkovou fakturu
                  </Label>
                </div>
              </div>

              {!useLineItems ? (
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-xs font-medium">Částka (Kč)</Label>
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
                <Label htmlFor="dueDate" className="text-xs font-medium">Datum splatnosti</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium">Popis (volitelné)</Label>
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
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>
                Zrušit
              </Button>
              <Button
                size="sm"
                onClick={handleAddInvoice}
                disabled={!from || (!useLineItems && (!amount || parseFloat(amount) <= 0)) || (useLineItems && lineItems.length === 0)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
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

        {/* Invoice Reminder Dialog */}
        <InvoiceReminderDialog
          open={showReminderDialog}
          onOpenChange={setShowReminderDialog}
          invoice={selectedInvoiceForReminder}
        />
      </div>
    </AppLayout>
  )
}
