"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Building2, User, Phone, Mail, FileText, Receipt, Home } from "lucide-react"
import Link from "next/link"
import { getAllClients, searchClients, getClientHistory, type Client } from "@/lib/clients"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = () => {
    setIsLoading(true)
    const allClients = getAllClients()
    setClients(allClients)
    setIsLoading(false)
  }

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    return searchClients(searchQuery)
  }, [clients, searchQuery])

  // Calculate stats for each client
  const clientStats = useMemo(() => {
    const stats: Record<string, { contracts: number; unpaidInvoices: number; totalOwed: number }> = {}

    filteredClients.forEach((client) => {
      const history = getClientHistory(client.id)
      const unpaidInvoices = history.invoices.filter((inv) => !inv.isPaid)
      const totalOwed = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

      stats[client.id] = {
        contracts: history.contracts.length,
        unpaidInvoices: unpaidInvoices.length,
        totalOwed,
      }
    })

    return stats
  }, [filteredClients])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Načítání klientů...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Klienti</h1>
            <p className="text-muted-foreground mt-1">Adresář všech vašich obchodních kontaktů</p>
          </div>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nový klient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Hledat podle jména, IČO nebo kontaktní osoby..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Celkem klientů</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">S aktivními smlouvami</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(clientStats).filter((s) => s.contracts > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">S nezaplacenými fakturami</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(clientStats).filter((s) => s.unpaidInvoices > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Žádní klienti nenalezeni" : "Zatím nemáte žádné klienty"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? "Zkuste upravit vyhledávací dotaz"
                : "Klienti se automaticky vytvoří při sepsání smluv, nebo je můžete přidat ručně"}
            </p>
            {!searchQuery && (
              <Link href="/clients/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat prvního klienta
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const stats = clientStats[client.id]
            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{client.name}</CardTitle>
                        {client.ico && (
                          <p className="text-sm text-muted-foreground">IČO: {client.ico}</p>
                        )}
                      </div>
                      {client.source === "ares" ? (
                        <Badge variant="outline" className="shrink-0">
                          ARES
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          Manuální
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Address */}
                    {(client.street || client.city) && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {client.street}
                          {client.street && <br />}
                          {client.zip} {client.city}
                        </p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {client.contactPerson && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{client.contactPerson}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{stats.contracts}</span>
                        <span className="text-muted-foreground">
                          {stats.contracts === 1 ? "smlouva" : stats.contracts < 5 ? "smlouvy" : "smluv"}
                        </span>
                      </div>
                      {stats.unpaidInvoices > 0 && (
                        <div className="flex items-center gap-1 text-sm text-orange-600">
                          <Receipt className="w-4 h-4" />
                          <span className="font-medium">{stats.unpaidInvoices}</span>
                          <span>
                            {stats.unpaidInvoices === 1
                              ? "nezaplacená"
                              : stats.unpaidInvoices < 5
                                ? "nezaplacené"
                                : "nezaplacených"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overdue amount */}
                    {stats.totalOwed > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-md p-2">
                        <p className="text-sm font-semibold text-orange-800">
                          Dluh: {stats.totalOwed.toLocaleString("cs-CZ")} Kč
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
