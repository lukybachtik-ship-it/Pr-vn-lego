"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, Building2 } from "lucide-react"
import { getAllClients, searchClients, type Client } from "@/lib/clients"

interface ClientSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (client: Client) => void
}

export function ClientSelector({ open, onOpenChange, onSelect }: ClientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const clients = useMemo(() => getAllClients(), [])

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients
    return searchClients(searchQuery)
  }, [clients, searchQuery])

  const handleSelect = (client: Client) => {
    onSelect(client)
    onOpenChange(false)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Vybrat z kontaktů</DialogTitle>
        </DialogHeader>

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

        {/* Client List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery ? "Žádní klienti nenalezeni" : "Zatím nemáte žádné klienty"}
              </p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelect(client)}
                className="w-full text-left p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{client.name}</h4>
                      {client.source === "ares" ? (
                        <Badge variant="outline" className="text-xs">
                          ARES
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Manuální
                        </Badge>
                      )}
                    </div>
                    {client.ico && <p className="text-sm text-muted-foreground mb-2">IČO: {client.ico}</p>}
                    <div className="text-sm text-muted-foreground space-y-1">
                      {(client.street || client.city) && (
                        <p>
                          {client.street}
                          {client.street && client.city && ", "}
                          {client.zip} {client.city}
                        </p>
                      )}
                      {client.contactPerson && (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>{client.contactPerson}</span>
                          {client.phone && <span>• {client.phone}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
