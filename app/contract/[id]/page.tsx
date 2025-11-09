"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, FileText, Trash2, Calendar } from "lucide-react"
import { getContract, deleteContract } from "@/lib/contract-storage"
import { ContractTimelineComponent } from "@/components/contract-timeline"
import { HandoverProtocolGenerator } from "@/components/handover-protocol-generator"
import { CalendarExportDialog } from "@/components/calendar-export-dialog"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import type { SavedContract } from "@/lib/contract-storage"

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<SavedContract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)

  useEffect(() => {
    const contractId = params.id as string
    const loadedContract = getContract(contractId)

    if (!loadedContract) {
      router.push("/")
      return
    }

    setContract(loadedContract)
    setIsLoading(false)
  }, [params.id, router])

  const handleDelete = () => {
    if (!contract) return

    if (confirm("Opravdu chcete smazat tuto smlouvu?")) {
      deleteContract(contract.id)
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <p className="text-muted-foreground">Načítám...</p>
        </div>
      </main>
    )
  }

  if (!contract) {
    return null
  }

  const timeline = extractContractDeadlines(contract.blocks, contract.type)
  const completedBlocks = contract.blocks.filter((b) => b.isComplete)

  const getContractTitle = () => {
    switch (contract.type) {
      case "rental-contract":
        return "NÁJEMNÍ SMLOUVA"
      case "trade-contract":
        return "OBCHODNÍ PODMÍNKY"
      case "other-contract":
        return "SMLOUVA"
      default:
        return "SMLOUVA O DÍLO"
    }
  }

  const renderContractText = () => {
    let text = `${getContractTitle()}\n\n`
    text += "---\n\n"

    const blocks = contract.blocks

    if (blocks.some((b) => b.templateId === "parties" && b.isComplete)) {
      const partiesBlock = blocks.find((b) => b.templateId === "parties")
      text += "SMLUVNÍ STRANY:\n\n"

      text += `1. PRVNÍ STRANA\n`
      text += `   Jméno: ${partiesBlock?.data.party1Name || "Neuvedeno"}\n`
      if (partiesBlock?.data.party1Ico) text += `   IČO: ${partiesBlock.data.party1Ico}\n`
      if (partiesBlock?.data.party1Address) text += `   Adresa: ${partiesBlock.data.party1Address}\n`
      text += "\n"

      text += `2. DRUHÁ STRANA\n`
      text += `   Jméno: ${partiesBlock?.data.party2Name || "Neuvedeno"}\n`
      if (partiesBlock?.data.party2Ico) text += `   IČO: ${partiesBlock.data.party2Ico}\n`
      if (partiesBlock?.data.party2Address) text += `   Adresa: ${partiesBlock.data.party2Address}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "scope" && b.isComplete)) {
      const scopeBlock = blocks.find((b) => b.templateId === "scope")
      text += "PŘEDMĚT DÍLA:\n"
      text += `${scopeBlock?.data.scopeDescription}\n\n`
    }

    if (blocks.some((b) => b.templateId === "payment" && b.isComplete)) {
      const paymentBlock = blocks.find((b) => b.templateId === "payment")
      text += "CENA A SPLATNOST:\n"
      text += `Celková částka: ${paymentBlock?.data.amount} Kč\n`
      text += `Podmínky platby: ${paymentBlock?.data.paymentTerms}\n\n`
    }

    return text
  }

  const contractText = renderContractText()

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zpět na dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{contract.name}</h1>
              <p className="text-muted-foreground">
                Vytvořeno: {new Date(contract.createdAt).toLocaleDateString("cs-CZ")}
              </p>
            </div>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Smazat
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Náhled smlouvy
                </CardTitle>
                <CardDescription>
                  {completedBlocks.length} ze {contract.blocks.length} sekcí vyplněno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background p-6 rounded-lg border border-border whitespace-pre-wrap font-mono text-sm overflow-x-auto max-h-[600px] overflow-y-auto">
                  {contractText}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Handover Protocol Generator - only for work contracts */}
            {contract.type === "work-contract" && (
              <HandoverProtocolGenerator
                contractId={contract.id}
                contractName={contract.name}
                contractType={contract.type}
                blocks={contract.blocks}
              />
            )}

            {/* Timeline */}
            {timeline.deadlines.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Časová osa smlouvy</h2>
                  <Button onClick={() => setShowCalendarDialog(true)} variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Přidat do kalendáře
                  </Button>
                </div>
                <ContractTimelineComponent timeline={timeline} />
              </div>
            )}

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informace o smlouvě</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ:</span>
                  <span className="font-medium">{getContractTitle()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vyplněno:</span>
                  <span className="font-medium">
                    {completedBlocks.length}/{contract.blocks.length} sekcí
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uzavřeno:</span>
                  <span className="font-medium">
                    {contract.finalizedAt
                      ? new Date(contract.finalizedAt).toLocaleDateString("cs-CZ")
                      : "Neuvedeno"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Calendar Export Dialog */}
      {showCalendarDialog && (
        <CalendarExportDialog
          open={showCalendarDialog}
          onOpenChange={setShowCalendarDialog}
          deadlines={timeline.deadlines}
          contractId={contract.id}
          contractName={contract.name || "Vaše smlouva"}
        />
      )}
    </main>
  )
}
