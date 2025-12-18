"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bell,
  Banknote,
  FileText,
  Building2,
  Heart,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

// Skeleton component
function SkeletonTaxCalendar() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 bg-card border border-border rounded-md">
          <Skeleton className="h-6 w-32 mx-auto mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="p-4 bg-card border border-border rounded-md">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Tax event types for styling
type TaxEventType = "dph" | "dan_prijmu" | "socialni" | "zdravotni" | "pausalni" | "general"

interface TaxEvent {
  id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  type: TaxEventType
  important: boolean
}

// Czech tax calendar 2026 data
const TAX_EVENTS_2026: TaxEvent[] = [
  // Leden
  {
    id: "pausalni-prihlaseni",
    date: "2026-01-12",
    title: "Paušální daň - přihlášení/odhlášení",
    description: "Termín pro přihlášení nebo odhlášení z paušálního režimu pro rok 2026. Kdo chce vstoupit do režimu paušální daně, musí podat přihlášku do tohoto data.",
    type: "pausalni",
    important: true,
  },
  {
    id: "pausalni-platba-01",
    date: "2026-01-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za leden 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "dph-q4-2025",
    date: "2026-01-26",
    title: "DPH - přiznání za Q4 2025",
    description: "Podání přiznání k DPH za 4. čtvrtletí 2025 a úhrada daně. Také kontrolní hlášení a souhrnné hlášení.",
    type: "dph",
    important: true,
  },
  {
    id: "socialni-zaloha-01",
    date: "2026-01-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za leden 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-01",
    date: "2026-01-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za leden 2026",
    type: "zdravotni",
    important: false,
  },
  // Únor
  {
    id: "silnicni-dan-2025",
    date: "2026-02-02",
    title: "Silniční daň - přiznání za 2025",
    description: "Podání daňového přiznání k silniční dani za rok 2025 a úhrada daně",
    type: "general",
    important: false,
  },
  {
    id: "pausalni-platba-02",
    date: "2026-02-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za únor 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-02",
    date: "2026-02-28",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za únor 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-02",
    date: "2026-02-28",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za únor 2026",
    type: "zdravotni",
    important: false,
  },
  // Březen
  {
    id: "zaloha-dan-q1",
    date: "2026-03-16",
    title: "Záloha na daň z příjmů Q1",
    description: "Čtvrtletní záloha na daň z příjmů pro poplatníky s poslední známou daňovou povinností nad 150 000 Kč",
    type: "dan_prijmu",
    important: false,
  },
  {
    id: "pausalni-platba-03",
    date: "2026-03-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za březen 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-03",
    date: "2026-03-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za březen 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-03",
    date: "2026-03-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za březen 2026",
    type: "zdravotni",
    important: false,
  },
  // Duben
  {
    id: "dan-prijmu-2025",
    date: "2026-04-01",
    title: "Daň z příjmů - přiznání za 2025",
    description: "Podání daňového přiznání za rok 2025 a úhrada daně (papírová forma). Elektronicky je termín 2. května 2026.",
    type: "dan_prijmu",
    important: true,
  },
  {
    id: "prehled-cssz-2025-zakladni",
    date: "2026-04-30",
    title: "Přehled ČSSZ za 2025 (základní termín)",
    description: "Podání přehledu o příjmech a výdajích OSVČ pro ČSSZ za rok 2025, pokud nepoužíváte daňového poradce",
    type: "socialni",
    important: true,
  },
  {
    id: "prehled-zp-2025-zakladni",
    date: "2026-04-30",
    title: "Přehled zdravotní pojišťovně za 2025",
    description: "Podání přehledu o příjmech a výdajích OSVČ pro zdravotní pojišťovnu za rok 2025",
    type: "zdravotni",
    important: true,
  },
  {
    id: "pausalni-platba-04",
    date: "2026-04-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za duben 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "dph-q1-2026",
    date: "2026-04-27",
    title: "DPH - přiznání za Q1 2026",
    description: "Podání přiznání k DPH za 1. čtvrtletí 2026 a úhrada daně. Také kontrolní hlášení.",
    type: "dph",
    important: true,
  },
  {
    id: "socialni-zaloha-04",
    date: "2026-04-30",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za duben 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-04",
    date: "2026-04-30",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za duben 2026",
    type: "zdravotni",
    important: false,
  },
  // Květen
  {
    id: "dan-prijmu-2025-elektronicky",
    date: "2026-05-04",
    title: "Daň z příjmů - elektronické podání",
    description: "Podání daňového přiznání za rok 2025 elektronicky (datová schránka, EPO) a úhrada daně",
    type: "dan_prijmu",
    important: true,
  },
  {
    id: "pausalni-platba-05",
    date: "2026-05-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za květen 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-05",
    date: "2026-05-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za květen 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-05",
    date: "2026-05-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za květen 2026",
    type: "zdravotni",
    important: false,
  },
  // Červen
  {
    id: "dan-nemovitosti-1",
    date: "2026-06-01",
    title: "Daň z nemovitostí - 1. splátka",
    description: "Splatnost 1. splátky daně z nemovitých věcí (nebo celé daně do 5000 Kč)",
    type: "general",
    important: false,
  },
  {
    id: "zaloha-dan-q2",
    date: "2026-06-15",
    title: "Záloha na daň z příjmů Q2",
    description: "Čtvrtletní nebo pololetní záloha na daň z příjmů",
    type: "dan_prijmu",
    important: false,
  },
  {
    id: "pausalni-platba-06",
    date: "2026-06-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za červen 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-06",
    date: "2026-06-30",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za červen 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-06",
    date: "2026-06-30",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za červen 2026",
    type: "zdravotni",
    important: false,
  },
  // Červenec
  {
    id: "dan-prijmu-2025-poradce",
    date: "2026-07-01",
    title: "Daň z příjmů - přiznání s poradcem",
    description: "Podání daňového přiznání za rok 2025 při zpracování daňovým poradcem a úhrada daně",
    type: "dan_prijmu",
    important: true,
  },
  {
    id: "prehled-cssz-2025-poradce",
    date: "2026-08-03",
    title: "Přehled ČSSZ za 2025 (s poradcem)",
    description: "Podání přehledu o příjmech a výdajích OSVČ pro ČSSZ za rok 2025 při použití daňového poradce",
    type: "socialni",
    important: true,
  },
  {
    id: "pausalni-platba-07",
    date: "2026-07-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za červenec 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "dph-q2-2026",
    date: "2026-07-27",
    title: "DPH - přiznání za Q2 2026",
    description: "Podání přiznání k DPH za 2. čtvrtletí 2026 a úhrada daně. Také kontrolní hlášení.",
    type: "dph",
    important: true,
  },
  {
    id: "socialni-zaloha-07",
    date: "2026-07-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za červenec 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-07",
    date: "2026-07-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za červenec 2026",
    type: "zdravotni",
    important: false,
  },
  // Srpen
  {
    id: "pausalni-platba-08",
    date: "2026-08-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za srpen 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "dan-nemovitosti-2",
    date: "2026-08-31",
    title: "Daň z nemovitostí - 2. splátka",
    description: "Splatnost 2. splátky daně z nemovitých věcí",
    type: "general",
    important: false,
  },
  {
    id: "socialni-zaloha-08",
    date: "2026-08-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za srpen 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-08",
    date: "2026-08-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za srpen 2026",
    type: "zdravotni",
    important: false,
  },
  // Září
  {
    id: "zaloha-dan-q3",
    date: "2026-09-15",
    title: "Záloha na daň z příjmů Q3",
    description: "Čtvrtletní záloha na daň z příjmů",
    type: "dan_prijmu",
    important: false,
  },
  {
    id: "pausalni-platba-09",
    date: "2026-09-21",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za září 2026 (20. připadá na neděli)",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-09",
    date: "2026-09-30",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za září 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-09",
    date: "2026-09-30",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za září 2026",
    type: "zdravotni",
    important: false,
  },
  // Říjen
  {
    id: "pausalni-platba-10",
    date: "2026-10-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za říjen 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "dph-q3-2026",
    date: "2026-10-27",
    title: "DPH - přiznání za Q3 2026",
    description: "Podání přiznání k DPH za 3. čtvrtletí 2026 a úhrada daně. Také kontrolní hlášení.",
    type: "dph",
    important: true,
  },
  {
    id: "socialni-zaloha-10",
    date: "2026-10-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za říjen 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-10",
    date: "2026-10-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za říjen 2026",
    type: "zdravotni",
    important: false,
  },
  // Listopad
  {
    id: "dan-nemovitosti-3",
    date: "2026-11-30",
    title: "Daň z nemovitostí - 3. splátka",
    description: "Splatnost 3. splátky daně z nemovitých věcí (pro poplatníky provozující zemědělskou výrobu)",
    type: "general",
    important: false,
  },
  {
    id: "pausalni-platba-11",
    date: "2026-11-20",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za listopad 2026",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-11",
    date: "2026-11-30",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za listopad 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-11",
    date: "2026-11-30",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za listopad 2026",
    type: "zdravotni",
    important: false,
  },
  // Prosinec
  {
    id: "zaloha-dan-q4",
    date: "2026-12-15",
    title: "Záloha na daň z příjmů Q4",
    description: "Čtvrtletní nebo pololetní záloha na daň z příjmů",
    type: "dan_prijmu",
    important: false,
  },
  {
    id: "pausalni-platba-12",
    date: "2026-12-21",
    title: "Paušální daň - platba",
    description: "Splatnost měsíční zálohy paušální daně za prosinec 2026 (20. připadá na neděli)",
    type: "pausalni",
    important: false,
  },
  {
    id: "socialni-zaloha-12",
    date: "2026-12-31",
    title: "Záloha sociální pojištění",
    description: "Splatnost zálohy na sociální pojištění OSVČ za prosinec 2026",
    type: "socialni",
    important: false,
  },
  {
    id: "zdravotni-zaloha-12",
    date: "2026-12-31",
    title: "Záloha zdravotní pojištění",
    description: "Splatnost zálohy na zdravotní pojištění OSVČ za prosinec 2026",
    type: "zdravotni",
    important: false,
  },
]

