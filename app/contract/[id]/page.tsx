"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileText, Trash2, Calendar, DollarSign, Plus, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react"
import { getContract, deleteContract } from "@/lib/contract-storage"
import { ContractTimelineComponent } from "@/components/contract-timeline"
import { HandoverProtocolGenerator } from "@/components/handover-protocol-generator"
import { CalendarExportDialog } from "@/components/calendar-export-dialog"
import { ContractExporter } from "@/components/contract-exporter"
import { AppHeader } from "@/components/app-header"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import { generateInvoiceFromContract } from "@/lib/contract-to-invoice"
import {
  getChangeRequestsByContract,
  createChangeRequest,
  updateChangeRequestStatus,
  deleteChangeRequest,
  generateAmendmentText,
  type ChangeRequest,
} from "@/lib/change-requests"
import type { SavedContract } from "@/lib/contract-storage"

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<SavedContract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)

  // Change requests state
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false)
  const [changeDescription, setChangeDescription] = useState("")
  const [priceIncrease, setPriceIncrease] = useState("")
  const [deadlineExtension, setDeadlineExtension] = useState("")

  useEffect(() => {
    const contractId = params.id as string
    const loadedContract = getContract(contractId)

    if (!loadedContract) {
      router.push("/")
      return
    }

    setContract(loadedContract)
    loadChangeRequests(contractId)
    setIsLoading(false)
  }, [params.id, router])

  const loadChangeRequests = (contractId: string) => {
    const requests = getChangeRequestsByContract(contractId)
    setChangeRequests(requests)
  }

  const handleDelete = () => {
    if (!contract) return

    if (confirm("Opravdu chcete smazat tuto smlouvu?")) {
      deleteContract(contract.id)
      router.push("/")
    }
  }

  const handleGenerateInvoice = () => {
    if (!contract) return

    const preset = generateInvoiceFromContract(contract)
    if (!preset) {
      alert("Nelze vygenerovat fakturu z této smlouvy. Zkontroluj, zda má smlouva vyplněnou cenu a platební podmínky.")
      return
    }

    const params = new URLSearchParams({
      prefill: "contract",
      from: preset.from,
      amount: preset.amount.toString(),
      dueDate: preset.dueDate,
      description: preset.description,
    })

    if (preset.clientId) {
      params.append("clientId", preset.clientId)
    }

    router.push(`/cash-flow?${params.toString()}`)
  }

  const handleCreateChangeRequest = () => {
    if (!contract) return
    if (!changeDescription) {
      alert("Vyplň popis změny")
      return
    }

    const price = parseFloat(priceIncrease) || 0
    const days = parseInt(deadlineExtension) || 0

    createChangeRequest(contract.id, changeDescription, price, days)
    loadChangeRequests(contract.id)

    setShowChangeRequestDialog(false)
    setChangeDescription("")
    setPriceIncrease("")
    setDeadlineExtension("")
  }

  const handleApproveChangeRequest = (requestId: string) => {
    if (!contract) return
    updateChangeRequestStatus(requestId, "approved")
    loadChangeRequests(contract.id)
  }

  const handleRejectChangeRequest = (requestId: string) => {
    if (!contract) return
    updateChangeRequestStatus(requestId, "rejected")
    loadChangeRequests(contract.id)
  }

  const handleDeleteChangeRequest = (requestId: string) => {
    if (!confirm("Opravdu smazat tento změnový list?")) return
    if (!contract) return
    deleteChangeRequest(requestId)
    loadChangeRequests(contract.id)
  }

  const handleDownloadAmendment = async (request: ChangeRequest) => {
    if (!contract) return
    try {
      const { generateAmendmentDocx } = await import("@/lib/change-requests")
      const blob = await generateAmendmentDocx(request, contract.name)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${contract.name}_Dodatek_${request.requestNumber}.docx`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate amendment:", error)
      alert("Nepodařilo se vygenerovat dodatek")
    }
  }

  const getChangeRequestStatusBadge = (status: ChangeRequest["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Schváleno
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Zamítnuto
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Čeká
          </Badge>
        )
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
      case "purchase-contract":
        return "KUPNÍ SMLOUVA"
      case "trade-contract":
        return "OBCHODNÍ PODMÍNKY"
      case "other-contract":
        return "SMLOUVA"
      case "work-contract":
        return "SMLOUVA O DÍLO"
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

    // Purchase contract sections
    if (blocks.some((b) => b.templateId === "purchase-item" && b.isComplete)) {
      const itemBlock = blocks.find((b) => b.templateId === "purchase-item")
      text += "PŘEDMĚT KOUPĚ:\n"
      if (itemBlock?.data.itemType === "movable") {
        text += `Typ: Movitá věc\n`
        if (itemBlock?.data.itemDescription) text += `Popis: ${itemBlock.data.itemDescription}\n`
        if (itemBlock?.data.serialNumber) text += `Výrobní číslo/VIN: ${itemBlock.data.serialNumber}\n`
        if (itemBlock?.data.yearOfManufacture) text += `Rok výroby: ${itemBlock.data.yearOfManufacture}\n`
      } else if (itemBlock?.data.itemType === "real-estate") {
        text += `Typ: Nemovitost\n`
        if (itemBlock?.data.cadastralArea) text += `Katastrální území: ${itemBlock.data.cadastralArea}\n`
        if (itemBlock?.data.lvNumber) text += `Číslo LV: ${itemBlock.data.lvNumber}\n`
        if (itemBlock?.data.parcelNumber) text += `Parcelní číslo: ${itemBlock.data.parcelNumber}\n`
        if (itemBlock?.data.buildingNumber) text += `Číslo popisné: ${itemBlock.data.buildingNumber}\n`
      }
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "purchase-price" && b.isComplete)) {
      const priceBlock = blocks.find((b) => b.templateId === "purchase-price")
      text += "KUPNÍ CENA:\n"
      if (priceBlock?.data.purchasePrice) text += `Kupní cena: ${priceBlock.data.purchasePrice} Kč\n`
      if (priceBlock?.data.paymentMethod) {
        const methodMap: Record<string, string> = {
          direct: "Přímý bankovní převod",
          escrow: "Advokátní/notářská úschova",
          cash: "Hotovost",
        }
        text += `Způsob úhrady: ${methodMap[priceBlock.data.paymentMethod] || priceBlock.data.paymentMethod}\n`
      }
      if (priceBlock?.data.paymentDueDays) text += `Splatnost: ${priceBlock.data.paymentDueDays} dnů od podpisu\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "ownership-transfer" && b.isComplete)) {
      const ownershipBlock = blocks.find((b) => b.templateId === "ownership-transfer")
      text += "PŘECHOD VLASTNICTVÍ:\n"
      if (ownershipBlock?.data.ownershipTransferMoment) {
        const momentMap: Record<string, string> = {
          payment: "Úplným zaplacením kupní ceny",
          handover: "Předáním věci",
          registration: "Vkladem do katastru nemovitostí",
        }
        text += `Vlastnictví přechází: ${momentMap[ownershipBlock.data.ownershipTransferMoment] || ownershipBlock.data.ownershipTransferMoment}\n`
      }
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "item-condition" && b.isComplete)) {
      const conditionBlock = blocks.find((b) => b.templateId === "item-condition")
      text += "STAV A VADY:\n"
      if (conditionBlock?.data.itemCondition) {
        const conditionMap: Record<string, string> = {
          new: "Nová",
          used: "Použitá",
          damaged: "S vadami",
        }
        text += `Stav: ${conditionMap[conditionBlock.data.itemCondition] || conditionBlock.data.itemCondition}\n`
      }
      if (conditionBlock?.data.knownDefects) text += `Známé vady: ${conditionBlock.data.knownDefects}\n`
      if (conditionBlock?.data.noLegalDefects === "true") {
        text += `Prohlášení o bezdlužnosti: Prodávající prohlašuje, že na věci není exekuce, zástava ani jiné právní vady\n`
      }
      text += "\n"
    }

    return text
  }

  const contractText = renderContractText()

  return (
    <>
      <AppHeader title={contract.name} />
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{contract.name}</h1>
              <p className="text-muted-foreground">
                Vytvořeno: {new Date(contract.createdAt).toLocaleDateString("cs-CZ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateInvoice}>
                <DollarSign className="w-4 h-4 mr-2" />
                Vystavit fakturu
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Smazat
              </Button>
            </div>
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

            {/* Contract Exporter */}
            <ContractExporter
              blocks={contract.blocks}
              contractText={contractText}
              contractType={contract.type}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Change Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Změnové listy</CardTitle>
                  <Button onClick={() => setShowChangeRequestDialog(true)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nový
                  </Button>
                </div>
                <CardDescription>Dodatky a změny smlouvy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {changeRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Zatím žádné změnové listy</p>
                  ) : (
                    changeRequests.map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">Dodatek #{request.requestNumber}</span>
                              {getChangeRequestStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                          </div>
                        </div>

                        {(request.priceIncrease > 0 || request.deadlineExtensionDays > 0) && (
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {request.priceIncrease > 0 && (
                              <span>+{request.priceIncrease.toLocaleString("cs-CZ")} Kč</span>
                            )}
                            {request.deadlineExtensionDays > 0 && (
                              <span>+{request.deadlineExtensionDays}d</span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleApproveChangeRequest(request.id)}
                                size="sm"
                                variant="outline"
                                className="flex-1"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Schválit
                              </Button>
                              <Button
                                onClick={() => handleRejectChangeRequest(request.id)}
                                size="sm"
                                variant="outline"
                                className="flex-1"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Zamítnout
                              </Button>
                            </>
                          )}
                          {request.status === "approved" && (
                            <Button
                              onClick={() => handleDownloadAmendment(request)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Stáhnout dodatek
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteChangeRequest(request.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

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

      {/* Change Request Dialog */}
      <Dialog open={showChangeRequestDialog} onOpenChange={setShowChangeRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nový změnový list</DialogTitle>
            <DialogDescription>
              Zaznamenej změnu požadovanou klientem a vytvořit dodatek ke smlouvě
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="changeDescription">Co klient chce změnit?</Label>
              <Textarea
                id="changeDescription"
                placeholder="např. Rozšíření projektu o další funkcionalitu..."
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="priceIncrease">Navýšení ceny (Kč)</Label>
              <Input
                id="priceIncrease"
                type="number"
                placeholder="0"
                value={priceIncrease}
                onChange={(e) => setPriceIncrease(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="deadlineExtension">Prodloužení termínu (dny)</Label>
              <Input
                id="deadlineExtension"
                type="number"
                placeholder="0"
                value={deadlineExtension}
                onChange={(e) => setDeadlineExtension(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeRequestDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleCreateChangeRequest}>
              <Plus className="w-4 h-4 mr-2" />
              Vytvořit změnový list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </>
  )
}
