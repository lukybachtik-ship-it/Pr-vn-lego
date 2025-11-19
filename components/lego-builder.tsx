"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useContract } from "@/contexts/contract-context"
import { useContractPersistence } from "@/hooks/use-contract-persistence"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ContractBlock } from "./contract-block"
import { BlockLibrary } from "./block-library"
import { ContractPreview } from "./contract-preview"

const AVAILABLE_BLOCKS = {
  "work-contract": [
    {
      id: "parties",
      name: "Smluvní strany",
      category: "required" as const,
      icon: "👥",
      description: "Kdo se podpisuje",
    },
    {
      id: "scope",
      name: "Předmět díla",
      category: "required" as const,
      icon: "📦",
      description: "Co se dělá",
    },
    {
      id: "payment",
      name: "Cena a splatnost",
      category: "required" as const,
      icon: "💰",
      description: "Za kolik a kdy",
    },
    {
      id: "timeline",
      name: "Časový plán",
      category: "optional" as const,
      icon: "📅",
      description: "Milníky a termíny",
    },
    {
      id: "deliverables",
      name: "Předání díla",
      category: "optional" as const,
      icon: "✅",
      description: "Jak se předává práce",
    },
    {
      id: "penalties",
      name: "Smluvní pokuty",
      category: "optional" as const,
      icon: "⚠️",
      description: "Penalizace za zpoždění",
    },
    {
      id: "warranty",
      name: "Záruka",
      category: "optional" as const,
      icon: "🛡️",
      description: "Délka a rozsah záruky",
    },
    {
      id: "confidentiality",
      name: "Důvěrnost",
      category: "optional" as const,
      icon: "🔒",
      description: "Ochrana dat a informací",
    },
    {
      id: "termination",
      name: "Ukončení smlouvy",
      category: "optional" as const,
      icon: "🔚",
      description: "Jak se smlouva končí",
    },
  ],
  "rental-contract": [
    {
      id: "parties",
      name: "Smluvní strany",
      category: "required" as const,
      icon: "👥",
      description: "Pronajímatel a nájemce",
    },
    {
      id: "property",
      name: "Popis předmětu pronájmu",
      category: "required" as const,
      icon: "🏠",
      description: "Co se pronajímá",
    },
    {
      id: "rental-period",
      name: "Doba pronájmu",
      category: "required" as const,
      icon: "📅",
      description: "Od kdy do kdy",
    },
    {
      id: "rental-price",
      name: "Nájemné a poplatky",
      category: "required" as const,
      icon: "💰",
      description: "Výše nájemného a splatnost",
    },
    {
      id: "deposit",
      name: "Kauce",
      category: "optional" as const,
      icon: "💵",
      description: "Výše a vrácení kauce",
    },
    {
      id: "utilities",
      name: "Vedlejší náklady",
      category: "optional" as const,
      icon: "⚡",
      description: "Elektrika, plyn, voda",
    },
    {
      id: "maintenance",
      name: "Údržba a opravy",
      category: "optional" as const,
      icon: "🔧",
      description: "Kdo opravuje co",
    },
    {
      id: "rules",
      name: "Domácí řád",
      category: "optional" as const,
      icon: "📋",
      description: "Pravidla užívání",
    },
    {
      id: "insurance",
      name: "Pojištění",
      category: "optional" as const,
      icon: "📄",
      description: "Povinné pojištění",
    },
    {
      id: "termination-rental",
      name: "Ukončení pronájmu",
      category: "optional" as const,
      icon: "🔚",
      description: "Výpověď a vypořádání",
    },
  ],
  "purchase-contract": [
    {
      id: "parties",
      name: "Smluvní strany",
      category: "required" as const,
      icon: "👥",
      description: "Prodávající a kupující",
    },
    {
      id: "purchase-item",
      name: "Předmět koupě",
      category: "required" as const,
      icon: "📦",
      description: "Co se prodává",
    },
    {
      id: "purchase-price",
      name: "Kupní cena",
      category: "required" as const,
      icon: "💰",
      description: "Cena a způsob úhrady",
    },
    {
      id: "ownership-transfer",
      name: "Přechod vlastnictví",
      category: "required" as const,
      icon: "🔄",
      description: "Kdy přechází vlastnictví",
    },
    {
      id: "item-condition",
      name: "Stav a vady",
      category: "optional" as const,
      icon: "🔍",
      description: "Popis stavu a prohlášení o vadách",
    },
    {
      id: "warranty",
      name: "Záruka",
      category: "optional" as const,
      icon: "🛡️",
      description: "Záruční doba a rozsah",
    },
  ],
  "trade-contract": [
    {
      id: "parties",
      name: "Smluvní strany",
      category: "required" as const,
      icon: "👥",
      description: "Prodávající a kupující",
    },
    {
      id: "goods",
      name: "Popis zboží/služeb",
      category: "required" as const,
      icon: "📦",
      description: "Co se prodává",
    },
    {
      id: "pricing",
      name: "Ceny a podmínky",
      category: "required" as const,
      icon: "💰",
      description: "Ceny a slevy",
    },
    {
      id: "payment-terms",
      name: "Podmínky platby",
      category: "required" as const,
      icon: "💳",
      description: "Jak se platí",
    },
    {
      id: "delivery",
      name: "Dodání",
      category: "optional" as const,
      icon: "📦",
      description: "Místo a čas dodání",
    },
    {
      id: "quality",
      name: "Kvalita a reklamace",
      category: "optional" as const,
      icon: "✅",
      description: "Normy a reklamační lhůty",
    },
    {
      id: "returns",
      name: "Vrácení zboží",
      category: "optional" as const,
      icon: "↩️",
      description: "Podmínky vrácení",
    },
    {
      id: "liability",
      name: "Odpovědnost za škodu",
      category: "optional" as const,
      icon: "⚖️",
      description: "Kdo za co odpovídá",
    },
    {
      id: "privacy",
      name: "Ochrana osobních údajů",
      category: "optional" as const,
      icon: "🔐",
      description: "GDPR a ochrana dat",
    },
    {
      id: "dispute",
      name: "Řešení sporů",
      category: "optional" as const,
      icon: "⚔️",
      description: "Jak se řeší neshody",
    },
    {
      id: "intellectual",
      name: "Duševní vlastnictví",
      category: "optional" as const,
      icon: "🧠",
      description: "Copyrighty a licence",
    },
  ],
  "other-contract": [
    {
      id: "parties",
      name: "Smluvní strany",
      category: "required" as const,
      icon: "👥",
      description: "Podílející se strany",
    },
    {
      id: "scope",
      name: "Předmět smlouvy",
      category: "required" as const,
      icon: "📋",
      description: "Čeho se smlouva týká",
    },
    {
      id: "payment",
      name: "Finanční povinnosti",
      category: "optional" as const,
      icon: "💰",
      description: "Peníze a výměna",
    },
    {
      id: "duration",
      name: "Trvání smlouvy",
      category: "optional" as const,
      icon: "⏱️",
      description: "Když až kdy",
    },
  ],
}

