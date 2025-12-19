"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Filter,
} from "lucide-react"
import { getFinalizedContracts } from "@/lib/contract-storage"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import { getAllInvoices, formatCurrency, type Invoice } from "@/lib/cash-flow"
import type { SavedContract } from "@/lib/contract-storage"

// Skeleton component
function SkeletonDeadlines() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 bg-card border border-border rounded-md">
          <Skeleton className="h-6 w-32 mx-auto mb-4" />
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-md">
              <Skeleton className="h-5 w-40 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type DeadlineType = "contract" | "invoice" | "all"

interface Deadline {
  id: string
  type: "contract" | "invoice"
  title: string
  description: string
  date: Date
  isPast: boolean
  isUpcoming: boolean // within 7 days
  sourceId: string
  sourceName: string
  amount?: number
}

const MONTH_NAMES = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
]

const DAY_NAMES = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]

export default function DeadlinesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [filter, setFilter] = useState<DeadlineType>("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setIsLoading(true)
    try {
      setContracts(getFinalizedContracts())
      setInvoices(getAllInvoices())
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Extract all deadlines
  const allDeadlines = useMemo(() => {
    const deadlines: Deadline[] = []

    // Contract deadlines
    contracts.forEach((contract) => {
      const timeline = extractContractDeadlines(contract.blocks, contract.type)
      timeline.deadlines.forEach((dl) => {
        const date = new Date(dl.date)
        const isPast = date < today
        const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isUpcoming = daysUntil >= 0 && daysUntil <= 7

        deadlines.push({
          id: `contract_${contract.id}_${dl.title}`,
          type: "contract",
          title: dl.title,
          description: dl.description || "",
          date,
          isPast,
          isUpcoming,
          sourceId: contract.id,
          sourceName: contract.name,
        })
      })
    })

    // Invoice deadlines (unpaid only)
    invoices
      .filter((inv) => !inv.isPaid)
      .forEach((inv) => {
        const date = new Date(inv.dueDate)
        const isPast = date < today
        const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const isUpcoming = daysUntil >= 0 && daysUntil <= 7

        deadlines.push({
          id: `invoice_${inv.id}`,
          type: "invoice",
          title: inv.type === "income" ? "Splatnost faktury" : "Splatnost výdaje",
          description: inv.description || "",
          date,
          isPast,
          isUpcoming,
          sourceId: inv.id,
          sourceName: inv.from,
          amount: inv.amount,
        })
      })

    return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [contracts, invoices, today])

  // Filter deadlines
  const filteredDeadlines = useMemo(() => {
    if (filter === "all") return allDeadlines
    return allDeadlines.filter((d) => d.type === filter)
  }, [allDeadlines, filter])

  // Get deadlines for current month
  const monthDeadlines = useMemo(() => {
    return filteredDeadlines.filter((d) => {
      return d.date.getMonth() === currentMonth && d.date.getFullYear() === currentYear
    })
  }, [filteredDeadlines, currentMonth, currentYear])

  // Get deadlines by day
  const getDeadlinesForDay = (day: number) => {
    return monthDeadlines.filter((d) => d.date.getDate() === day)
  }

  // Calendar helpers
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7 // Monday = 0

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    calendarDays.push(day)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    )
  }

  const handleDeadlineClick = (deadline: Deadline) => {
    if (deadline.type === "contract") {
      router.push(`/contract/${deadline.sourceId}`)
    } else {
      router.push("/cash-flow")
    }
  }

  // Summary stats
  const overdueCount = allDeadlines.filter((d) => d.isPast).length
  const upcomingCount = allDeadlines.filter((d) => d.isUpcoming && !d.isPast).length
  const thisMonthCount = monthDeadlines.length

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonDeadlines />
      </AppLayout>
    )
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
                Kalendář termínů
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Přehled všech důležitých termínů ze smluv a faktur
              </p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Vše ({allDeadlines.length})
          </Button>
          <Button
            variant={filter === "contract" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("contract")}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Smlouvy ({allDeadlines.filter((d) => d.type === "contract").length})
          </Button>
          <Button
            variant={filter === "invoice" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("invoice")}
          >
            <Receipt className="w-4 h-4 mr-1.5" />
            Faktury ({allDeadlines.filter((d) => d.type === "invoice").length})
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-md stagger-item" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-md">
                <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-destructive">Po termínu</p>
                <p className="text-lg font-bold text-destructive">{overdueCount}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-warning/5 border border-warning/20 rounded-md stagger-item" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-md">
                <Clock className="w-4 h-4 text-warning" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-warning">Blížící se (7 dní)</p>
                <p className="text-lg font-bold text-warning">{upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md stagger-item" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-primary">Tento měsíc</p>
                <p className="text-lg font-bold text-primary">{thisMonthCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "150ms" }}>
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
                  return <div key={`empty-${index}`} className="min-h-[80px]" />
                }

                const dayDeadlines = getDeadlinesForDay(day)
                const hasOverdue = dayDeadlines.some((d) => d.isPast)
                const hasUpcoming = dayDeadlines.some((d) => d.isUpcoming && !d.isPast)

                return (
                  <div
                    key={day}
                    className={`min-h-[80px] p-1.5 border rounded-md transition-all ${
                      isToday(day)
                        ? "bg-primary/10 border-primary"
                        : dayDeadlines.length > 0
                          ? hasOverdue
                            ? "border-destructive/50 bg-destructive/5"
                            : hasUpcoming
                              ? "border-warning/50 bg-warning/5"
                              : "border-border hover:border-primary/50"
                          : "border-border"
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayDeadlines.slice(0, 2).map((deadline) => (
                        <div
                          key={deadline.id}
                          className={`text-[8px] px-1 py-0.5 rounded truncate cursor-pointer ${
                            deadline.isPast
                              ? "bg-destructive/10 text-destructive"
                              : deadline.isUpcoming
                                ? "bg-warning/10 text-warning"
                                : deadline.type === "contract"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-success/10 text-success"
                          }`}
                          onClick={() => handleDeadlineClick(deadline)}
                          title={`${deadline.title} - ${deadline.sourceName}`}
                        >
                          {deadline.type === "contract" ? "📄" : "💰"} {deadline.sourceName.slice(0, 10)}
                        </div>
                      ))}
                      {dayDeadlines.length > 2 && (
                        <div className="text-[8px] text-muted-foreground">
                          +{dayDeadlines.length - 2} další
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar - Upcoming deadlines */}
          <div className="space-y-4">
            {/* Overdue */}
            {overdueCount > 0 && (
              <div className="p-4 bg-card border border-destructive/30 rounded-md stagger-item" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                  <h3 className="text-sm font-medium text-destructive">Po termínu</h3>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {filteredDeadlines
                    .filter((d) => d.isPast)
                    .slice(0, 5)
                    .map((deadline) => (
                      <div
                        key={deadline.id}
                        className="p-2 bg-destructive/5 border border-destructive/20 rounded-md cursor-pointer hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDeadlineClick(deadline)}
                      >
                        <div className="flex items-center gap-2">
                          {deadline.type === "contract" ? (
                            <FileText className="w-3.5 h-3.5 text-destructive" />
                          ) : (
                            <Receipt className="w-3.5 h-3.5 text-destructive" />
                          )}
                          <span className="text-xs font-medium truncate">{deadline.sourceName}</span>
                        </div>
                        <p className="text-[10px] text-destructive/80 mt-1">{deadline.title}</p>
                        <p className="text-[10px] text-destructive">
                          {deadline.date.toLocaleDateString("cs-CZ")}
                          {deadline.amount && ` • ${formatCurrency(deadline.amount)}`}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingCount > 0 && (
              <div className="p-4 bg-card border border-warning/30 rounded-md stagger-item" style={{ animationDelay: "250ms" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-warning" strokeWidth={1.75} />
                  <h3 className="text-sm font-medium text-warning">Blížící se termíny</h3>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {filteredDeadlines
                    .filter((d) => d.isUpcoming && !d.isPast)
                    .slice(0, 5)
                    .map((deadline) => {
                      const daysUntil = Math.ceil(
                        (deadline.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                      )
                      return (
                        <div
                          key={deadline.id}
                          className="p-2 bg-warning/5 border border-warning/20 rounded-md cursor-pointer hover:bg-warning/10 transition-colors"
                          onClick={() => handleDeadlineClick(deadline)}
                        >
                          <div className="flex items-center gap-2">
                            {deadline.type === "contract" ? (
                              <FileText className="w-3.5 h-3.5 text-warning" />
                            ) : (
                              <Receipt className="w-3.5 h-3.5 text-warning" />
                            )}
                            <span className="text-xs font-medium truncate">{deadline.sourceName}</span>
                            <Badge variant="outline" className="ml-auto text-[8px] bg-warning/10 text-warning border-warning/20">
                              {daysUntil === 0 ? "Dnes" : `Za ${daysUntil}d`}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-warning/80 mt-1">{deadline.title}</p>
                          {deadline.amount && (
                            <p className="text-[10px] text-warning">{formatCurrency(deadline.amount)}</p>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* This Month */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Tento měsíc</h3>
              </div>
              {monthDeadlines.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Žádné termíny v tomto měsíci
                </p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {monthDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className={`p-2 border rounded-md cursor-pointer transition-colors ${
                        deadline.isPast
                          ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10"
                          : deadline.isUpcoming
                            ? "bg-warning/5 border-warning/20 hover:bg-warning/10"
                            : "bg-muted/30 border-border hover:bg-muted/50"
                      }`}
                      onClick={() => handleDeadlineClick(deadline)}
                    >
                      <div className="flex items-center gap-2">
                        {deadline.type === "contract" ? (
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium truncate flex-1">{deadline.sourceName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {deadline.date.getDate()}.{deadline.date.getMonth() + 1}.
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{deadline.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
