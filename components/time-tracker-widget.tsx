"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, StopCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { getRunningTimeEntry, startTimeEntry, stopTimeEntry } from "@/lib/time-tracking"
import { getAllClients } from "@/lib/clients"
import type { TimeEntry } from "@/lib/time-tracking"
import type { Client } from "@/lib/clients"

export function TimeTrackerWidget() {
  const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null)
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00")
  const [showStartDialog, setShowStartDialog] = useState(false)

  // Start dialog state
  const [description, setDescription] = useState("")
  const [hourlyRate, setHourlyRate] = useState("1000")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    setRunningEntry(getRunningTimeEntry())
    setClients(getAllClients())
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

  const handleStart = async () => {
    if (!description || !hourlyRate) {
      alert("Vyplň popis a hodinovou sazbu")
      return
    }

    try {
      const entry = startTimeEntry(description, parseFloat(hourlyRate), selectedClient?.id)
      setRunningEntry(entry)
      setShowStartDialog(false)
      setDescription("")
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
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <>
      {/* Floating Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Card className={`${runningEntry ? "border-green-500 bg-green-50" : "border-border"} shadow-lg`}>
          <CardContent className="p-4">
            {runningEntry ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600 animate-pulse" />
                  <span className="font-mono text-xl font-semibold">{elapsedTime}</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-[200px] truncate">{runningEntry.description}</p>
                <Button onClick={handleStop} variant="destructive" className="w-full">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Zastavit
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowStartDialog(true)} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Spustit timer
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spustit časomíru</DialogTitle>
            <DialogDescription>Zaznamenej práci pro klienta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Co děláš?</Label>
              <Input
                id="description"
                placeholder="např. Vývoj smlouvy, Konzultace..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="client">Klient (volitelné)</Label>
              <select
                id="client"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedClient?.id || ""}
                onChange={(e) => {
                  const client = clients.find((c) => c.id === e.target.value)
                  setSelectedClient(client || null)
                }}
              >
                <option value="">Žádný klient</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="hourlyRate">Hodinová sazba (Kč/hod)</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="1000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            <Button onClick={handleStart} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Spustit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
