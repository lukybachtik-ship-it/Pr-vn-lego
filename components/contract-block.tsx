"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, CheckCircle, AlertCircle } from "lucide-react"
import { IcoVerifier } from "./ico-verifier"
import type { ContractBlock as BlockType } from "@/types/contract"

interface ContractBlockProps {
  block: BlockType
  index: number
  onRemove: (blockId: string) => void
  onUpdate: (blockId: string, data: Record<string, string>) => void
}

export function ContractBlock({ block, index, onRemove, onUpdate }: ContractBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [formData, setFormData] = useState(block.data)

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(block.id, newData)
  }

  const handlePartyVerified = (field: string, verificationData: any) => {
    const newData = {
      ...formData,
      [`${field}Name`]: verificationData.obchodniJmeno || formData[`${field}Name`],
      [`${field}Address`]:
        `${verificationData.sidlo?.nazevUlice || ""} ${verificationData.sidlo?.cisloDomovniho || ""}`.trim(),
      [`${field}City`]: verificationData.sidlo?.nazevObce || "",
      [`${field}Psc`]: verificationData.sidlo?.psc || "",
      [`${field}Region`]: verificationData.sidlo?.nazevKraje || "",
    }
    setFormData(newData)
    onUpdate(block.id, newData)
  }

  const renderBlockContent = () => {
    switch (block.templateId) {
      case "parties":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Jméno 1. strany</label>
              <Input
                placeholder="Tvé jméno nebo název firmy"
                value={formData.party1Name || ""}
                onChange={(e) => handleChange("party1Name", e.target.value)}
              />
            </div>
            <IcoVerifier
              value={formData.party1Ico || ""}
              onChange={(value) => handleChange("party1Ico", value)}
              onVerified={(data) => handlePartyVerified("party1", data)}
              label="IČO 1. strany"
            />
            {formData.party1Address && (
              <div className="space-y-2 p-3 bg-accent/10 rounded-md border border-accent/20">
                <p className="text-xs font-semibold text-accent">✓ Automaticky vyplněno z ARES:</p>
                <div className="text-sm">
                  <p className="font-medium">{formData.party1Name}</p>
                  <p className="text-muted-foreground">{formData.party1Address}</p>
                  <p className="text-muted-foreground">
                    {formData.party1Psc} {formData.party1City}
                  </p>
                  {formData.party1Region && <p className="text-muted-foreground">{formData.party1Region}</p>}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 mt-4">
              <label className="text-sm font-semibold">Jméno 2. strany</label>
              <Input
                placeholder="Jméno či firma partnera"
                value={formData.party2Name || ""}
                onChange={(e) => handleChange("party2Name", e.target.value)}
              />
            </div>
            <IcoVerifier
              value={formData.party2Ico || ""}
              onChange={(value) => handleChange("party2Ico", value)}
              onVerified={(data) => handlePartyVerified("party2", data)}
              label="IČO 2. strany"
            />
            {formData.party2Address && (
              <div className="space-y-2 p-3 bg-accent/10 rounded-md border border-accent/20">
                <p className="text-xs font-semibold text-accent">✓ Automaticky vyplněno z ARES:</p>
                <div className="text-sm">
                  <p className="font-medium">{formData.party2Name}</p>
                  <p className="text-muted-foreground">{formData.party2Address}</p>
                  <p className="text-muted-foreground">
                    {formData.party2Psc} {formData.party2City}
                  </p>
                  {formData.party2Region && <p className="text-muted-foreground">{formData.party2Region}</p>}
                </div>
              </div>
            )}
          </div>
        )
      case "scope":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Popis práce/díla</label>
              <Input
                placeholder="Co se bude dělat?"
                value={formData.scopeDescription || ""}
                onChange={(e) => handleChange("scopeDescription", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Termín plnění</label>
              <Input
                type="date"
                value={formData.deadline || ""}
                onChange={(e) => handleChange("deadline", e.target.value)}
              />
            </div>
          </div>
        )
      case "payment":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Celková částka (Kč)</label>
              <Input
                type="number"
                placeholder="50000"
                value={formData.amount || ""}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Podmínky platby</label>
              <Input
                placeholder="např. 50% záloha, 50% po dodání"
                value={formData.paymentTerms || ""}
                onChange={(e) => handleChange("paymentTerms", e.target.value)}
              />
            </div>
          </div>
        )
      case "timeline":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Začátek projektu</label>
              <Input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Konec projektu</label>
              <Input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Milníky</label>
              <Input
                placeholder="Např.: 30% hotovo do 15.1., 100% do 31.1."
                value={formData.milestones || ""}
                onChange={(e) => handleChange("milestones", e.target.value)}
              />
            </div>
          </div>
        )
      case "deliverables":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Popis předávky</label>
              <Input
                placeholder="Co přesně se předá"
                value={formData.deliverableDescription || ""}
                onChange={(e) => handleChange("deliverableDescription", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Místo a čas předání</label>
              <Input
                placeholder="Kam a kdy se předá"
                value={formData.deliveryLocation || ""}
                onChange={(e) => handleChange("deliveryLocation", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Příjemce a odpovědnost</label>
              <Input
                placeholder="Kdo přebírá, kdo nese odpovědnost"
                value={formData.acceptanceResponsibility || ""}
                onChange={(e) => handleChange("acceptanceResponsibility", e.target.value)}
              />
            </div>
          </div>
        )
      case "warranty":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Délka záruky (měsíce)</label>
              <Input
                type="number"
                placeholder="12"
                value={formData.warrantyPeriod || ""}
                onChange={(e) => handleChange("warrantyPeriod", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Rozsah záruky</label>
              <Input
                placeholder="Co záruka pokrývá"
                value={formData.warrantyCoverage || ""}
                onChange={(e) => handleChange("warrantyCoverage", e.target.value)}
              />
            </div>
          </div>
        )
      case "confidentiality":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Doba důvěrnosti (měsíce)</label>
              <Input
                type="number"
                placeholder="24"
                value={formData.confidentialityPeriod || ""}
                onChange={(e) => handleChange("confidentialityPeriod", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Popis důvěrných informací</label>
              <Input
                placeholder="Jaké informace se nesmí zveřejňovat"
                value={formData.confidentialityScope || ""}
                onChange={(e) => handleChange("confidentialityScope", e.target.value)}
              />
            </div>
          </div>
        )
      case "termination":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Výpověď (dny)</label>
              <Input
                type="number"
                placeholder="30"
                value={formData.terminationNotice || ""}
                onChange={(e) => handleChange("terminationNotice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Důvody pro ukončení</label>
              <Input
                placeholder="Za jakých podmínek se smlouva může ukončit"
                value={formData.terminationReasons || ""}
                onChange={(e) => handleChange("terminationReasons", e.target.value)}
              />
            </div>
          </div>
        )
      case "property":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Typ nemovitosti</label>
              <Input
                placeholder="Byt, dům, kancelář, atd."
                value={formData.propertyType || ""}
                onChange={(e) => handleChange("propertyType", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Adresa nemovitosti</label>
              <Input
                placeholder="Ulice, číslo, město, PSČ"
                value={formData.propertyAddress || ""}
                onChange={(e) => handleChange("propertyAddress", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Popis (pokoje, vybavení, atd.)</label>
              <Input
                placeholder="Popis pronajímané nemovitosti"
                value={formData.propertyDescription || ""}
                onChange={(e) => handleChange("propertyDescription", e.target.value)}
              />
            </div>
          </div>
        )
      case "rental-period":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Počátek pronájmu</label>
              <Input
                type="date"
                value={formData.rentalStart || ""}
                onChange={(e) => handleChange("rentalStart", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Konec pronájmu</label>
              <Input
                type="date"
                value={formData.rentalEnd || ""}
                onChange={(e) => handleChange("rentalEnd", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Typ pronájmu</label>
              <Input
                placeholder="Dlouhodobý, krátkodobý, atd."
                value={formData.rentalType || ""}
                onChange={(e) => handleChange("rentalType", e.target.value)}
              />
            </div>
          </div>
        )
      case "rental-price":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Měsíční nájemné (Kč)</label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.monthlyRent || ""}
                onChange={(e) => handleChange("monthlyRent", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Splatnost</label>
              <Input
                placeholder="Do 5. dne v měsíci, do 10. atd."
                value={formData.rentalDueDate || ""}
                onChange={(e) => handleChange("rentalDueDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Způsob platby</label>
              <Input
                placeholder="Bankovní převod, hotovost, atd."
                value={formData.rentalPaymentMethod || ""}
                onChange={(e) => handleChange("rentalPaymentMethod", e.target.value)}
              />
            </div>
          </div>
        )
      case "deposit":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Výše kauce (Kč)</label>
              <Input
                type="number"
                placeholder="20000"
                value={formData.depositAmount || ""}
                onChange={(e) => handleChange("depositAmount", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Účel kauce</label>
              <Input
                placeholder="Pojistka na škody, opravy, atd."
                value={formData.depositPurpose || ""}
                onChange={(e) => handleChange("depositPurpose", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Vrácení kauce</label>
              <Input
                placeholder="Vrácení do 30 dnů po ukončení pronájmu"
                value={formData.depositReturn || ""}
                onChange={(e) => handleChange("depositReturn", e.target.value)}
              />
            </div>
          </div>
        )
      case "utilities":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Kdo platí za elektřinu</label>
              <Input
                placeholder="Nájemce, pronajímatel, děleno"
                value={formData.electricityCost || ""}
                onChange={(e) => handleChange("electricityCost", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Kdo platí za plyn</label>
              <Input
                placeholder="Nájemce, pronajímatel, děleno"
                value={formData.gasCost || ""}
                onChange={(e) => handleChange("gasCost", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Kdo platí za vodu</label>
              <Input
                placeholder="Nájemce, pronajímatel, děleno"
                value={formData.waterCost || ""}
                onChange={(e) => handleChange("waterCost", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Ostatní poplatky</label>
              <Input
                placeholder="Internet, TV, poplatky za opravu, atd."
                value={formData.otherUtilities || ""}
                onChange={(e) => handleChange("otherUtilities", e.target.value)}
              />
            </div>
          </div>
        )
      case "maintenance":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Údržba pronajatého majetku</label>
              <Input
                placeholder="Kdo platí za údržbu"
                value={formData.maintenanceResponsibility || ""}
                onChange={(e) => handleChange("maintenanceResponsibility", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Opravy majetku</label>
              <Input
                placeholder="Malé opravy dělá nájemce, velké pronajímatel, atd."
                value={formData.repairResponsibility || ""}
                onChange={(e) => handleChange("repairResponsibility", e.target.value)}
              />
            </div>
          </div>
        )
      case "rules":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Domácí řád</label>
              <Input
                placeholder="Klid v noci, zákaz kouření, domácích zvířat, atd."
                value={formData.houseRules || ""}
                onChange={(e) => handleChange("houseRules", e.target.value)}
              />
            </div>
          </div>
        )
      case "insurance":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Pojištění</label>
              <Input
                placeholder="Povinné pojištění a jeho podmínky"
                value={formData.insuranceRequirements || ""}
                onChange={(e) => handleChange("insuranceRequirements", e.target.value)}
              />
            </div>
          </div>
        )
      case "termination-rental":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Výpověď pronájmu (dny)</label>
              <Input
                type="number"
                placeholder="30"
                value={formData.rentalTerminationNotice || ""}
                onChange={(e) => handleChange("rentalTerminationNotice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Vypořádání při ukončení</label>
              <Input
                placeholder="Vrácení klíčů, stav nemovitosti, vyúčtování, atd."
                value={formData.rentalSettlement || ""}
                onChange={(e) => handleChange("rentalSettlement", e.target.value)}
              />
            </div>
          </div>
        )
      case "goods":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Popis zboží/služeb</label>
              <Input
                placeholder="Přesný popis toho, co se prodává"
                value={formData.goodsDescription || ""}
                onChange={(e) => handleChange("goodsDescription", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Množství/Počet</label>
              <Input
                placeholder="Kolik kusů, metrů, atd."
                value={formData.goodsQuantity || ""}
                onChange={(e) => handleChange("goodsQuantity", e.target.value)}
              />
            </div>
          </div>
        )
      case "pricing":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Jednotková cena (Kč)</label>
              <Input
                type="number"
                placeholder="1000"
                value={formData.unitPrice || ""}
                onChange={(e) => handleChange("unitPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Slevy</label>
              <Input
                placeholder="Např. 10% sleva za objem nad 100 ks"
                value={formData.discounts || ""}
                onChange={(e) => handleChange("discounts", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">DPH</label>
              <Input
                placeholder="21%, 15%, bez DPH, atd."
                value={formData.vatRate || ""}
                onChange={(e) => handleChange("vatRate", e.target.value)}
              />
            </div>
          </div>
        )
      case "payment-terms":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Forma úhrady</label>
              <Input
                placeholder="Bankovní převod, hotovost, karta, atd."
                value={formData.paymentForm || ""}
                onChange={(e) => handleChange("paymentForm", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Splatnost faktury (dny)</label>
              <Input
                type="number"
                placeholder="14"
                value={formData.invoiceDays || ""}
                onChange={(e) => handleChange("invoiceDays", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Pokuta za zpoždění platby</label>
              <Input
                placeholder="Např. 0,05% z ceny za den zpoždění"
                value={formData.latePenalty || ""}
                onChange={(e) => handleChange("latePenalty", e.target.value)}
              />
            </div>
          </div>
        )
      case "delivery":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Místo dodání</label>
              <Input
                placeholder="Sídlo kupujícího, sídlo prodávajícího, třetí strana"
                value={formData.deliveryPlace || ""}
                onChange={(e) => handleChange("deliveryPlace", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Čas dodání</label>
              <Input
                placeholder="Např. do 14 dní od objednávky"
                value={formData.deliveryTime || ""}
                onChange={(e) => handleChange("deliveryTime", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Kdo platí dopravu</label>
              <Input
                placeholder="Prodávající, kupující, děleno"
                value={formData.deliveryPayment || ""}
                onChange={(e) => handleChange("deliveryPayment", e.target.value)}
              />
            </div>
          </div>
        )
      case "quality":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Normy a kvalita</label>
              <Input
                placeholder="Jaké normy musí zboží splňovat"
                value={formData.qualityStandards || ""}
                onChange={(e) => handleChange("qualityStandards", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Reklamační lhůta (dny)</label>
              <Input
                type="number"
                placeholder="14"
                value={formData.claimDeadline || ""}
                onChange={(e) => handleChange("claimDeadline", e.target.value)}
              />
            </div>
          </div>
        )
      case "returns":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Lhůta pro vrácení (dny)</label>
              <Input
                type="number"
                placeholder="14"
                value={formData.returnDeadline || ""}
                onChange={(e) => handleChange("returnDeadline", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Podmínky vrácení</label>
              <Input
                placeholder="Nepoužité, v původním balení, atd."
                value={formData.returnConditions || ""}
                onChange={(e) => handleChange("returnConditions", e.target.value)}
              />
            </div>
          </div>
        )
      case "liability":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Odpovědnost za škodu</label>
              <Input
                placeholder="Limit odpovědnosti, vyloučené škody, atd."
                value={formData.liabilityTerms || ""}
                onChange={(e) => handleChange("liabilityTerms", e.target.value)}
              />
            </div>
          </div>
        )
      case "privacy":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Ochrana osobních údajů</label>
              <Input
                placeholder="GDPR soulad, jak se data používají, atd."
                value={formData.privacyTerms || ""}
                onChange={(e) => handleChange("privacyTerms", e.target.value)}
              />
            </div>
          </div>
        )
      case "dispute":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Řešení sporů</label>
              <Input
                placeholder="Mimosoudní, arbitráž, soud, atd."
                value={formData.disputeResolution || ""}
                onChange={(e) => handleChange("disputeResolution", e.target.value)}
              />
            </div>
          </div>
        )
      case "intellectual":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Duševní vlastnictví</label>
              <Input
                placeholder="Copyrighty, licence, patenty, atd."
                value={formData.intellectualTerms || ""}
                onChange={(e) => handleChange("intellectualTerms", e.target.value)}
              />
            </div>
          </div>
        )
      case "penalties":
        return (
          <div className="space-y-3 bg-destructive/5 p-3 rounded-md border border-destructive/20">
            <p className="text-xs text-destructive font-semibold">⚠️ Varování: Nastavuj rozumně!</p>
            <div>
              <label className="text-sm font-semibold">Pokuta za zpoždění (Kč/den)</label>
              <Input
                type="number"
                placeholder="100"
                value={formData.penaltyAmount || ""}
                onChange={(e) => handleChange("penaltyAmount", e.target.value)}
              />
            </div>
          </div>
        )
      default:
        return (
          <div>
            <Input placeholder="Obsah bloku" />
          </div>
        )
    }
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{block.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{block.name}</p>
            {block.isComplete && (
              <p className="text-xs text-accent flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Vyplněno
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!block.isComplete && block.templateId === "penalties" && <AlertCircle className="w-4 h-4 text-warning" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(block.id)
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && <div className="border-t border-border p-4 bg-muted/30">{renderBlockContent()}</div>}
    </Card>
  )
}
