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
import { AppHeader } from "@/components/app-header"
import {
  Zap,
  Plus,
  Calendar,
  User,
  Banknote,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  Receipt,
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
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Čeká</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hotovo</Badge>
      case "invoiced":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Fakturováno</Badge>
    }
  }

  const isOverdue = (order: QuickOrder) => {
    return order.status === "pending" && new Date(order.dueDate) < new Date()
  }

  if (isLoading) {
    return (
      <>
        <AppHeader title="Rychlé zakázky" showBack />
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Rychlé zakázky" showBack />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="w-8 h-8 text-amber-500" />
                Rychlé zakázky
              </h1>
              <p className="text-muted-foreground mt-1">
                Evidence menších zakázek bez formální smlouvy
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Nová zakázka
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-muted-foreground">Čeká</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.counts.pending}</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(stats.totals.pending)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Hotovo</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.counts.completed}</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(stats.totals.completed)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Fakturováno</span>
                </div>
                <div className="text-2xl font-bold mt-1">{stats.counts.invoiced}</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(stats.totals.invoiced)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Po termínu</span>
                </div>
                <div className="text-2xl font-bold mt-1 text-red-600">{stats.counts.overdue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Žádné zakázky</h3>
                  <p className="text-muted-foreground mb-4">
                    Přidejte svou první rychlou zakázku
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nová zakázka
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card
                  key={order.id}
                  className={`transition-all ${isOverdue(order) ? "border-red-300 bg-red-50/50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox pro dokončení */}
                      <div className="pt-1">
                        <Checkbox
                          checked={order.status !== "pending"}
                          disabled={order.status !== "pending"}
                          onCheckedChange={() => handleComplete(order)}
                          className="w-5 h-5"
                        />
                      </div>

                      {/* Obsah */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-medium ${order.status !== "pending" ? "line-through text-muted-foreground" : ""}`}>
                              {order.description}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{order.clientName}</span>
                            </div>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className={isOverdue(order) ? "text-red-600 font-medium" : ""}>
                              {formatDate(order.dueDate)}
                            </span>
                            {isOverdue(order) && (
                              <Badge variant="destructive" className="ml-1 text-xs">Po termínu</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Banknote className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(order.price)}</span>
                          </div>
                        </div>

                        {order.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {order.notes}
                          </p>
                        )}

                        {/* Akce */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToCalendar(order)}
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                Kalendář
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleCreateInvoice(order)}
                                disabled={isCreatingInvoice && selectedOrder?.id === order.id}
                              >
                                {isCreatingInvoice && selectedOrder?.id === order.id ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <FileText className="w-3 h-3 mr-1" />
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
                            >
                              {isCreatingInvoice && selectedOrder?.id === order.id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <FileText className="w-3 h-3 mr-1" />
                              )}
                              Vytvořit fakturu
                            </Button>
                          )}
                          {order.status === "invoiced" && order.invoiceId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push("/cash-flow")}
                            >
                              <Receipt className="w-3 h-3 mr-1" />
                              Zobrazit fakturu
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Nová rychlá zakázka
            </DialogTitle>
            <DialogDescription>
              Zadejte základní údaje o zakázce
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Kdo */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Kdo (zákazník)
              </Label>
              {clients.length > 0 ? (
                <Select value={clientId} onValueChange={handleClientSelect}>
                  <SelectTrigger>
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
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
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
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
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
              <Label className="flex items-center gap-2">
                <Banknote className="w-4 h-4" />
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
              <Label>Poznámky (volitelné)</Label>
              <Textarea
                placeholder="Další informace k zakázce..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Zrušit
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!clientName || !description || !dueDate || !price}
            >
              <Plus className="w-4 h-4 mr-2" />
              Vytvořit zakázku
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
