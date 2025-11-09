"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import type { ContractDeadline } from "@/lib/contract-timeline"

interface CalendarExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deadlines: ContractDeadline[]
  contractId: string
  contractName: string
}

export function CalendarExportDialog({
  open,
  onOpenChange,
  deadlines,
  contractId,
  contractName,
}: CalendarExportDialogProps) {
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([])
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // Check for stored access token
    const stored = localStorage.getItem("google_calendar_token")
    if (stored) {
      setAccessToken(stored)
    }

    // Select all deadlines by default
    setSelectedDeadlines(deadlines.map((d) => d.id))
  }, [deadlines])

  useEffect(() => {
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search)
    const token = params.get("access_token")
    const success = params.get("calendar_success")

    if (success === "true" && token) {
      localStorage.setItem("google_calendar_token", token)
      setAccessToken(token)
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleAuth = () => {
    setIsAuthenticating(true)
    window.location.href = "/api/calendar/auth"
  }

  const handleExport = async () => {
    if (!accessToken) {
      handleAuth()
      return
    }

    setIsExporting(true)
    setExportResult(null)

    try {
      const events = deadlines
        .filter((d) => selectedDeadlines.includes(d.id))
        .map((d) => {
          const dateObj = typeof d.date === "string" ? new Date(d.date) : d.date
          const dateStr = dateObj.toISOString().split("T")[0] // YYYY-MM-DD format
          return {
            title: `${d.isPast ? "⚠️ PO TERMÍNU: " : d.isUpcoming ? "🔔 BLÍŽÍ SE: " : "📅 "}${d.title} - ${contractName}`,
            description: `Termín ze smlouvy: ${contractName}\\n\\n${d.description || ""}\\n\\nZobrazit smlouvu: ${window.location.origin}/contract/${contractId}`,
            date: dateStr,
          }
        })

      const response = await fetch("/api/calendar/add-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, events }),
      })

      const data = await response.json()

      if (data.success) {
        const failedCount = data.totalCount - data.successCount
        if (failedCount > 0) {
          console.error("Some events failed:", data.results.filter((r: any) => !r.success))
          setExportResult({
            success: true,
            message: `⚠️ Přidáno ${data.successCount} z ${data.totalCount} termínů (${failedCount} selhalo)`,
          })
        } else {
          setExportResult({
            success: true,
            message: `✅ Přidáno ${data.successCount} z ${data.totalCount} termínů do kalendáře`,
          })
        }
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
      } else {
        console.error("Export failed:", data)
        setExportResult({
          success: false,
          message: `❌ Chyba: ${data.error || "Nepodařilo se přidat termíny"}`,
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      setExportResult({
        success: false,
        message: "❌ Chyba při komunikaci s kalendářem",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleDeadline = (id: string) => {
    setSelectedDeadlines((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Přidat termíny do Google Kalendáře
          </DialogTitle>
          <DialogDescription>
            {accessToken
              ? `Vyberte termíny, které chcete přidat do kalendáře (${selectedDeadlines.length} vybráno):`
              : "Pro přidání termínů do kalendáře se musíte nejdříve přihlásit k Google účtu."}
          </DialogDescription>
        </DialogHeader>

        {!accessToken ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-6">
              Přístup k vašemu kalendáři používáme pouze pro přidání termínů. Data neopouštějí vaše zařízení.
            </p>
            <Button onClick={handleAuth} disabled={isAuthenticating} size="lg">
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Přesměrování...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Přihlásit se k Google
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
              {deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <Checkbox
                    checked={selectedDeadlines.includes(deadline.id)}
                    onCheckedChange={() => toggleDeadline(deadline.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(deadline.date)}</p>
                    {deadline.isPast && <p className="text-xs text-destructive mt-1">⚠️ Po termínu</p>}
                    {deadline.isUpcoming && !deadline.isPast && (
                      <p className="text-xs text-yellow-600 mt-1">🔔 Blíží se (za {deadline.daysUntil} dnů)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {exportResult && (
              <div
                className={`p-4 rounded-lg flex items-center gap-2 ${exportResult.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
              >
                {exportResult.success ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm">{exportResult.message}</p>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Zrušit
          </Button>
          {accessToken && (
            <Button onClick={handleExport} disabled={isExporting || selectedDeadlines.length === 0}>
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Přidávám...
                </>
              ) : (
                `Potvrdit přidání (${selectedDeadlines.length})`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
