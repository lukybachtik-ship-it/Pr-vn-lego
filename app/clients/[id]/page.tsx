"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  FileText,
  Receipt,
  CheckCircle,
  AlertCircle,
  Trash2,
  Banknote,
} from "lucide-react"
import Link from "next/link"
import { getClient, saveClient, deleteClient, getClientHistory, type Client } from "@/lib/clients"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton component for this page
function SkeletonClientDetail() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-md stagger-item">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-md stagger-item">
              <Skeleton className="h-5 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 w-full rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [history, setHistory] = useState<ReturnType<typeof getClientHistory> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedClient, setEditedClient] = useState<Partial<Client>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClient()
  }, [clientId])

  const loadClient = () => {
    setIsLoading(true)
    const clientData = getClient(clientId)
    if (clientData) {
      setClient(clientData)
      setEditedClient(clientData)
      const historyData = getClientHistory(clientId)
      setHistory(historyData)
    }
    setIsLoading(false)
  }

  const handleSave = () => {
    if (!client) return

    const updated = saveClient({
      ...client,
      ...editedClient,
    })

    setClient(updated)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!confirm("Opravdu chcete smazat tohoto klienta? Tato akce je nevratná.")) return

    deleteClient(clientId)
    router.push("/clients")
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonClientDetail />
      </AppLayout>
    )
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Klient nebyl nalezen</AlertDescription>
          </Alert>
          <Link href="/clients">
            <Button variant="outline" size="sm">
              Zpět na seznam klientů
            </Button>
          </Link>
        </div>
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
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {client.name}
                </h1>
                {client.ico ? (
                  <Badge variant="outline">IČO: {client.ico}</Badge>
                ) : (
                  <Badge variant="secondary">Manuální</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Detail klienta a historie spolupráce
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                    Upravit
                  </Button>
                  <Button onClick={handleDelete} variant="destructive" size="icon-sm">
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                    Uložit
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedClient(client)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                    Zrušit
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Basic Info */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Základní údaje</h3>
              </div>
              {(client.street || client.city) ? (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" strokeWidth={1.75} />
                  <div className="text-sm">
                    {client.street && <p>{client.street}</p>}
                    <p className="text-muted-foreground">
                      {client.zip} {client.city}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Adresa není vyplněna</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Kontaktní údaje</h3>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Telefon</label>
                    <Input
                      placeholder="např. +420 777 123 456"
                      value={editedClient.phone || ""}
                      onChange={(e) =>
                        setEditedClient({
                          ...editedClient,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      placeholder="např. jan.novak@firma.cz"
                      value={editedClient.email || ""}
                      onChange={(e) =>
                        setEditedClient({
                          ...editedClient,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.phone ? (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                      <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Telefon není vyplněn</p>
                  )}
                  {client.email ? (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                      <a href={`mailto:${client.email}`} className="text-sm hover:underline truncate">
                        {client.email}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Email není vyplněn</p>
                  )}
                </div>
              )}
            </div>

            {/* Billing Configuration */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item">
              <div className="flex items-center gap-2 mb-4">
                <Banknote className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Fakturace</h3>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Výchozí hodinová sazba (Kč/h)
                    </label>
                    <Input
                      type="number"
                      placeholder="např. 1000"
                      value={editedClient.defaultHourlyRate || ""}
                      onChange={(e) =>
                        setEditedClient({
                          ...editedClient,
                          defaultHourlyRate: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Typ fakturace</label>
                    <Select
                      value={editedClient.billingType || ""}
                      onValueChange={(value) =>
                        setEditedClient({
                          ...editedClient,
                          billingType: value as "hourly" | "flat" | undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hodinová sazba</SelectItem>
                        <SelectItem value="flat">Paušál</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Hodinová sazba</p>
                    {client.defaultHourlyRate ? (
                      <p className="text-sm font-semibold">{client.defaultHourlyRate.toLocaleString("cs-CZ")} Kč/h</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Není nastavena</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Typ fakturace</p>
                    {client.billingType ? (
                      <Badge variant="outline">
                        {client.billingType === "hourly" ? "Hodinová sazba" : "Paušál"}
                      </Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Není nastaven</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contracts */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Smlouvy</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {history?.contracts.length || 0}
                </Badge>
              </div>
              {history && history.contracts.length > 0 ? (
                <div className="space-y-2">
                  {history.contracts.map((contract, index) => (
                    <Link key={contract.id} href={`/contract/${contract.id}`}>
                      <div className={`flex items-center justify-between p-3 border border-border rounded-md clickable-row stagger-item`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-medium truncate">{contract.name}</h4>
                            <Badge variant="outline" className="text-[10px]">
                              {contract.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(contract.createdAt).toLocaleDateString("cs-CZ")}
                          </p>
                        </div>
                        <Badge variant={contract.status === "active" ? "default" : "secondary"} className="text-xs">
                          {contract.status === "active" ? "Aktivní" : "Dokončeno"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">Žádné smlouvy</p>
                </div>
              )}
            </div>

            {/* Invoices */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Faktury</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {history?.invoices.length || 0}
                </Badge>
              </div>
              {history && history.invoices.length > 0 ? (
                <div className="space-y-2">
                  {history.invoices.map((invoice, index) => (
                    <div
                      key={invoice.id}
                      className={`flex items-center justify-between p-3 border border-border rounded-md stagger-item`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-semibold tabular-nums">
                            {invoice.amount.toLocaleString("cs-CZ")} Kč
                          </h4>
                          <Badge variant={invoice.type === "income" ? "default" : "secondary"} className="text-[10px]">
                            {invoice.type === "income" ? "Příjem" : "Výdaj"}
                          </Badge>
                          {invoice.isPaid ? (
                            <Badge variant="outline" className="text-[10px] text-success border-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Zaplaceno
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-warning border-warning">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Nezaplaceno
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Splatnost: {new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}
                        </p>
                        {invoice.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{invoice.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">Žádné faktury</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
