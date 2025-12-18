"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Copy, Plus, FileStack, X } from "lucide-react"
import { ContractTypeSelector } from "@/components/contract-type-selector"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"

interface Draft {
  id: string
  name: string
  type: string
  date: string
  blocks: number
}

// Skeleton component
function SkeletonDrafts() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-md stagger-item">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="space-y-2 mb-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    const loadDrafts = () => {
      const allDrafts: Draft[] = []

      // Load current draft
      const currentDraft = localStorage.getItem("contract-draft")
      if (currentDraft) {
        try {
          const data = JSON.parse(currentDraft)
          allDrafts.push({
            id: "contract-draft",
            name: `Aktuální koncept`,
            type: data.type,
            date: new Date(data.savedAt).toLocaleDateString("cs-CZ"),
            blocks: data.blocks?.length || 0,
          })
        } catch (e) {
          console.error("Error loading draft:", e)
        }
      }

      // Load archived contracts
      const contracts = localStorage.getItem("contracts")
      if (contracts) {
        try {
          const data = JSON.parse(contracts)
          Object.entries(data).forEach(([id, contract]: [string, any]) => {
            if (!contract.finalized) {
              allDrafts.push({
                id,
                name: contract.name || `Koncept ${id.slice(0, 8)}`,
                type: contract.type,
                date: new Date(contract.savedAt).toLocaleDateString("cs-CZ"),
                blocks: contract.blocks?.length || 0,
              })
            }
          })
        } catch (e) {
          console.error("Error loading contracts:", e)
        }
      }

      setDrafts(allDrafts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setIsLoading(false)
    }

    loadDrafts()
  }, [])

  const handleResume = (draftId: string) => {
    if (draftId === "contract-draft") {
      const saved = localStorage.getItem("contract-draft")
      if (saved) {
        const data = JSON.parse(saved)
        router.push(`/builder?type=${data.type}`)
      }
    } else {
      const contracts = localStorage.getItem("contracts")
      if (contracts) {
        const data = JSON.parse(contracts)
        const contract = data[draftId]
        if (contract) {
          localStorage.setItem("contract-draft", JSON.stringify(contract))
          router.push(`/builder?type=${contract.type}`)
        }
      }
    }
  }

  const handleDuplicate = (draft: Draft) => {
    const contracts = localStorage.getItem("contracts")
    const contractsData = contracts ? JSON.parse(contracts) : {}

    let sourceData
    if (draft.id === "contract-draft") {
      const saved = localStorage.getItem("contract-draft")
      sourceData = saved ? JSON.parse(saved) : null
    } else {
      sourceData = contractsData[draft.id]
    }

    if (sourceData) {
      const newId = `contract-${Date.now()}`
      const newContract = {
        ...sourceData,
        id: newId,
        name: `${sourceData.name || draft.name} (kopie)`,
        savedAt: new Date().toISOString(),
        finalized: false,
      }

      contractsData[newId] = newContract
      localStorage.setItem("contracts", JSON.stringify(contractsData))

      // Refresh the drafts list
      const allDrafts: Draft[] = []
      const currentDraft = localStorage.getItem("contract-draft")
      if (currentDraft) {
        try {
          const data = JSON.parse(currentDraft)
          allDrafts.push({
            id: "contract-draft",
            name: `Aktuální koncept`,
            type: data.type,
            date: new Date(data.savedAt).toLocaleDateString("cs-CZ"),
            blocks: data.blocks?.length || 0,
          })
        } catch (e) {}
      }

      Object.entries(contractsData).forEach(([id, contract]: [string, any]) => {
        if (!contract.finalized) {
          allDrafts.push({
            id,
            name: contract.name || `Koncept ${id.slice(0, 8)}`,
            type: contract.type,
            date: new Date(contract.savedAt).toLocaleDateString("cs-CZ"),
            blocks: contract.blocks?.length || 0,
          })
        }
      })

      setDrafts(allDrafts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }
  }

  const handleDelete = (draftId: string) => {
    if (confirm("Opravdu chceš smazat tento koncept?")) {
      localStorage.removeItem(draftId)
      setDrafts(drafts.filter((d) => d.id !== draftId))
    }
  }

  const getContractTypeName = (type: string) => {
    const names: Record<string, string> = {
      "work-contract": "Smlouva o dílo",
      "rental-contract": "Nájemní smlouva",
      "trade-contract": "Obchodní podmínky",
      "other-contract": "Vlastní smlouva",
    }
    return names[type] || type
  }

  const handleSelectType = (type: string) => {
    setShowTypeSelector(false)
    localStorage.removeItem("contract-draft")
    router.push(`/builder?type=${type}`)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonDrafts />
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
                <FileStack className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Moje koncepty
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Všechny vaše uložené a rozpracované smlouvy
              </p>
            </div>
            <Button onClick={() => setShowTypeSelector(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
              Nová smlouva
            </Button>
          </div>
        </header>

        {/* Content */}
        {drafts.length === 0 ? (
          <div className="text-center py-16">
            <FileStack className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground mb-4">Ještě jste nevytvořili žádný koncept</p>
            <Button onClick={() => setShowTypeSelector(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Vytvořit nový koncept
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {drafts.map((draft, index) => (
              <div
                key={draft.id}
                className="p-4 bg-card border border-border rounded-md interactive-card stagger-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-3">
                  <h3 className="text-sm font-medium truncate">{draft.name}</h3>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {getContractTypeName(draft.type)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <p>Bloky: {draft.blocks}</p>
                  <p>Poslední úprava: {draft.date}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => handleResume(draft.id)}>
                    <Play className="w-3.5 h-3.5 mr-1" strokeWidth={1.75} />
                    Pokračovat
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleDuplicate(draft)}
                    title="Kopírovat"
                    className="h-8 w-8"
                  >
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleDelete(draft.id)}
                    title="Smazat"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Type Selector Modal */}
        {showTypeSelector && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 fade-in">
            <div className="bg-card border border-border rounded-md max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl scale-in">
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Vyber typ smlouvy</h2>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowTypeSelector(false)}>
                    <X className="w-4 h-4" />
                    <span className="sr-only">Zavřít</span>
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <ContractTypeSelector onSelect={handleSelectType} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
