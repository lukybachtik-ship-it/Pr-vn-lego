"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Calendar, AlertCircle, CheckCircle, Eye, Wallet, Users } from "lucide-react"
import { ContractTypeSelector } from "@/components/contract-type-selector"
import { getFinalizedContracts } from "@/lib/contract-storage"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import type { SavedContract } from "@/lib/contract-storage"

export default function Home() {
  const router = useRouter()
  const [contracts, setContracts] = useState<SavedContract[]>([])
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    setContracts(getFinalizedContracts())
  }, [])

  const getContractTypeName = (type: string) => {
    const names: Record<string, string> = {
      "work-contract": "Smlouva o dílo",
      "rental-contract": "Nájemní smlouva",
      "trade-contract": "Obchodní podmínky",
      "other-contract": "Vlastní smlouva",
    }
    return names[type] || type
  }

  const getNextDeadline = (contract: SavedContract) => {
    const timeline = extractContractDeadlines(contract.blocks, contract.type)
    return timeline.nextDeadline
  }

  const getUpcomingStatus = (contract: SavedContract) => {
    const timeline = extractContractDeadlines(contract.blocks, contract.type)
    if (timeline.overdueCount > 0) {
      return { type: "overdue" as const, count: timeline.overdueCount }
    }
    if (timeline.upcomingCount > 0) {
      return { type: "upcoming" as const, count: timeline.upcomingCount }
    }
    return null
  }

  const handleSelectType = (type: string) => {
    setShowTypeSelector(false)
    router.push(`/builder?type=${type}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Právní <span className="text-primary">LEGO</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">Tvoř smlouvy bez právníka</p>
          <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sestavte si právní smlouvu jako stavebnici. Přetáhněte bloky, vyplňte údaje a máte hotovo.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setShowTypeSelector(true)} className="text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nová smlouva
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/drafts")}>
              <FileText className="w-5 h-5 mr-2" />
              Moje koncepty
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/clients")}>
              <Users className="w-5 h-5 mr-2" />
              Klienti
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/cash-flow")}>
              <Wallet className="w-5 h-5 mr-2" />
              Peníze
            </Button>
          </div>
        </div>
      </section>

      {/* Active Contracts Section */}
      {contracts.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">Aktivní smlouvy</h2>
              <Badge variant="secondary">{contracts.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contracts.slice(0, 6).map((contract) => {
                const status = getUpcomingStatus(contract)
                const nextDeadline = getNextDeadline(contract)

                return (
                  <Card
                    key={contract.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/contract/${contract.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{contract.name}</CardTitle>
                          <CardDescription>{getContractTypeName(contract.type)}</CardDescription>
                        </div>
                        {status && (
                          <Badge variant={status.type === "overdue" ? "destructive" : "default"} className="ml-2">
                            {status.count}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(contract.finalizedAt || contract.savedAt).toLocaleDateString("cs-CZ")}
                          </span>
                        </div>

                        {nextDeadline && (
                          <div
                            className={`flex items-center gap-2 ${
                              nextDeadline.isPast ? "text-destructive" : nextDeadline.isUpcoming ? "text-yellow-600" : ""
                            }`}
                          >
                            {nextDeadline.isPast ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            <span className="text-xs">
                              {nextDeadline.title} -{" "}
                              {nextDeadline.isPast
                                ? `Po termínu (${Math.abs(nextDeadline.daysUntil)} dnů)`
                                : nextDeadline.isUpcoming
                                  ? `Za ${nextDeadline.daysUntil} dnů`
                                  : `Za ${nextDeadline.daysUntil} dnů`}
                            </span>
                          </div>
                        )}

                        <Button size="sm" variant="outline" className="w-full mt-2">
                          <Eye className="w-4 h-4 mr-2" />
                          Zobrazit detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {contracts.length > 6 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => router.push("/contracts")}>
                  Zobrazit všechny smlouvy ({contracts.length})
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Type Selector Dialog */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Vyber typ smlouvy</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowTypeSelector(false)}>
                  ✕
                </Button>
              </div>
              <ContractTypeSelector onSelect={handleSelectType} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