const EVENT_TYPE_CONFIG: Record<TaxEventType, { icon: React.ReactNode; color: string; label: string }> = {
  dph: { icon: <Banknote className="w-4 h-4" />, color: "bg-primary/10 text-primary border-primary/20", label: "DPH" },
  dan_prijmu: { icon: <FileText className="w-4 h-4" />, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", label: "Daň z příjmů" },
  socialni: { icon: <Building2 className="w-4 h-4" />, color: "bg-warning/10 text-warning border-warning/20", label: "Sociální pojištění" },
  zdravotni: { icon: <Heart className="w-4 h-4" />, color: "bg-destructive/10 text-destructive border-destructive/20", label: "Zdravotní pojištění" },
  pausalni: { icon: <Calendar className="w-4 h-4" />, color: "bg-success/10 text-success border-success/20", label: "Paušální daň" },
  general: { icon: <Info className="w-4 h-4" />, color: "bg-muted text-muted-foreground border-border", label: "Obecné" },
}

const MONTH_NAMES = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
]

const DAY_NAMES = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]

export default function TaxCalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))
  const [selectedEvent, setSelectedEvent] = useState<TaxEvent | null>(null)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [reminderDays, setReminderDays] = useState("3")
  const [isAddingReminder, setIsAddingReminder] = useState(false)
  const [reminderResult, setReminderResult] = useState<{ success: boolean; message: string } | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored access token
    const stored = localStorage.getItem("google_calendar_token")
    if (stored) {
      setAccessToken(stored)
    }
  }, [])

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  // Convert Sunday=0 to Monday=0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Get events for current month
  const eventsInMonth = useMemo(() => {
    return TAX_EVENTS_2026.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === currentYear && eventDate.getMonth() === currentMonth
    })
  }, [currentYear, currentMonth])

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return TAX_EVENTS_2026.filter((event) => event.date === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleEventClick = (event: TaxEvent) => {
    setSelectedEvent(event)
  }

  const handleAuth = () => {
    // Store current URL to return after OAuth
    localStorage.setItem("calendar_return_url", window.location.pathname)
    window.location.href = "/api/calendar/auth"
  }

  const handleAddReminder = async () => {
    if (!selectedEvent) return

    if (!accessToken) {
      handleAuth()
      return
    }

    setIsAddingReminder(true)
    setReminderResult(null)

    try {
      // Calculate reminder date
      const eventDate = new Date(selectedEvent.date)
      eventDate.setDate(eventDate.getDate() - parseInt(reminderDays))

      // Add event to calendar
      const response = await fetch("/api/calendar/add-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          events: [
            {
              title: `📅 ${selectedEvent.title}`,
              description: selectedEvent.description,
              date: eventDate.toISOString().split("T")[0],
            },
          ],
        }),
      })

      const data = await response.json()

      if (data.success && data.successCount > 0) {
        setReminderResult({
          success: true,
          message: `Připomenutí bylo přidáno do kalendáře na ${eventDate.toLocaleDateString("cs-CZ")}`,
        })
      } else {
        // Token may have expired
        if (data.results?.[0]?.error?.includes("Invalid Credentials") || data.results?.[0]?.error?.includes("401")) {
          localStorage.removeItem("google_calendar_token")
          setAccessToken(null)
          setReminderResult({
            success: false,
            message: "Platnost přihlášení vypršela. Přihlaste se znovu.",
          })
        } else {
          throw new Error(data.results?.[0]?.error || data.error || "Nepodařilo se přidat událost")
        }
      }
    } catch (error) {
      console.error("Calendar error:", error)
      setReminderResult({
        success: false,
        message: "Nepodařilo se přidat připomenutí. Zkuste to znovu.",
      })
    } finally {
      setIsAddingReminder(false)
    }
  }

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []

    // Add empty cells for days before first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [startDay, daysInMonth])

  const today = new Date()
  const isToday = (day: number) => {
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day
  }

  const isPast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <Calendar className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Daňový kalendář 2026
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Důležité termíny pro OSVČ a podnikatele</p>
            </div>
          </div>
        </header>

          {/* Legend */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
              <Badge key={type} variant="outline" className={`text-[10px] ${config.color}`}>
                {config.icon}
                <span className="ml-1">{config.label}</span>
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Calendar */}
            <div className="lg:col-span-2 p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon-sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-sm font-medium">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <Button variant="outline" size="icon-sm" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((day) => (
                  <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="min-h-[70px]" />
                  }

                  const dayEvents = getEventsForDay(day)
                  const hasImportant = dayEvents.some((e) => e.important)

                  return (
                    <div
                      key={day}
                      className={`min-h-[70px] p-1 border rounded-md transition-all ${
                        isToday(day)
                          ? "bg-primary/10 border-primary"
                          : isPast(day)
                            ? "bg-muted/30 border-muted"
                            : "border-border hover:border-primary/50"
                      } ${dayEvents.length > 0 ? "cursor-pointer" : ""}`}
                      onClick={() => dayEvents.length > 0 && handleEventClick(dayEvents[0])}
                    >
                      <div className={`text-xs font-medium mb-1 ${isPast(day) ? "text-muted-foreground" : ""}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[8px] px-1 py-0.5 rounded truncate ${EVENT_TYPE_CONFIG[event.type].color} ${
                              event.important ? "font-semibold" : ""
                            }`}
                            title={event.title}
                          >
                            {event.title.slice(0, 12)}...
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[8px] text-muted-foreground">
                            +{dayEvents.length - 2} další
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Events List */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "50ms" }}>
              <h3 className="text-sm font-medium mb-1">Události v {MONTH_NAMES[currentMonth].toLowerCase()}u</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {eventsInMonth.length} {eventsInMonth.length === 1 ? "událost" : eventsInMonth.length < 5 ? "události" : "událostí"}
              </p>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {eventsInMonth.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Žádné daňové události v tomto měsíci
                  </p>
                ) : (
                  eventsInMonth
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((event) => {
                      const config = EVENT_TYPE_CONFIG[event.type]
                      const eventDate = new Date(event.date)
                      const eventIsPast = eventDate < today

                      return (
                        <div
                          key={event.id}
                          className={`p-3 rounded-md border border-border cursor-pointer transition-all hover:shadow-sm ${
                            eventIsPast ? "opacity-60" : ""
                          } ${event.important ? "border-l-4 border-l-primary" : ""}`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-md ${config.color}`}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-xs truncate">{event.title}</p>
                                {event.important && (
                                  <Badge variant="secondary" className="text-[8px] px-1">
                                    Důležité
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {eventDate.toLocaleDateString("cs-CZ", { day: "numeric", month: "long" })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <div className="p-4 bg-success/5 border border-success/20 rounded-md stagger-item" style={{ animationDelay: "100ms" }}>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-success/10 rounded-md">
                  <Calendar className="w-4 h-4 text-success" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-success">Paušální daň 2026</h3>
                  <p className="text-xs text-success/80 mt-1">
                    1. pásmo: 9 984 Kč/měsíc<br />
                    2. pásmo: 16 745 Kč/měsíc<br />
                    3. pásmo: 27 139 Kč/měsíc
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-md stagger-item" style={{ animationDelay: "150ms" }}>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <Banknote className="w-4 h-4 text-primary" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-primary">DPH 2026</h3>
                  <p className="text-xs text-primary/80 mt-1">
                    Limit pro registraci: 2 000 000 Kč/rok<br />
                    Čtvrtletní plátce: obrat do 15 mil. Kč
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-warning/5 border border-warning/20 rounded-md stagger-item" style={{ animationDelay: "200ms" }}>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-warning/10 rounded-md">
                  <Building2 className="w-4 h-4 text-warning" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-warning">Zálohy OSVČ 2026</h3>
                  <p className="text-xs text-warning/80 mt-1">
                    Sociální: min. 5 720 Kč/měsíc<br />
                    Zdravotní: min. 3 306 Kč/měsíc
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent && !showReminderDialog} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${EVENT_TYPE_CONFIG[selectedEvent.type].color}`}>
                      {EVENT_TYPE_CONFIG[selectedEvent.type].icon}
                    </div>
                    <div>
                      <DialogTitle>{selectedEvent.title}</DialogTitle>
                      <DialogDescription>
                        {new Date(selectedEvent.date).toLocaleDateString("cs-CZ", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4">
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Zavřít
                  </Button>
                  <Button onClick={() => setShowReminderDialog(true)}>
                    <Bell className="w-4 h-4 mr-2" />
                    Nastavit připomenutí
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reminder Dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nastavit připomenutí</DialogTitle>
              <DialogDescription>
                {selectedEvent && `${selectedEvent.title} - ${new Date(selectedEvent.date).toLocaleDateString("cs-CZ")}`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-3">
                <Label>Připomenout před termínem:</Label>
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="14" id="r14" />
                      <Label htmlFor="r14" className="font-normal cursor-pointer">14 dní</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="r30" />
                      <Label htmlFor="r30" className="font-normal cursor-pointer">30 dní</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {selectedEvent && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md text-xs">
                  <Calendar className="w-4 h-4 inline mr-2 text-primary" />
                  Připomenutí bude nastaveno na:{" "}
                  <strong>
                    {new Date(
                      new Date(selectedEvent.date).setDate(
                        new Date(selectedEvent.date).getDate() - parseInt(reminderDays)
                      )
                    ).toLocaleDateString("cs-CZ")}
                  </strong>
                </div>
              )}

              {reminderResult && (
                <div className={`p-3 rounded-md flex items-center gap-2 text-xs ${
                  reminderResult.success ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}>
                  {reminderResult.success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{reminderResult.message}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => {
                setShowReminderDialog(false)
                setReminderResult(null)
              }}>
                Zavřít
              </Button>
              <Button size="sm" onClick={handleAddReminder} disabled={isAddingReminder}>
                {isAddingReminder ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                )}
                {accessToken ? "Přidat do Google Calendar" : "Přihlásit se ke Google Calendar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
