"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Bell,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { type Invoice, formatCurrency } from "@/lib/cash-flow"

interface InvoiceReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

export function InvoiceReminderDialog({
  open,
  onOpenChange,
  invoice,
}: InvoiceReminderDialogProps) {
  const [reminderDays, setReminderDays] = useState("3")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!invoice) return null

  const dueDate = new Date(invoice.dueDate)
  const reminderDate = new Date(dueDate)
  reminderDate.setDate(reminderDate.getDate() - parseInt(reminderDays))

  const isOverdue = dueDate < new Date()

  const handleAddToCalendar = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Check if Google Calendar is authorized
      const authResponse = await fetch("/api/calendar/auth")
      const authData = await authResponse.json()

      if (!authData.isAuthorized) {
        // Open Google Calendar authorization
        window.location.href = `/api/calendar/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`
        return
      }

      // Calculate reminder date
      const eventDate = new Date(dueDate)
      eventDate.setDate(eventDate.getDate() - parseInt(reminderDays))

      // Add event to calendar
      const response = await fetch("/api/calendar/add-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: [
            {
              summary: `💰 Splatnost faktury: ${invoice.from}`,
              description: `Faktura: ${invoice.from}\nČástka: ${formatCurrency(invoice.amount)}\nSplatnost: ${dueDate.toLocaleDateString("cs-CZ")}\n${invoice.description || ""}`,
              date: eventDate.toISOString().split("T")[0],
              isReminder: true,
            },
          ],
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: `Připomenutí bylo přidáno do kalendáře na ${eventDate.toLocaleDateString("cs-CZ")}`,
        })
      } else {
        throw new Error(data.error || "Nepodařilo se přidat událost")
      }
    } catch (error) {
      console.error("Calendar error:", error)
      setResult({
        success: false,
        message: "Nepodařilo se přidat připomenutí. Zkuste to znovu.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Připomenutí splatnosti faktury - ${invoice.from}`)
    const body = encodeURIComponent(
      `Dobrý den,\n\nchtěl bych vám připomenout splatnost faktury:\n\n` +
      `Od: ${invoice.from}\n` +
      `Částka: ${formatCurrency(invoice.amount)}\n` +
      `Splatnost: ${dueDate.toLocaleDateString("cs-CZ")}\n` +
      `${invoice.description ? `Popis: ${invoice.description}\n` : ""}` +
      `\nDěkuji za platbu.\n\nS pozdravem`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Připomenutí splatnosti</DialogTitle>
              <DialogDescription>Nastavte upozornění na blížící se splatnost</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Invoice Info */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Faktura od:</span>
            <span className="font-medium">{invoice.from}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Částka:</span>
            <span className={`font-bold ${invoice.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(invoice.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Splatnost:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{dueDate.toLocaleDateString("cs-CZ")}</span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">Po splatnosti</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        {!isOverdue && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Připomenout před splatností:</Label>
              <RadioGroup value={reminderDays} onValueChange={setReminderDays}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1" className="font-normal cursor-pointer">1 den</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3" className="font-normal cursor-pointer">3 dny</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7" id="r7" />
                    <Label htmlFor="r7" className="font-normal cursor-pointer">7 dní</Label>
                  </div>
                </div>
              </RadioGroup>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="custom" id="rcustom" />
                <Label htmlFor="rcustom" className="font-normal cursor-pointer">Vlastní:</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  className="w-20 h-8"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">dní</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <Calendar className="w-4 h-4 inline mr-2 text-blue-600" />
              Připomenutí bude nastaveno na: <strong>{reminderDate.toLocaleDateString("cs-CZ")}</strong>
            </div>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {result.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSendEmail} className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Poslat upomínku e-mailem
          </Button>
          <Button onClick={handleAddToCalendar} disabled={isLoading || isOverdue} className="flex-1">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            {isOverdue ? "Faktura je po splatnosti" : "Přidat do Google Calendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
