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
import { FileText, Trash2, Calendar, DollarSign, Plus, CheckCircle, XCircle, AlertCircle, Download, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getContract, deleteContract } from "@/lib/contract-storage"
import { ContractTimelineComponent } from "@/components/contract-timeline"
import { HandoverProtocolGenerator } from "@/components/handover-protocol-generator"
import { CalendarExportDialog } from "@/components/calendar-export-dialog"
import { ContractExporter } from "@/components/contract-exporter"
import { AppLayout } from "@/components/app-layout"
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

// Skeleton component
function SkeletonContractDetail() {
  return (
    <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-card border border-border rounded-md">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-md">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

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
      <AppLayout>
        <SkeletonContractDetail />
      </AppLayout>
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
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-primary" strokeWidth={1.75} />
                {contract.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Vytvořeno: {new Date(contract.createdAt).toLocaleDateString("cs-CZ")}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={handleGenerateInvoice}>
                <DollarSign className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                Vystavit fakturu
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" strokeWidth={1.75} />
                <h3 className="text-sm font-medium">Náhled smlouvy</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {completedBlocks.length} ze {contract.blocks.length} sekcí vyplněno
                </span>
              </div>
              <div className="bg-background p-4 rounded-md border border-border whitespace-pre-wrap font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto">
                {contractText}
              </div>
            </div>

            {/* Contract Exporter */}
            <div className="stagger-item" style={{ animationDelay: "50ms" }}>
              <ContractExporter
                blocks={contract.blocks}
                contractText={contractText}
                contractType={contract.type}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Change Requests */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Změnové listy</h3>
                <Button onClick={() => setShowChangeRequestDialog(true)} size="sm" variant="outline" className="h-7 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={1.75} />
                  Nový
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Dodatky a změny smlouvy</p>
              <div className="space-y-2">
                {changeRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Zatím žádné změnové listy</p>
                ) : (
                  changeRequests.map((request, index) => (
                    <div key={request.id} className="p-3 border border-border rounded-md space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">Dodatek #{request.requestNumber}</span>
                            {getChangeRequestStatusBadge(request.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">{request.description}</p>
                        </div>
                      </div>

                      {(request.priceIncrease > 0 || request.deadlineExtensionDays > 0) && (
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          {request.priceIncrease > 0 && (
                            <span className="text-success">+{request.priceIncrease.toLocaleString("cs-CZ")} Kč</span>
                          )}
                          {request.deadlineExtensionDays > 0 && (
                            <span>+{request.deadlineExtensionDays}d</span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-1.5 pt-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleApproveChangeRequest(request.id)}
                              size="sm"
                              variant="outline"
                              className="flex-1 h-7 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Schválit
                            </Button>
                            <Button
                              onClick={() => handleRejectChangeRequest(request.id)}
                              size="sm"
                              variant="outline"
                              className="flex-1 h-7 text-xs"
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
                            className="flex-1 h-7 text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Stáhnout dodatek
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteChangeRequest(request.id)}
                          size="icon-sm"
                          variant="ghost"
                          className="h-7 w-7"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Handover Protocol Generator - only for work contracts */}
            {contract.type === "work-contract" && (
              <div className="stagger-item" style={{ animationDelay: "150ms" }}>
                <HandoverProtocolGenerator
                  contractId={contract.id}
                  contractName={contract.name}
                  contractType={contract.type}
                  blocks={contract.blocks}
                />
              </div>
            )}

            {/* Timeline */}
            {timeline.deadlines.length > 0 && (
              <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Časová osa smlouvy</h3>
                  <Button onClick={() => setShowCalendarDialog(true)} variant="outline" size="sm" className="h-7 text-xs">
                    <Calendar className="w-3.5 h-3.5 mr-1" strokeWidth={1.75} />
                    Přidat do kalendáře
                  </Button>
                </div>
                <ContractTimelineComponent timeline={timeline} />
              </div>
            )}

            {/* Contract Info */}
            <div className="p-4 bg-card border border-border rounded-md stagger-item" style={{ animationDelay: "250ms" }}>
              <h3 className="text-sm font-medium mb-3">Informace o smlouvě</h3>
              <div className="space-y-2 text-xs">
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
              </div>
            </div>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nový změnový list</DialogTitle>
            <DialogDescription>
              Zaznamenej změnu požadovanou klientem a vytvořit dodatek ke smlouvě
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="changeDescription" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Co klient chce změnit?
              </Label>
              <Textarea
                id="changeDescription"
                placeholder="např. Rozšíření projektu o další funkcionalitu..."
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="priceIncrease" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Navýšení ceny (Kč)
                </Label>
                <Input
                  id="priceIncrease"
                  type="number"
                  placeholder="0"
                  value={priceIncrease}
                  onChange={(e) => setPriceIncrease(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="deadlineExtension" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Prodloužení termínu (dny)
                </Label>
                <Input
                  id="deadlineExtension"
                  type="number"
                  placeholder="0"
                  value={deadlineExtension}
                  onChange={(e) => setDeadlineExtension(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowChangeRequestDialog(false)}>
              Zrušit
            </Button>
            <Button size="sm" onClick={handleCreateChangeRequest}>
              <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
              Vytvořit změnový list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
