"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Play, Copy, Plus } from "lucide-react"
import { ContractTypeSelector } from "@/components/contract-type-selector"

interface Draft {
  id: string
  name: string
  type: string
  date: string
  blocks: number
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
    // Always save copies to the contracts store
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
      const loadDrafts = () => {
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

      loadDrafts()
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
    // Clear the current draft before starting a new one
    localStorage.removeItem("contract-draft")
    router.push(`/builder?type=${type}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Moje koncepty</h1>
            <p className="text-muted-foreground">Všechny vaše uložené a rozpracované smlouvy</p>
          </div>
          <Button onClick={() => setShowTypeSelector(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" /> Nová smlouva
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Načítám koncepty...</p>
          </div>
        ) : drafts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Ještě jste nevytvořili žádný koncept</p>
              <Button onClick={() => setShowTypeSelector(true)}>Vytvořit nový koncept</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {drafts.map((draft) => (
              <Card key={draft.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{draft.name}</CardTitle>
                  <CardDescription>{getContractTypeName(draft.type)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="mb-4 text-sm text-muted-foreground">
                    <p>Bloky: {draft.blocks}</p>
                    <p>Poslední úprava: {draft.date}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="flex-1" onClick={() => handleResume(draft.id)}>
                      <Play className="w-4 h-4 mr-1" /> Pokračovat
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(draft)} title="Kopírovat">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(draft.id)} title="Smazat">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" onClick={() => router.push("/")}>
            ← Zpět na domovskou stránku
          </Button>
        </div>
      </div>

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
