"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, CircleStop, Timer, Trash2, Banknote, FileStack, Plus, UsersRound, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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
import { SkeletonTimeTracking } from "@/components/ui/skeleton"

export default function TimeTrackingPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00")
  const [clients, setClients] = useState<Client[]>([])
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    setIsLoading(false)
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

    const totalAmount = unbilled.reduce((sum, e) => {
      const hours = (e.durationMinutes || 0) / 60
      return sum + hours * (e.hourlyRate || 0)
    }, 0)

    const descriptions = unbilled.map(e => e.description).filter(d => d)
    const uniqueDescriptions = [...new Set(descriptions)]
    const detailedDescription = uniqueDescriptions.length > 0
      ? uniqueDescriptions.join(", ")
      : `Práce za ${unbilled.length} ${unbilled.length === 1 ? "záznam" : unbilled.length <= 4 ? "záznamy" : "záznamů"}`

    const clientIds = unbilled.map(e => e.clientId).filter(id => id)
    const uniqueClientIds = [...new Set(clientIds)]
    const clientId = uniqueClientIds.length === 1 ? uniqueClientIds[0] : undefined

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

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonTimeTracking />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto flex gap-6">
        {/* Client Sidebar */}
        <div className={`transition-all duration-200 ${showClientSidebar ? "w-56" : "w-10"} flex-shrink-0`}>
          <div className="sticky top-6 p-3 bg-card border border-border rounded-md">
            <div className="flex items-center justify-between mb-3">
              {showClientSidebar && (
                <div className="flex items-center gap-2">
                  <UsersRound className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Klienti</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClientSidebar(!showClientSidebar)}
                className="h-7 w-7 p-0"
              >
                {showClientSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
            {showClientSidebar && (
              <div className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                <Button
                  variant={selectedSidebarClientId === null ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-7"
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
                    className="w-full justify-start text-xs h-7 truncate"
                    onClick={() => handleSidebarClientClick(client.id)}
                  >
                    {client.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                  <Timer className="w-6 h-6 text-primary" strokeWidth={1.75} />
                  Time Tracking
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Evidence práce a vyfakturování hodin
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowManualDialog(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Přidat čas ručně
              </Button>
            </div>
          </header>

          {/* Stats Cards */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-primary" />
                <p className="metric-label mb-1">Tento měsíc</p>
                <p className="metric-value">{stats.totalHoursThisMonth}h</p>
                <p className="text-xs text-muted-foreground">Celkem odpracováno</p>
              </div>
              <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-success" />
                <p className="metric-label mb-1">Fakturovatelné</p>
                <p className="metric-value">{stats.billableHoursThisMonth}h</p>
                <p className="text-xs text-muted-foreground">K vyfakturování</p>
              </div>
              <div className="relative p-4 bg-card border border-border rounded-md overflow-hidden stagger-item">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-warning" />
                <p className="metric-label mb-1">Nevyfakturováno</p>
                <p className="metric-value">{stats.unbilledRevenue.toLocaleString("cs-CZ")} Kč</p>
                <p className="text-xs text-muted-foreground">Potenciální příjem</p>
              </div>
            </div>
          </section>

          {/* Timer Section */}
          <section className={`p-4 bg-card border rounded-md ${runningEntry ? "border-success/50" : "border-border"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {runningEntry ? "Časomíra běží" : "Spustit časomíru"}
              </span>
            </div>

            {runningEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Popis</p>
                    <p className="text-sm font-medium">{runningEntry.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Uplynulý čas</p>
                    <p className="text-2xl font-mono font-bold text-success tabular-nums">{elapsedTime}</p>
                  </div>
                </div>
                <Button onClick={handleStop} variant="destructive" size="sm" className="w-full">
                  <CircleStop className="w-4 h-4 mr-1.5" />
                  Zastavit
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="description" className="text-xs font-medium">Co děláš?</Label>
                    <Input
                      id="description"
                      placeholder="např. Vývoj smlouvy, Konzultace..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="client" className="text-xs font-medium">Klient</Label>
                    <select
                      id="client"
                      className="mt-1 flex h-9 w-full rounded border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      value={selectedClientId}
                      onChange={(e) => {
                        const clientId = e.target.value
                        setSelectedClientId(clientId)
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
                    <Label htmlFor="contract" className="text-xs font-medium">Smlouva (volitelné)</Label>
                    <select
                      id="contract"
                      className="mt-1 flex h-9 w-full rounded border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                      value={selectedContractId}
                      onChange={(e) => setSelectedContractId(e.target.value)}
                      disabled={!selectedClientId}
                    >
                      <option value="">Žádná smlouva</option>
                      {contracts
                        .filter((c) => {
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
                    <Label htmlFor="hourlyRate" className="text-xs font-medium">Hodinová sazba (Kč/hod)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="1000"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={handleStart} size="sm" className="w-full">
                  <Play className="w-4 h-4 mr-1.5" />
                  Spustit časomíru
                </Button>
              </div>
            )}
          </section>

          {/* Unbilled Summary */}
          {stats.unbilledRevenue > 0 && (
            <section className="p-4 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Připraveno k vyfakturování</p>
                  <p className="text-xs text-muted-foreground">Nevyfakturované hodiny v hodnotě {stats.unbilledRevenue.toLocaleString("cs-CZ")} Kč</p>
                </div>
                <Button onClick={handleGenerateInvoice} size="sm">
                  <FileStack className="w-4 h-4 mr-1.5" />
                  Vystavit fakturu
                </Button>
              </div>
            </section>
          )}

          {/* Entries List */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Historie záznamů</h2>
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {entries.filter((e) => e.durationMinutes).length}
              </Badge>
            </div>

            <div className="space-y-2">
              {entries
                .filter((e) => e.durationMinutes)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3.5 bg-card border border-border rounded-md clickable-row stagger-item"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{entry.description}</p>
                        {entry.invoiceId && <Badge variant="secondary">Vyfakturováno</Badge>}
                        {!entry.invoiceId && entry.billable && <Badge variant="default">K vyúčtování</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(entry.createdAt).toLocaleDateString("cs-CZ")}</span>
                        <span>Klient: {getClientName(entry.clientId)}</span>
                        {entry.contractId && <span>Smlouva: {getContractName(entry.contractId)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold tabular-nums">{formatDuration(entry.durationMinutes || 0)}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {entry.hourlyRate} Kč/h = {Math.round(((entry.durationMinutes || 0) / 60) * (entry.hourlyRate || 0))} Kč
                        </p>
                      </div>
                      {!entry.invoiceId && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

              {entries.filter((e) => e.durationMinutes).length === 0 && (
                <div className="text-center py-12 bg-card border border-border rounded-md">
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mx-auto mb-3">
                    <Timer className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-muted-foreground">Zatím žádné záznamy. Spusť časomíru a začni tracovat svou práci!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Manual Entry Dialog */}
        <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Přidat čas ručně</DialogTitle>
              <DialogDescription>Zaznamenej odpracovanou dobu bez spuštění časomíry</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="manualDescription" className="text-xs font-medium">Co jsi dělal?</Label>
                <Input
                  id="manualDescription"
                  placeholder="např. Vývoj smlouvy, Konzultace..."
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="manualHours" className="text-xs font-medium">Hodiny</Label>
                  <Input
                    id="manualHours"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualMinutes" className="text-xs font-medium">Minuty</Label>
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

              <div className="space-y-2">
                <Label htmlFor="manualClient" className="text-xs font-medium">Klient (volitelné)</Label>
                <select
                  id="manualClient"
                  className="flex h-9 w-full rounded border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  value={manualClientId}
                  onChange={(e) => {
                    const clientId = e.target.value
                    setManualClientId(clientId)
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

              <div className="space-y-2">
                <Label htmlFor="manualContract" className="text-xs font-medium">Smlouva (volitelné)</Label>
                <select
                  id="manualContract"
                  className="flex h-9 w-full rounded border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
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

              <div className="space-y-2">
                <Label htmlFor="manualHourlyRate" className="text-xs font-medium">Hodinová sazba (Kč/hod)</Label>
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
              <Button variant="outline" size="sm" onClick={() => setShowManualDialog(false)}>
                Zrušit
              </Button>
              <Button size="sm" onClick={handleManualEntry}>
                <Plus className="w-4 h-4 mr-1.5" />
                Přidat záznam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
