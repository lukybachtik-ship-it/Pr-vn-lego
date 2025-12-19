"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Search,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react"
import { getFinalizedContracts } from "@/lib/contract-storage"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import type { SavedContract } from "@/lib/contract-storage"

// Skeleton loading component
function SkeletonContracts() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 flex-1 max-w-xs" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  )
}

type SortField = "date" | "name" | "type"
type SortOrder = "asc" | "desc"
type FilterType = "all" | "overdue" | "upcoming" | "ok"

const CONTRACT_TYPE_NAMES: Record<string, string> = {
  "work-contract": "Smlouva o dílo",
  "rental-contract": "Nájemní smlouva",
  "purchase-contract": "Kupní smlouva",
  "trade-contract": "Obchodní podmínky",
  "other-contract": "Vlastní smlouva",
}

export default function ContractsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [filterType, setFilterType] = useState<FilterType>("all")

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = () => {
    setIsLoading(true)
    try {
      setContracts(getFinalizedContracts())
    } finally {
      setIsLoading(false)
    }
  }

  const getContractStatus = (contract: SavedContract) => {
    const timeline = extractContractDeadlines(contract.blocks, contract.type)
    if (timeline.overdueCount > 0) {
      return { status: "overdue" as const, count: timeline.overdueCount, nextDeadline: timeline.nextDeadline }
    }
    if (timeline.upcomingCount > 0) {
      return { status: "upcoming" as const, count: timeline.upcomingCount, nextDeadline: timeline.nextDeadline }
    }
    return { status: "ok" as const, count: 0, nextDeadline: timeline.nextDeadline }
  }

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    let result = contracts

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          CONTRACT_TYPE_NAMES[c.type]?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterType !== "all") {
      result = result.filter((c) => {
        const { status } = getContractStatus(c)
        return status === filterType
      })
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "date":
          comparison = new Date(b.finalizedAt || b.savedAt).getTime() - new Date(a.finalizedAt || a.savedAt).getTime()
          break
        case "name":
          comparison = a.name.localeCompare(b.name, "cs")
          break
        case "type":
          comparison = (CONTRACT_TYPE_NAMES[a.type] || a.type).localeCompare(
            CONTRACT_TYPE_NAMES[b.type] || b.type,
            "cs"
          )
          break
      }
      return sortOrder === "asc" ? -comparison : comparison
    })

    return result
  }, [contracts, searchQuery, sortField, sortOrder, filterType])

  // Stats
  const stats = useMemo(() => {
    let overdue = 0
    let upcoming = 0
    let ok = 0
    contracts.forEach((c) => {
      const { status } = getContractStatus(c)
      if (status === "overdue") overdue++
      else if (status === "upcoming") upcoming++
      else ok++
    })
    return { overdue, upcoming, ok, total: contracts.length }
  }, [contracts])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonContracts />
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
                <FileText className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Moje smlouvy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Přehled všech uzavřených smluv a jejich termínů
              </p>
            </div>
            <Button onClick={() => router.push("/builder")} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Nová smlouva
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`p-3 rounded-md border transition-colors text-left ${
              filterType === "all"
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <p className="text-xs text-muted-foreground">Celkem</p>
            <p className="text-lg font-semibold">{stats.total}</p>
          </button>
          <button
            onClick={() => setFilterType("overdue")}
            className={`p-3 rounded-md border transition-colors text-left ${
              filterType === "overdue"
                ? "bg-destructive/10 border-destructive/30"
                : "bg-card border-border hover:border-destructive/30"
            }`}
          >
            <p className="text-xs text-destructive">Po termínu</p>
            <p className="text-lg font-semibold text-destructive">{stats.overdue}</p>
          </button>
          <button
            onClick={() => setFilterType("upcoming")}
            className={`p-3 rounded-md border transition-colors text-left ${
              filterType === "upcoming"
                ? "bg-warning/10 border-warning/30"
                : "bg-card border-border hover:border-warning/30"
            }`}
          >
            <p className="text-xs text-warning">Blížící se</p>
            <p className="text-lg font-semibold text-warning">{stats.upcoming}</p>
          </button>
          <button
            onClick={() => setFilterType("ok")}
            className={`p-3 rounded-md border transition-colors text-left ${
              filterType === "ok"
                ? "bg-success/10 border-success/30"
                : "bg-card border-border hover:border-success/30"
            }`}
          >
            <p className="text-xs text-success">V pořádku</p>
            <p className="text-lg font-semibold text-success">{stats.ok}</p>
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Hledat smlouvy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortField === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSort("date")}
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Datum
              {sortField === "date" && (
                sortOrder === "desc" ? <SortDesc className="w-3 h-3 ml-1" /> : <SortAsc className="w-3 h-3 ml-1" />
              )}
            </Button>
            <Button
              variant={sortField === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSort("name")}
            >
              <User className="w-4 h-4 mr-1.5" />
              Název
              {sortField === "name" && (
                sortOrder === "desc" ? <SortDesc className="w-3 h-3 ml-1" /> : <SortAsc className="w-3 h-3 ml-1" />
              )}
            </Button>
            <Button
              variant={sortField === "type" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSort("type")}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Typ
              {sortField === "type" && (
                sortOrder === "desc" ? <SortDesc className="w-3 h-3 ml-1" /> : <SortAsc className="w-3 h-3 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* Contracts Grid */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-medium mb-1">
              {contracts.length === 0 ? "Zatím nemáte žádné smlouvy" : "Žádné smlouvy neodpovídají filtru"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {contracts.length === 0
                ? "Začněte vytvořením první smlouvy"
                : "Zkuste změnit vyhledávání nebo filtr"}
            </p>
            {contracts.length === 0 && (
              <Button onClick={() => router.push("/builder")} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Vytvořit smlouvu
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContracts.map((contract, index) => {
              const { status, count, nextDeadline } = getContractStatus(contract)
              const contractDate = new Date(contract.finalizedAt || contract.savedAt)

              return (
                <button
                  key={contract.id}
                  onClick={() => router.push(`/contract/${contract.id}`)}
                  className="interactive-card press-effect group p-4 bg-card border border-border rounded-md hover:border-primary/40 text-left stagger-item"
                  style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {contract.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {CONTRACT_TYPE_NAMES[contract.type] || contract.type}
                      </p>
                    </div>
                    <Badge
                      variant={status === "overdue" ? "destructive" : status === "upcoming" ? "outline" : "secondary"}
                      className={`ml-2 shrink-0 ${
                        status === "upcoming" ? "border-warning text-warning" : ""
                      }`}
                    >
                      {status === "overdue" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {status === "upcoming" && <Clock className="w-3 h-3 mr-1" />}
                      {status === "ok" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {status === "overdue"
                        ? `${count} po termínu`
                        : status === "upcoming"
                        ? `${count} blížící se`
                        : "V pořádku"}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Vytvořeno: {contractDate.toLocaleDateString("cs-CZ")}</span>
                    </div>

                    {nextDeadline && (
                      <div
                        className={`flex items-center gap-1.5 ${
                          nextDeadline.isPast
                            ? "text-destructive"
                            : nextDeadline.isUpcoming
                            ? "text-warning"
                            : "text-muted-foreground"
                        }`}
                      >
                        {nextDeadline.isPast ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : nextDeadline.isUpcoming ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span className="truncate">
                          {nextDeadline.title}:{" "}
                          {nextDeadline.isPast
                            ? `Po termínu (${Math.abs(nextDeadline.daysUntil)} d)`
                            : `Za ${nextDeadline.daysUntil} d`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {contract.blocks?.length || 0} bloků
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
