"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { SkeletonQuickOrders } from "@/components/ui/skeleton"
import {
  Bolt,
  Plus,
  CalendarClock,
  UserCircle2,
  Banknote,
  CircleCheck,
  Timer,
  FileStack,
  Trash2,
  Loader2,
  CircleAlert,
  Receipt,
  CalendarRange,
} from "lucide-react"
import {
  getQuickOrders,
  createQuickOrder,
  updateQuickOrder,
  completeQuickOrder,
  deleteQuickOrder,
  createInvoiceFromQuickOrder,
  formatCurrency,
  formatDate,
  getQuickOrderStats,
  type QuickOrder,
} from "@/lib/quick-orders"
import { getAllClients, type Client } from "@/lib/clients"

export default function QuickOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<QuickOrder[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<QuickOrder | null>(null)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Form state
  const [clientId, setClientId] = useState<string>("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [price, setPrice] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    setOrders(getQuickOrders())
    setClients(getAllClients())
    const token = localStorage.getItem("google_calendar_token")
    if (token) setAccessToken(token)
    setIsLoading(false)
  }, [])

  const stats = getQuickOrderStats()

  const resetForm = () => {
    setClientId("")
    setClientName("")
    setClientPhone("")
    setClientEmail("")
    setDescription("")
    setDueDate("")
    setPrice("")
    setNotes("")
  }

  const handleClientSelect = (id: string) => {
    setClientId(id)
    if (id === "new") {
      setClientName("")
      setClientPhone("")
      setClientEmail("")
    } else {
      const client = clients.find((c) => c.id === id)
      if (client) {
        setClientName(client.name)
        setClientPhone(client.phone || "")
        setClientEmail(client.email || "")
      }
    }
  }

  const handleSubmit = () => {
    if (!clientName || !description || !dueDate || !price) return

    createQuickOrder({
      clientId: clientId !== "new" ? clientId : undefined,
      clientName,
      clientPhone,
      clientEmail,
      description,
      dueDate,
      price: Number(price),
      notes,
    })

    setOrders(getQuickOrders())
    setShowAddDialog(false)
    resetForm()
  }

  const handleComplete = (order: QuickOrder) => {
    completeQuickOrder(order.id)
    setOrders(getQuickOrders())
  }

  const handleCreateInvoice = async (order: QuickOrder) => {
    setIsCreatingInvoice(true)
    setSelectedOrder(order)

    try {
      createInvoiceFromQuickOrder(order)
      setOrders(getQuickOrders())
    } finally {
      setIsCreatingInvoice(false)
      setSelectedOrder(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Opravdu chcete smazat tuto zakázku?")) {
      deleteQuickOrder(id)
      setOrders(getQuickOrders())
    }
  }

  const handleAddToCalendar = async (order: QuickOrder) => {
    if (!accessToken) {
      localStorage.setItem("calendar_return_url", window.location.pathname)
      window.location.href = "/api/calendar/auth"
      return
    }

    try {
      const response = await fetch("/api/calendar/add-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          events: [
            {
              title: `${order.description} - ${order.clientName}`,
              description: `Zakázka: ${order.description}\nKlient: ${order.clientName}\nCena: ${formatCurrency(order.price)}`,
              date: order.dueDate,
            },
          ],
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Zakázka byla přidána do kalendáře!")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Calendar error:", error)
      alert("Nepodařilo se přidat do kalendáře")
    }
  }

  const getStatusBadge = (status: QuickOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Čeká</Badge>
      case "completed":
        return <Badge variant="success">Hotovo</Badge>
      case "invoiced":
        return <Badge variant="default">Fakturováno</Badge>
    }
  }

  const isOverdue = (order: QuickOrder) => {
    return order.status === "pending" && new Date(order.dueDate) < new Date()
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonQuickOrders />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <Bolt className="w-6 h-6 text-accent" strokeWidth={1.75} />
                Rychlé zakázky
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Evidence menších zakázek bez formální smlouvy
              </p>
            </div>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Nová zakázka
            </Button>
          </div>
        </header>

        {/* Stats */}
        <section className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-warning" />
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-warning" strokeWidth={1.75} />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Čeká</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums">{stats.counts.pending}</div>
              <div className="text-xs text-muted-foreground">{formatCurrency(stats.totals.pending)}</div>
            </div>

            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-success" />
              <div className="flex items-center gap-2 mb-1">
                <CircleCheck className="w-4 h-4 text-success" strokeWidth={1.75} />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Hotovo</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums">{stats.counts.completed}</div>
              <div className="text-xs text-muted-foreground">{formatCurrency(stats.totals.completed)}</div>
            </div>

            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-primary" />
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-primary" strokeWidth={1.75} />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Fakturováno</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums">{stats.counts.invoiced}</div>
              <div className="text-xs text-muted-foreground">{formatCurrency(stats.totals.invoiced)}</div>
            </div>

            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-destructive" />
              <div className="flex items-center gap-2 mb-1">
                <CircleAlert className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Po termínu</span>
              </div>
              <div className="text-2xl font-semibold tabular-nums text-destructive">{stats.counts.overdue}</div>
            </div>
          </div>
        </section>

        {/* Orders List */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Zakázky</h2>
            <Badge variant="secondary" className="text-[10px] px-1.5">{orders.length}</Badge>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-md">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mx-auto mb-3">
                <Bolt className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium mb-1">Žádné zakázky</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Přidejte svou první rychlou zakázku
              </p>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Nová zakázka
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3.5 bg-card border rounded-md stagger-item clickable-row ${
                    isOverdue(order) ? "border-destructive/40 bg-destructive/[0.02]" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <Checkbox
                        checked={order.status !== "pending"}
                        disabled={order.status !== "pending"}
                        onCheckedChange={() => handleComplete(order)}
                        className="w-4 h-4"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className={`text-sm font-medium ${order.status !== "pending" ? "line-through text-muted-foreground" : ""}`}>
                            {order.description}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                            <UserCircle2 className="w-3 h-3" />
                            <span>{order.clientName}</span>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className={isOverdue(order) ? "text-destructive font-medium" : ""}>
                            {formatDate(order.dueDate)}
                          </span>
                          {isOverdue(order) && (
                            <Badge variant="destructive" className="ml-1 text-[10px] px-1">Po termínu</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(order.price)}</span>
                        </div>
                      </div>

                      {order.notes && (
                        <p className="text-xs text-muted-foreground/80 mt-2 truncate">
                          {order.notes}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddToCalendar(order)}
                              className="h-7 px-2 text-xs"
                            >
                              <CalendarRange className="w-3.5 h-3.5 mr-1" />
                              Kalendář
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCreateInvoice(order)}
                              disabled={isCreatingInvoice && selectedOrder?.id === order.id}
                              className="h-7 px-2 text-xs"
                            >
                              {isCreatingInvoice && selectedOrder?.id === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              ) : (
                                <FileStack className="w-3.5 h-3.5 mr-1" />
                              )}
                              Vytvořit fakturu
                            </Button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <Button
                            size="sm"
                            onClick={() => handleCreateInvoice(order)}
                            disabled={isCreatingInvoice && selectedOrder?.id === order.id}
                            className="h-7 px-2 text-xs"
                          >
                            {isCreatingInvoice && selectedOrder?.id === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                              <FileStack className="w-3.5 h-3.5 mr-1" />
                            )}
                            Vytvořit fakturu
                          </Button>
                        )}
                        {order.status === "invoiced" && order.invoiceId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push("/cash-flow")}
                            className="h-7 px-2 text-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1" />
                            Zobrazit fakturu
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bolt className="w-5 h-5 text-accent" strokeWidth={1.75} />
                Nová rychlá zakázka
              </DialogTitle>
              <DialogDescription>
                Zadejte základní údaje o zakázce
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Kdo */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <UserCircle2 className="w-3.5 h-3.5" />
                  Kdo (zákazník)
                </Label>
                {clients.length > 0 ? (
                  <Select value={clientId} onValueChange={handleClientSelect}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Vyberte klienta nebo zadejte nového" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ Nový klient</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                {(clientId === "new" || clients.length === 0) && (
                  <div className="space-y-2 mt-2">
                    <Input
                      placeholder="Jméno zákazníka *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Telefon"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Co */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <FileStack className="w-3.5 h-3.5" />
                  Co (popis práce) *
                </Label>
                <Textarea
                  placeholder="Např. Oprava střechy, Web pro kavárnu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Kdy */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Kdy (termín) *
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Za kolik */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5" />
                  Za kolik (cena v Kč) *
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* Poznámky */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Poznámky (volitelné)</Label>
                <Textarea
                  placeholder="Další informace k zakázce..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Zrušit
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!clientName || !description || !dueDate || !price}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Vytvořit zakázku
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
