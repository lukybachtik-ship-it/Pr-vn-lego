"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Building2, Phone, Mail, FileStack, Receipt, UsersRound } from "lucide-react"
import Link from "next/link"
import { getAllClients, searchClients, getClientHistory, type Client } from "@/lib/clients"
import { AppLayout } from "@/components/app-layout"
import { SkeletonClients } from "@/components/ui/skeleton"

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
      <AppLayout>
        <SkeletonClients />
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
                <UsersRound className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Klienti
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Adresář všech vašich obchodních kontaktů
              </p>
            </div>
            <Link href="/clients/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Nový klient
              </Button>
            </Link>
          </div>
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Hledat podle jména, IČO nebo kontaktní osoby..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-primary" />
              <p className="metric-label mb-1">Celkem klientů</p>
              <p className="metric-value">{clients.length}</p>
            </div>
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-success" />
              <p className="metric-label mb-1">S aktivními smlouvami</p>
              <p className="metric-value">{Object.values(clientStats).filter((s) => s.contracts > 0).length}</p>
            </div>
            <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
              <div className="absolute top-0 left-0 w-0.5 h-full bg-warning" />
              <p className="metric-label mb-1">S nezaplacenými fakturami</p>
              <p className="metric-value">{Object.values(clientStats).filter((s) => s.unpaidInvoices > 0).length}</p>
            </div>
          </div>
        </section>

        {/* Client List */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Seznam klientů</h2>
            <Badge variant="secondary" className="text-[10px] px-1.5">{filteredClients.length}</Badge>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-md">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {searchQuery ? "Žádní klienti nenalezeni" : "Zatím nemáte žádné klienty"}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery
                  ? "Zkuste upravit vyhledávací dotaz"
                  : "Klienti se automaticky vytvoří při sepsání smluv, nebo je můžete přidat ručně"}
              </p>
              {!searchQuery && (
                <Link href="/clients/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Přidat prvního klienta
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => {
                const stats = clientStats[client.id]
                return (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <div className="interactive-card p-4 bg-card border border-border rounded-md hover:border-border/80 hover:bg-muted/30 cursor-pointer h-full stagger-item">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">{client.name}</h3>
                          {client.ico && (
                            <p className="text-xs text-muted-foreground">IČO: {client.ico}</p>
                          )}
                        </div>
                        {client.ico && (
                          <Badge variant="outline" className="ml-2 shrink-0">
                            IČO
                          </Badge>
                        )}
                      </div>

                      {/* Address */}
                      {(client.street || client.city) && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {client.street && <>{client.street}<br /></>}
                          {client.zip} {client.city}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-1 mb-3">
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 pt-3 border-t border-border/60 text-xs">
                        <div className="flex items-center gap-1">
                          <FileStack className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">{stats.contracts}</span>
                          <span className="text-muted-foreground">
                            {stats.contracts === 1 ? "smlouva" : stats.contracts < 5 ? "smlouvy" : "smluv"}
                          </span>
                        </div>
                        {stats.unpaidInvoices > 0 && (
                          <div className="flex items-center gap-1 text-warning">
                            <Receipt className="w-3 h-3" />
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
                        <div className="mt-2 p-2 bg-warning/5 border border-warning/20 rounded text-xs">
                          <p className="font-medium text-warning">
                            Dluh: {stats.totalOwed.toLocaleString("cs-CZ")} Kč
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