interface LegoBuilderProps {
  contractType?: string
}

export function LegoBuilder({ contractType: propType }: LegoBuilderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { manualSave } = useContractPersistence()

  const { contractType, blocks, addBlock, removeBlock, updateBlock, setContractType } = useContract()

  const builderRef = useRef<HTMLDivElement>(null)

  const availableBlocks = AVAILABLE_BLOCKS[contractType as keyof typeof AVAILABLE_BLOCKS] || []

  // Initialize contract type from URL or props
  useEffect(() => {
    const urlType = searchParams.get("type") || propType
    if (urlType && contractType !== urlType) {
      setContractType(urlType)
    }
  }, [searchParams, propType, contractType, setContractType])

  // Auto-add block if specified in URL
  useEffect(() => {
    const addBlockId = searchParams.get("addBlock")
    if (addBlockId && availableBlocks.length > 0) {
      const blockTemplate = availableBlocks.find((b) => b.id === addBlockId)
      if (blockTemplate && !blocks.some((b) => b.templateId === addBlockId)) {
        addBlock(addBlockId, blockTemplate)
      }
    }
  }, [searchParams, availableBlocks, blocks, addBlock])

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("blockId", blockId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const blockId = e.dataTransfer.getData("blockId")
    if (!blockId) return

    const blockTemplate = availableBlocks.find((b) => b.id === blockId)
    if (!blockTemplate) return

    addBlock(blockId, blockTemplate)
  }

  const requiredBlocks = availableBlocks.filter((b) => b.category === "required")
  const completedRequired = requiredBlocks.filter((r) => blocks.some((b) => b.templateId === r.id && b.isComplete))

  const progress = Math.round((completedRequired.length / requiredBlocks.length) * 100)

  const handleProceedToReview = useCallback(() => {
    manualSave()
    router.push(`/review?type=${contractType}`)
  }, [manualSave, router, contractType])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        manualSave()
      }
      // Ctrl/Cmd + Enter = Proceed to review
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (completedRequired.length === requiredBlocks.length) {
          handleProceedToReview()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [completedRequired.length, requiredBlocks.length, manualSave, handleProceedToReview])

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-screen bg-background p-2 md:p-4">
      {/* Left Panel - Block Library */}
      <div className="hidden lg:block w-64">
        <BlockLibrary blocks={availableBlocks} onDragStart={handleDragStart} draggedBlock={null} />
      </div>

      {/* Center Panel - Builder */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Stavitel smlouvy</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Ctrl+S pro uložení, Ctrl+Enter pro kontrolu</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="text-sm flex-1 md:flex-none">
              <p className="font-semibold">{progress}%</p>
              <p className="text-muted-foreground text-xs">
                {completedRequired.length}/{requiredBlocks.length} povinných
              </p>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div
          ref={builderRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 border-2 border-dashed border-border rounded-lg p-4 md:p-6 bg-muted/30 overflow-y-auto"
        >
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Plus className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">Táhni kostky ze seznamu</p>
              <p className="text-muted-foreground text-sm mt-2">Začni s &quot;Smluvní strany&quot;</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => (
                <ContractBlock
                  key={block.id}
                  block={block}
                  index={blocks.indexOf(block)}
                  onRemove={removeBlock}
                  onUpdate={updateBlock}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Zrušit
          </Button>
          <Button variant="outline" onClick={() => router.push("/drafts")}>
            Moje koncepty
          </Button>
          <Button
            className="flex-1"
            disabled={completedRequired.length < requiredBlocks.length}
            onClick={handleProceedToReview}
          >
            Pokračovat na kontrolu →
          </Button>
        </div>
      </div>

      {/* Right Panel - Preview - Hidden on mobile */}
      <div className="hidden xl:block w-80">
        <ContractPreview blocks={blocks} />
      </div>
    </div>
  )
}
