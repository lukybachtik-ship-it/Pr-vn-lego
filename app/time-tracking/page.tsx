"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, StopCircle, Clock, Trash2, DollarSign, FileText, Plus, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  getAllTimeEntries,
  getRunningTimeEntry,
  startTimeEntry,
  stopTimeEntry,
  deleteTimeEntry,
  getTimeTrackingStats,
  getUnbilledTimeEntries,
  formatDuration,
  createManualTimeEntry,
} from "@/lib/time-tracking"
import { getAllClients } from "@/lib/clients"
import { getFinalizedContracts } from "@/lib/contract-storage"
import type { TimeEntry } from "@/lib/time-tracking"
import type { Client } from "@/lib/clients"
import type { SavedContract } from "@/lib/contract-storage"
import { AppLayout } from "@/components/app-layout"

export default function TimeTrackingPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00")
  const [clients, setClients] = useState<Client[]>([])
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [stats, setStats] = useState({
    totalHoursThisMonth: 0,
    billableHoursThisMonth: 0,
    unbilledRevenue: 0,
  })

  // Form state
  const [description, setDescription] = useState("")
  const [hourlyRate, setHourlyRate] = useState("1000")
  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedContractId, setSelectedContractId] = useState("")

  // Manual entry dialog state
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [manualDescription, setManualDescription] = useState("")
  const [manualHours, setManualHours] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualHourlyRate, setManualHourlyRate] = useState("1000")
  const [manualClientId, setManualClientId] = useState("")
  const [manualContractId, setManualContractId] = useState("")

  // Client sidebar state
  const [showClientSidebar, setShowClientSidebar] = useState(true)
  const [selectedSidebarClientId, setSelectedSidebarClientId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!runningEntry) return

    const interval = setInterval(() => {
      const start = new Date(runningEntry.startTime)
      const now = new Date()
      const diff = now.getTime() - start.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setElapsedTime(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [runningEntry])

  const loadData = () => {
    setEntries(getAllTimeEntries())
    setRunningEntry(getRunningTimeEntry())
    setClients(getAllClients())
    setContracts(getFinalizedContracts())
    setStats(getTimeTrackingStats())
  }

  const handleSidebarClientClick = (clientId: string) => {
    setSelectedSidebarClientId(clientId)
    setSelectedClientId(clientId)
    // Auto-populate hourly rate from client's default
    const client = clients.find((c) => c.id === clientId)
    if (client?.defaultHourlyRate) {
      setHourlyRate(client.defaultHourlyRate.toString())
    }
  }

  const handleStart = () => {
    if (!description) {
      alert("Vyplň popis práce")
      return
    }

    try {
      const entry = startTimeEntry(
        description,
        parseFloat(hourlyRate),
        selectedClientId || undefined,
        selectedContractId || undefined,
      )
      setRunningEntry(entry)
      setDescription("")
      loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleStop = () => {
    if (!runningEntry) return

    try {
      stopTimeEntry(runningEntry.id)
      setRunningEntry(null)
      setElapsedTime("00:00:00")
      loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = (entryId: string) => {
    if (!confirm("Opravdu smazat tento záznam?")) return
    deleteTimeEntry(entryId)
    loadData()
  }

  const handleManualEntry = () => {
    if (!manualDescription) {
      alert("Vyplň popis práce")
      return
    }

    const hours = parseInt(manualHours) || 0
    const minutes = parseInt(manualMinutes) || 0
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes <= 0) {
      alert("Zadej dobu trvání")
      return
    }

    try {
      createManualTimeEntry(
        manualDescription,
        totalMinutes,
        parseFloat(manualHourlyRate),
        manualClientId || undefined,
        manualContractId || undefined,
      )
      loadData()
      setShowManualDialog(false)
      setManualDescription("")
      setManualHours("")
      setManualMinutes("")
      setManualClientId("")
      setManualContractId("")
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleGenerateInvoice = () => {
    const unbilled = getUnbilledTimeEntries()
    if (unbilled.length === 0) {
      alert("Žádné nevyfakturované hodiny")
      return
    }

    // Navigate to cash-flow with prefilled data
    const totalAmount = unbilled.reduce((sum, e) => {
      const hours = (e.durationMinutes || 0) / 60
      return sum + hours * (e.hourlyRate || 0)
    }, 0)

    // Create detailed description from unbilled entries
    const descriptions = unbilled.map(e => e.description).filter(d => d)
    const uniqueDescriptions = [...new Set(descriptions)]
    const detailedDescription = uniqueDescriptions.length > 0
      ? uniqueDescriptions.join(", ")
      : `Práce za ${unbilled.length} ${unbilled.length === 1 ? "záznam" : unbilled.length <= 4 ? "záznamy" : "záznamů"}`

    // Get first client ID if all entries are for same client
    const clientIds = unbilled.map(e => e.clientId).filter(id => id)
    const uniqueClientIds = [...new Set(clientIds)]
    const clientId = uniqueClientIds.length === 1 ? uniqueClientIds[0] : undefined

    // Get client name if we have one consistent client
    const from = clientId ? getClientName(clientId) : ""

    const params = new URLSearchParams({
      prefill: "time",
      amount: totalAmount.toString(),
      description: detailedDescription,
    })

    if (clientId) {
      params.append("clientId", clientId)
    }
    if (from) {
      params.append("from", from)
    }

    router.push(`/cash-flow?${params.toString()}`)
  }

  const getClientName = (clientId?: string) => {
    if (!clientId) return "-"
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "-"
  }

  const getContractName = (contractId?: string) => {
    if (!contractId) return "-"
    const contract = contracts.find((c) => c.id === contractId)
    return contract?.name || "-"
  }

  return (
    <AppLayout title="Time Tracking" showBack>
      <main className="p-6">
        <div className="max-w-7xl mx-auto flex gap-6">
          {/* Client Sidebar */}
          <div className={`transition-all duration-300 ${showClientSidebar ? "w-64" : "w-12"} flex-shrink-0`}>
            <Card className="sticky top-6 h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {showClientSidebar && (
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      Klienti
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClientSidebar(!showClientSidebar)}
                    className="h-8 w-8 p-0"
                  >
                    {showClientSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              {showClientSidebar && (
                <CardContent className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <Button
                    variant={selectedSidebarClientId === null ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setSelectedSidebarClientId(null)
                      setSelectedClientId("")
                    }}
                  >
                    Všichni
                  </Button>
                  {clients.map((client) => (
                    <Button
                      key={client.id}
                      variant={selectedSidebarClientId === client.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => handleSidebarClientClick(client.id)}
                    >
                      {client.name}
                    </Button>
                  ))}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Time Tracking</h1>
                <p className="text-muted-foreground">Evidence práce a vyfakturování hodin</p>
              </div>
              <Button onClick={() => setShowManualDialog(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Přidat čas ručně
              </Button>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tento měsíc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHoursThisMonth}h</div>
              <p className="text-xs text-muted-foreground">Celkem odpracováno</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fakturovatelné</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.billableHoursThisMonth}h</div>
              <p className="text-xs text-muted-foreground">K vyfakturování</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Nevyfakturováno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unbilledRevenue.toLocaleString("cs-CZ")} Kč</div>
              <p className="text-xs text-muted-foreground">Potenciální příjem</p>
            </CardContent>
          </Card>
        </div>

        {/* Timer Section */}
        <Card className={runningEntry ? "border-green-500 bg-green-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {runningEntry ? "Časomíra běží" : "Spustit časomíru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Popis</p>
                    <p className="font-medium">{runningEntry.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Uplynulý čas</p>
                    <p className="text-3xl font-mono font-bold text-green-600">{elapsedTime}</p>
                  </div>
                </div>
                <Button onClick={handleStop} variant="destructive" className="w-full">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Zastavit
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="description">Co děláš?</Label>
                    <Input
                      id="description"
                      placeholder="např. Vývoj smlouvy, Konzultace..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="client">Klient</Label>
                    <select
                      id="client"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedClientId}
                      onChange={(e) => {
                        const clientId = e.target.value
                        setSelectedClientId(clientId)
                        // Auto-populate hourly rate from client's default
                        if (clientId) {
                          const client = clients.find((c) => c.id === clientId)
                          if (client?.defaultHourlyRate) {
                            setHourlyRate(client.defaultHourlyRate.toString())
                          }
                        }
                      }}
                    >
                      <option value="">Vyberte klienta</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                          {client.defaultHourlyRate && ` (${client.defaultHourlyRate} Kč/h)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="contract">Smlouva (volitelné)</Label>
                    <select
                      id="contract"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedContractId}
                      onChange={(e) => setSelectedContractId(e.target.value)}
                      disabled={!selectedClientId}
                    >
                      <option value="">Žádná smlouva</option>
                      {contracts
                        .filter((c) => {
                          // Filter contracts by selected client
                          const partiesBlock = c.blocks.find((b) => b.templateId === "parties")
                          if (!partiesBlock) return false
                          const client = clients.find((cl) => cl.id === selectedClientId)
                          if (!client) return false
                          return (
                            partiesBlock.data.party1Name === client.name ||
                            partiesBlock.data.party2Name === client.name
                          )
                        })
                        .map((contract) => (
                          <option key={contract.id} value={contract.id}>
                            {contract.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="hourlyRate">Hodinová sazba (Kč/hod)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="1000"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleStart} className="w-full" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Spustit časomíru
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unbilled Summary */}
        {stats.unbilledRevenue > 0 && (
          <Card className="border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Připraveno k vyfakturování</CardTitle>
              <CardDescription>Máš nevyfakturované hodiny v hodnotě {stats.unbilledRevenue.toLocaleString("cs-CZ")} Kč</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateInvoice} className="w-full" variant="default">
                <FileText className="w-4 h-4 mr-2" />
                Vystavit fakturu
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>Historie záznamů</CardTitle>
            <CardDescription>Všechny tvoje time entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries
                .filter((e) => e.durationMinutes)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{entry.description}</p>
                        {entry.invoiceId && <Badge variant="secondary">Vyfakturováno</Badge>}
                        {!entry.invoiceId && entry.billable && <Badge variant="default">K vyúčtování</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(entry.createdAt).toLocaleDateString("cs-CZ")}</span>
                        <span>Klient: {getClientName(entry.clientId)}</span>
                        {entry.contractId && <span>Smlouva: {getContractName(entry.contractId)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-semibold">{formatDuration(entry.durationMinutes || 0)}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.hourlyRate} Kč/h = {Math.round(((entry.durationMinutes || 0) / 60) * (entry.hourlyRate || 0))} Kč
                        </p>
                      </div>
                      {!entry.invoiceId && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

              {entries.filter((e) => e.durationMinutes).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Zatím žádné záznamy. Spusť časomíru a začni tracovat svou práci!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </div>
        </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Přidat čas ručně</DialogTitle>
            <DialogDescription>Zaznamenej odpracovanou dobu bez spuštění časomíry</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="manualDescription">Co jsi dělal?</Label>
              <Input
                id="manualDescription"
                placeholder="např. Vývoj smlouvy, Konzultace..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manualHours">Hodiny</Label>
                <Input
                  id="manualHours"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="manualMinutes">Minuty</Label>
                <Input
                  id="manualMinutes"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="59"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="manualClient">Klient (volitelné)</Label>
              <select
                id="manualClient"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={manualClientId}
                onChange={(e) => {
                  const clientId = e.target.value
                  setManualClientId(clientId)
                  // Auto-populate hourly rate from client's default
                  if (clientId) {
                    const client = clients.find((c) => c.id === clientId)
                    if (client?.defaultHourlyRate) {
                      setManualHourlyRate(client.defaultHourlyRate.toString())
                    }
                  }
                }}
              >
                <option value="">Vyberte klienta</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.defaultHourlyRate && ` (${client.defaultHourlyRate} Kč/h)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="manualContract">Smlouva (volitelné)</Label>
              <select
                id="manualContract"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={manualContractId}
                onChange={(e) => setManualContractId(e.target.value)}
                disabled={!manualClientId}
              >
                <option value="">Žádná smlouva</option>
                {contracts
                  .filter((c) => {
                    if (!manualClientId) return false
                    const partiesBlock = c.blocks.find((b) => b.templateId === "parties")
                    if (!partiesBlock) return false
                    const client = clients.find((cl) => cl.id === manualClientId)
                    if (!client) return false
                    return (
                      partiesBlock.data.party1Name === client.name || partiesBlock.data.party2Name === client.name
                    )
                  })
                  .map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="manualHourlyRate">Hodinová sazba (Kč/hod)</Label>
              <Input
                id="manualHourlyRate"
                type="number"
                placeholder="1000"
                value={manualHourlyRate}
                onChange={(e) => setManualHourlyRate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleManualEntry}>
              <Plus className="w-4 h-4 mr-2" />
              Přidat záznam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </AppLayout>
  )
}
