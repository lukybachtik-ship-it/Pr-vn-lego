"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
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
  Home,
} from "lucide-react"
import Link from "next/link"
import { getClient, saveClient, deleteClient, getClientHistory, type Client } from "@/lib/clients"

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Načítání klienta...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Klient nebyl nalezen</AlertDescription>
        </Alert>
        <Link href="/clients">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na seznam klientů
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" title="Domů">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="ghost" size="icon" title="Zpět na klienty">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              {client.source === "ares" ? (
                <Badge variant="outline">ARES</Badge>
              ) : (
                <Badge variant="secondary">Manuální</Badge>
              )}
            </div>
            {client.ico && <p className="text-muted-foreground mt-1">IČO: {client.ico}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Upravit
              </Button>
              <Button onClick={handleDelete} variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} variant="default">
                <Save className="w-4 h-4 mr-2" />
                Uložit
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setEditedClient(client)
                }}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Zrušit
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Základní údaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              {(client.street || client.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="text-sm">
                    {client.street && <p>{client.street}</p>}
                    <p>
                      {client.zip} {client.city}
                    </p>
                    {client.region && <p className="text-muted-foreground">{client.region}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Kontaktní údaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kontaktní osoba</label>
                    <Input
                      placeholder="např. Jan Novák"
                      value={editedClient.contactPerson || ""}
                      onChange={(e) =>
                        setEditedClient({
                          ...editedClient,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Telefon</label>
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
                    <label className="text-sm font-medium mb-2 block">Email</label>
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
                </>
              ) : (
                <>
                  {client.contactPerson ? (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{client.contactPerson}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Kontaktní osoba není vyplněna</p>
                  )}
                  {client.phone ? (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Telefon není vyplněn</p>
                  )}
                  {client.email ? (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${client.email}`} className="text-sm hover:underline truncate">
                        {client.email}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Email není vyplněn</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Poznámky</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  placeholder="Interní poznámky o klientovi..."
                  value={editedClient.notes || ""}
                  onChange={(e) =>
                    setEditedClient({
                      ...editedClient,
                      notes: e.target.value,
                    })
                  }
                  rows={4}
                />
              ) : client.notes ? (
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Žádné poznámky</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contracts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Smlouvy ({history?.contracts.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history && history.contracts.length > 0 ? (
                <div className="space-y-3">
                  {history.contracts.map((contract) => (
                    <Link key={contract.id} href={`/contract/${contract.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{contract.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {contract.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Vytvořeno: {new Date(contract.createdAt).toLocaleDateString("cs-CZ")}
                          </p>
                        </div>
                        <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                          {contract.status === "active" ? "Aktivní" : "Dokončeno"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Žádné smlouvy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Faktury ({history?.invoices.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history && history.invoices.length > 0 ? (
                <div className="space-y-3">
                  {history.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold">{invoice.amount.toLocaleString("cs-CZ")} Kč</h4>
                          <Badge variant={invoice.type === "income" ? "default" : "secondary"}>
                            {invoice.type === "income" ? "Příjem" : "Výdaj"}
                          </Badge>
                          {invoice.isPaid ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Zaplaceno
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Nezaplaceno
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Splatnost: {new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}
                        </p>
                        {invoice.description && (
                          <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Žádné faktury</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
