"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Copy, ChevronLeft, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContractExporter } from "./contract-exporter"
import { MissingBlocksAnalysis } from "./missing-blocks-analysis"
import { ContractTimelineComponent } from "./contract-timeline"
import { analyzeContract } from "@/lib/contract-analysis"
import { extractContractDeadlines } from "@/lib/contract-timeline"
import { finalizeContract } from "@/lib/contract-storage"
import type { ContractBlock } from "@/types/contract"

interface ContractReviewProps {
  contractType: string
  blocks: ContractBlock[]
}

export function ContractReview({ contractType, blocks }: ContractReviewProps) {
  const router = useRouter()
  const [exportFormat, setExportFormat] = useState<"docx" | "pdf">("docx")
  const [copied, setCopied] = useState(false)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [contractName, setContractName] = useState("")

  // Analyze contract for missing blocks
  const analysis = useMemo(() => analyzeContract(contractType, blocks), [contractType, blocks])

  // Extract timeline deadlines
  const timeline = useMemo(() => extractContractDeadlines(blocks, contractType), [blocks, contractType])

  const handleAddMissingBlock = (blockId: string) => {
    // Navigate back to builder with the block to add
    router.push(`/builder?type=${contractType}&addBlock=${blockId}`)
  }

  const completedBlocks = blocks.filter((b) => b.isComplete)

  const getContractTitle = () => {
    switch (contractType) {
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

    if (blocks.some((b) => b.templateId === "parties" && b.isComplete)) {
      const partiesBlock = blocks.find((b) => b.templateId === "parties")
      text += "SMLUVNÍ STRANY:\n\n"

      text += `1. PRVNÍ STRANA\n`
      text += `   Jméno: ${partiesBlock?.data.party1Name || "Neuvedeno"}\n`
      if (partiesBlock?.data.party1Ico) text += `   IČO: ${partiesBlock.data.party1Ico}\n`
      if (partiesBlock?.data.party1Address) text += `   Adresa: ${partiesBlock.data.party1Address}\n`
      if (partiesBlock?.data.party1Psc) text += `   PSČ: ${partiesBlock.data.party1Psc}\n`
      if (partiesBlock?.data.party1City) text += `   Město: ${partiesBlock.data.party1City}\n`
      if (partiesBlock?.data.party1Region) text += `   Kraj: ${partiesBlock.data.party1Region}\n`
      text += "\n"

      text += `2. DRUHÁ STRANA\n`
      text += `   Jméno: ${partiesBlock?.data.party2Name || "Neuvedeno"}\n`
      if (partiesBlock?.data.party2Ico) text += `   IČO: ${partiesBlock.data.party2Ico}\n`
      if (partiesBlock?.data.party2Address) text += `   Adresa: ${partiesBlock.data.party2Address}\n`
      if (partiesBlock?.data.party2Psc) text += `   PSČ: ${partiesBlock.data.party2Psc}\n`
      if (partiesBlock?.data.party2City) text += `   Město: ${partiesBlock.data.party2City}\n`
      if (partiesBlock?.data.party2Region) text += `   Kraj: ${partiesBlock.data.party2Region}\n`
      text += "\n"
    }

    // Work contract sections
    if (blocks.some((b) => b.templateId === "scope" && b.isComplete)) {
      const scopeBlock = blocks.find((b) => b.templateId === "scope")
      text += "PŘEDMĚT DÍLA:\n"
      text += `${scopeBlock?.data.scopeDescription}\n`
      if (scopeBlock?.data.deadline) {
        text += `Termín plnění: ${scopeBlock.data.deadline}\n`
      }
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "timeline" && b.isComplete)) {
      const timelineBlock = blocks.find((b) => b.templateId === "timeline")
      text += "ČASOVÝ PLÁN:\n"
      if (timelineBlock?.data.startDate) text += `Začátek: ${timelineBlock.data.startDate}\n`
      if (timelineBlock?.data.endDate) text += `Konec: ${timelineBlock.data.endDate}\n`
      if (timelineBlock?.data.milestones) text += `Milníky: ${timelineBlock.data.milestones}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "deliverables" && b.isComplete)) {
      const delivBlock = blocks.find((b) => b.templateId === "deliverables")
      text += "PŘEDÁNÍ DÍLA:\n"
      if (delivBlock?.data.deliverableDescription) text += `Popis: ${delivBlock.data.deliverableDescription}\n`
      if (delivBlock?.data.deliveryLocation) text += `Místo a čas: ${delivBlock.data.deliveryLocation}\n`
      if (delivBlock?.data.acceptanceResponsibility) text += `Příjemce: ${delivBlock.data.acceptanceResponsibility}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "payment" && b.isComplete)) {
      const paymentBlock = blocks.find((b) => b.templateId === "payment")
      text += "CENA A SPLATNOST:\n"
      text += `Celková částka: ${paymentBlock?.data.amount} Kč\n`
      text += `Podmínky platby: ${paymentBlock?.data.paymentTerms}\n\n`
    }

    if (blocks.some((b) => b.templateId === "warranty" && b.isComplete)) {
      const warrantyBlock = blocks.find((b) => b.templateId === "warranty")
      text += "ZÁRUKA:\n"
      if (warrantyBlock?.data.warrantyPeriod) text += `Délka záruky: ${warrantyBlock.data.warrantyPeriod} měsíců\n`
      if (warrantyBlock?.data.warrantyCoverage) text += `Rozsah: ${warrantyBlock.data.warrantyCoverage}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "confidentiality" && b.isComplete)) {
      const confBlock = blocks.find((b) => b.templateId === "confidentiality")
      text += "DŮVĚRNOST:\n"
      if (confBlock?.data.confidentialityPeriod)
        text += `Doba důvěrnosti: ${confBlock.data.confidentialityPeriod} měsíců\n`
      if (confBlock?.data.confidentialityScope) text += `Rozsah: ${confBlock.data.confidentialityScope}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "termination" && b.isComplete)) {
      const termBlock = blocks.find((b) => b.templateId === "termination")
      text += "UKONČENÍ SMLOUVY:\n"
      if (termBlock?.data.terminationNotice) text += `Výpověď: ${termBlock.data.terminationNotice} dnů\n`
      if (termBlock?.data.terminationReasons) text += `Důvody: ${termBlock.data.terminationReasons}\n`
      text += "\n"
    }

    // Rental contract sections
    if (blocks.some((b) => b.templateId === "property" && b.isComplete)) {
      const propBlock = blocks.find((b) => b.templateId === "property")
      text += "PŘEDMĚT PRONÁJMU:\n"
      if (propBlock?.data.propertyType) text += `Typ: ${propBlock.data.propertyType}\n`
      if (propBlock?.data.propertyAddress) text += `Adresa: ${propBlock.data.propertyAddress}\n`
      if (propBlock?.data.propertyDescription) text += `Popis: ${propBlock.data.propertyDescription}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "rental-period" && b.isComplete)) {
      const rentalPeriodBlock = blocks.find((b) => b.templateId === "rental-period")
      text += "DOBA PRONÁJMU:\n"
      if (rentalPeriodBlock?.data.rentalStart) text += `Od: ${rentalPeriodBlock.data.rentalStart}\n`
      if (rentalPeriodBlock?.data.rentalEnd) text += `Do: ${rentalPeriodBlock.data.rentalEnd}\n`
      if (rentalPeriodBlock?.data.rentalType) text += `Typ: ${rentalPeriodBlock.data.rentalType}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "rental-price" && b.isComplete)) {
      const rentalPriceBlock = blocks.find((b) => b.templateId === "rental-price")
      text += "NÁJEMNÉ A POPLATKY:\n"
      if (rentalPriceBlock?.data.monthlyRent) text += `Měsíční nájemné: ${rentalPriceBlock.data.monthlyRent} Kč\n`
      if (rentalPriceBlock?.data.rentalDueDate) text += `Splatnost: ${rentalPriceBlock.data.rentalDueDate}\n`
      if (rentalPriceBlock?.data.rentalPaymentMethod)
        text += `Způsob platby: ${rentalPriceBlock.data.rentalPaymentMethod}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "deposit" && b.isComplete)) {
      const depositBlock = blocks.find((b) => b.templateId === "deposit")
      text += "KAUCE:\n"
      if (depositBlock?.data.depositAmount) text += `Výše: ${depositBlock.data.depositAmount} Kč\n`
      if (depositBlock?.data.depositPurpose) text += `Účel: ${depositBlock.data.depositPurpose}\n`
      if (depositBlock?.data.depositReturn) text += `Vrácení: ${depositBlock.data.depositReturn}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "utilities" && b.isComplete)) {
      const utilBlock = blocks.find((b) => b.templateId === "utilities")
      text += "VEDLEJŠÍ NÁKLADY:\n"
      if (utilBlock?.data.electricityCost) text += `Elektřina: ${utilBlock.data.electricityCost}\n`
      if (utilBlock?.data.gasCost) text += `Plyn: ${utilBlock.data.gasCost}\n`
      if (utilBlock?.data.waterCost) text += `Voda: ${utilBlock.data.waterCost}\n`
      if (utilBlock?.data.otherUtilities) text += `Ostatní: ${utilBlock.data.otherUtilities}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "maintenance" && b.isComplete)) {
      const maintBlock = blocks.find((b) => b.templateId === "maintenance")
      text += "ÚDRŽBA A OPRAVY:\n"
      if (maintBlock?.data.maintenanceResponsibility) text += `Údržba: ${maintBlock.data.maintenanceResponsibility}\n`
      if (maintBlock?.data.repairResponsibility) text += `Opravy: ${maintBlock.data.repairResponsibility}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "rules" && b.isComplete)) {
      const rulesBlock = blocks.find((b) => b.templateId === "rules")
      text += "DOMÁCÍ ŘÁD:\n"
      if (rulesBlock?.data.houseRules) text += `${rulesBlock.data.houseRules}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "insurance" && b.isComplete)) {
      const insBlock = blocks.find((b) => b.templateId === "insurance")
      text += "POJIŠTĚNÍ:\n"
      if (insBlock?.data.insuranceRequirements) text += `${insBlock.data.insuranceRequirements}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "termination-rental" && b.isComplete)) {
      const termRentalBlock = blocks.find((b) => b.templateId === "termination-rental")
      text += "UKONČENÍ PRONÁJMU:\n"
      if (termRentalBlock?.data.rentalTerminationNotice)
        text += `Výpověď: ${termRentalBlock.data.rentalTerminationNotice} dnů\n`
      if (termRentalBlock?.data.rentalSettlement) text += `Vypořádání: ${termRentalBlock.data.rentalSettlement}\n`
      text += "\n"
    }

    // Trade contract sections
    if (blocks.some((b) => b.templateId === "goods" && b.isComplete)) {
      const goodsBlock = blocks.find((b) => b.templateId === "goods")
      text += "POPIS ZBOŽÍ/SLUŽEB:\n"
      if (goodsBlock?.data.goodsDescription) text += `Popis: ${goodsBlock.data.goodsDescription}\n`
      if (goodsBlock?.data.goodsQuantity) text += `Množství: ${goodsBlock.data.goodsQuantity}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "pricing" && b.isComplete)) {
      const pricingBlock = blocks.find((b) => b.templateId === "pricing")
      text += "CENY A PODMÍNKY:\n"
      if (pricingBlock?.data.unitPrice) text += `Jednotková cena: ${pricingBlock.data.unitPrice} Kč\n`
      if (pricingBlock?.data.discounts) text += `Slevy: ${pricingBlock.data.discounts}\n`
      if (pricingBlock?.data.vatRate) text += `DPH: ${pricingBlock.data.vatRate}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "payment-terms" && b.isComplete)) {
      const payTermsBlock = blocks.find((b) => b.templateId === "payment-terms")
      text += "PODMÍNKY PLATBY:\n"
      if (payTermsBlock?.data.paymentForm) text += `Forma úhrady: ${payTermsBlock.data.paymentForm}\n`
      if (payTermsBlock?.data.invoiceDays) text += `Splatnost faktury: ${payTermsBlock.data.invoiceDays} dnů\n`
      if (payTermsBlock?.data.latePenalty) text += `Pokuta za zpoždění: ${payTermsBlock.data.latePenalty}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "delivery" && b.isComplete)) {
      const deliveryBlock = blocks.find((b) => b.templateId === "delivery")
      text += "DODÁNÍ:\n"
      if (deliveryBlock?.data.deliveryPlace) text += `Místo: ${deliveryBlock.data.deliveryPlace}\n`
      if (deliveryBlock?.data.deliveryTime) text += `Čas: ${deliveryBlock.data.deliveryTime}\n`
      if (deliveryBlock?.data.deliveryPayment) text += `Platba za dopravu: ${deliveryBlock.data.deliveryPayment}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "quality" && b.isComplete)) {
      const qualityBlock = blocks.find((b) => b.templateId === "quality")
      text += "KVALITA A REKLAMACE:\n"
      if (qualityBlock?.data.qualityStandards) text += `Normy: ${qualityBlock.data.qualityStandards}\n`
      if (qualityBlock?.data.claimDeadline) text += `Reklamační lhůta: ${qualityBlock.data.claimDeadline} dnů\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "returns" && b.isComplete)) {
      const returnsBlock = blocks.find((b) => b.templateId === "returns")
      text += "VRÁCENÍ ZBOŽÍ:\n"
      if (returnsBlock?.data.returnDeadline) text += `Lhůta: ${returnsBlock.data.returnDeadline} dnů\n`
      if (returnsBlock?.data.returnConditions) text += `Podmínky: ${returnsBlock.data.returnConditions}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "liability" && b.isComplete)) {
      const liabilityBlock = blocks.find((b) => b.templateId === "liability")
      text += "ODPOVĚDNOST ZA ŠKODU:\n"
      if (liabilityBlock?.data.liabilityTerms) text += `${liabilityBlock.data.liabilityTerms}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "privacy" && b.isComplete)) {
      const privacyBlock = blocks.find((b) => b.templateId === "privacy")
      text += "OCHRANA OSOBNÍCH ÚDAJŮ:\n"
      if (privacyBlock?.data.privacyTerms) text += `${privacyBlock.data.privacyTerms}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "dispute" && b.isComplete)) {
      const disputeBlock = blocks.find((b) => b.templateId === "dispute")
      text += "ŘEŠENÍ SPORŮ:\n"
      if (disputeBlock?.data.disputeResolution) text += `${disputeBlock.data.disputeResolution}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "intellectual" && b.isComplete)) {
      const intlBlock = blocks.find((b) => b.templateId === "intellectual")
      text += "DUŠEVNÍ VLASTNICTVÍ:\n"
      if (intlBlock?.data.intellectualTerms) text += `${intlBlock.data.intellectualTerms}\n`
      text += "\n"
    }

    if (blocks.some((b) => b.templateId === "penalties" && b.isComplete)) {
      const penaltyBlock = blocks.find((b) => b.templateId === "penalties")
      text += "SMLUVNÍ POKUTY:\n"
      text += `Pokuta za zpoždění: ${penaltyBlock?.data.penaltyAmount} Kč za den\n\n`
    }

    text += "---\n\n"
    text += "PODPISY STRAN:\n\n"
    text += "________________                ________________\n"
    text += "Podpis 1. strany              Podpis 2. strany\n"

    return text
  }

  const contractText = renderContractText()

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(contractText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = (format: "docx" | "pdf") => {
    setExportFormat(format)
  }

  const handleFinalizeContract = () => {
    const contract = finalizeContract(contractType, blocks, contractName || undefined)
    setShowFinalizeDialog(false)
    router.push(`/?finalized=${contract.id}`)
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zpět na tvorbu
          </Button>
          <h1 className="text-4xl font-bold mb-2">Kontrola smlouvy</h1>
          <p className="text-muted-foreground">Zkontroluj a exportuj svou smlouvu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Section */}
            <MissingBlocksAnalysis analysis={analysis} onAddBlock={handleAddMissingBlock} />

            <Card>
              <CardHeader>
                <CardTitle>Náhled smlouvy</CardTitle>
                <CardDescription>
                  {completedBlocks.length} ze {blocks.length} sekcí vyplněno
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-background p-6 rounded-lg border border-border whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                  {contractText}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Zkopírováno!" : "Kopírovat text"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validation Warnings */}
            {blocks.some((b) => b.templateId === "penalties" && b.isComplete) && (
              <Card className="border-warning bg-warning/5">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <CardTitle className="text-base">Pozor na smluvní pokuty</CardTitle>
                      <CardDescription>
                        Ujisti se, že jsou pokuty nastaveny rozumně a v souladu se zákonem
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Export Panel */}
          <div className="space-y-6">
            <ContractExporter blocks={blocks} contractText={contractText} onExport={handleExport} />

            {/* Finalize Contract Card */}
            <Card className="border-green-500 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Uzavřít smlouvu
                </CardTitle>
                <CardDescription className="text-green-600">
                  Ulož smlouvu jako finální a sleduj termíny v dashboardu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowFinalizeDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Uzavřít a uložit smlouvu
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            {timeline.deadlines.length > 0 && <ContractTimelineComponent timeline={timeline} />}
          </div>
        </div>
      </div>

      {/* Finalize Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uzavřít smlouvu</DialogTitle>
            <DialogDescription>
              Smlouva bude uložena jako finální a zobrazí se v přehledu na hlavní stránce. Termíny ze smlouvy budou sledovány.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contract-name">Název smlouvy (volitelné)</Label>
              <Input
                id="contract-name"
                placeholder="např. Smlouva o dílo - Vývoj webu"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pokud nevyplníte, použije se automatický název s dnešním datem
              </p>
            </div>

            <div className="rounded-lg border border-border p-4 bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Přehled smlouvy:</h4>
              <ul className="text-sm space-y-1">
                <li>• Typ: {getContractTitle()}</li>
                <li>• Vyplněno sekcí: {completedBlocks.length}/{blocks.length}</li>
                <li>• Termínů k hlídání: {timeline.deadlines.length}</li>
                {analysis.completenessScore < 80 && (
                  <li className="text-yellow-600">
                    • Kompletnost: {analysis.completenessScore}% (může chybět důležité info)
                  </li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleFinalizeContract} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Uzavřít smlouvu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
