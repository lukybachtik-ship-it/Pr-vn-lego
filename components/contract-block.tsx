"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, CheckCircle, AlertCircle, Users, HelpCircle } from "lucide-react"
import { IcoVerifier } from "./ico-verifier"
import { ClientSelector } from "./client-selector"
import type { ContractBlock as BlockType } from "@/types/contract"
import type { Client } from "@/lib/clients"

interface ContractBlockProps {
  block: BlockType
  index: number
  onRemove: (blockId: string) => void
  onUpdate: (blockId: string, data: Record<string, string>) => void
}

export function ContractBlock({ block, index, onRemove, onUpdate }: ContractBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [formData, setFormData] = useState(block.data)
  const [showClientSelector, setShowClientSelector] = useState(false)
  const [selectedPartyField, setSelectedPartyField] = useState<"party1" | "party2" | null>(null)

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(block.id, newData)
  }

  const handleClientSelect = (client: Client) => {
    if (!selectedPartyField) return

    const newData = {
      ...formData,
      [`${selectedPartyField}Name`]: client.name,
      [`${selectedPartyField}Ico`]: client.ico || "",
      [`${selectedPartyField}Address`]: client.street || "",
      [`${selectedPartyField}City`]: client.city || "",
      [`${selectedPartyField}Psc`]: client.zip || "",
      [`${selectedPartyField}Region`]: client.region || "",
    }
    setFormData(newData)
    onUpdate(block.id, newData)
    setSelectedPartyField(null)
  }

  const openClientSelector = (party: "party1" | "party2") => {
    setSelectedPartyField(party)
    setShowClientSelector(true)
  }

  const handlePartyVerified = (field: string, verificationData: any) => {
    // Build full address with house number and optional orientation number
    const streetAddress = [
      verificationData.sidlo?.nazevUlice,
      verificationData.sidlo?.cisloDomovni,
      verificationData.sidlo?.cisloOrientacni ? `/${verificationData.sidlo.cisloOrientacni}` : null,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()

    const newData = {
      ...formData,
      [`${field}Name`]: verificationData.obchodniJmeno || formData[`${field}Name`],
      [`${field}Address`]: streetAddress,
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">1. strana</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openClientSelector("party1")}
              >
                <Users className="w-4 h-4 mr-2" />
                Přidat z kontaktů
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Jméno 1. strany</label>
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">2. strana</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openClientSelector("party2")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Přidat z kontaktů
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jméno 2. strany</label>
                <Input
                  placeholder="Jméno či firma partnera"
                  value={formData.party2Name || ""}
                  onChange={(e) => handleChange("party2Name", e.target.value)}
                />
              </div>
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
            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-sm font-semibold">Typ ceny</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.priceType || "fixed"}
                  onChange={(e) => handleChange("priceType", e.target.value)}
                >
                  <option value="fixed">Pevná cena</option>
                  <option value="estimated">Odhadová cena</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.priceType === "estimated"
                    ? "Cena může být upravena dle skutečnosti"
                    : "Cena je konečná a neměnná"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Záloha (Kč)</label>
                <Input
                  type="number"
                  placeholder="20000"
                  value={formData.advancePayment || ""}
                  onChange={(e) => handleChange("advancePayment", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Platba před zahájením prací</p>
              </div>
              <div>
                <label className="text-sm font-semibold">Splatnost faktur (dny)</label>
                <Input
                  type="number"
                  placeholder="14"
                  value={formData.maturityDays || ""}
                  onChange={(e) => handleChange("maturityDays", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Počet dnů od vystavení faktury</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold">Zádržné (%)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Část ceny (obvykle 5-10%), kterou objednatel zadrží až do odstranění všech vad zjištěných při předání díla.
                          Chrání objednatele před nutností domáhat se nápravy po doplacení celé částky. Doporučeno zejména pro stavby.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  placeholder="10"
                  min="0"
                  max="100"
                  value={formData.retentionFee || ""}
                  onChange={(e) => handleChange("retentionFee", e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Doporučeno 5-10% pro stavby a větší projekty</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Podmínky platby (volitelné)</label>
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
              <label className="text-sm font-semibold">Kdo dodává materiál</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.materialProvidedBy || "contractor"}
                onChange={(e) => handleChange("materialProvidedBy", e.target.value)}
              >
                <option value="contractor">Zhotovitel</option>
                <option value="client">Objednatel</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.materialProvidedBy === "client"
                  ? "Zhotovitel neodpovídá za vady materiálu dodaného objednatelem"
                  : "Cena materiálu je zahrnuta v ceně díla"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Délka záruky (měsíce)</label>
                <Input
                  type="number"
                  placeholder="24"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Patro</label>
                <Input
                  placeholder="např. 3. patro"
                  value={formData.propertyFloor || ""}
                  onChange={(e) => handleChange("propertyFloor", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Dispozice</label>
                <Input
                  placeholder="např. 2+kk, 3+1"
                  value={formData.propertyDisposition || ""}
                  onChange={(e) => handleChange("propertyDisposition", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Výměra (m²)</label>
                <Input
                  type="number"
                  placeholder="např. 65"
                  value={formData.propertyArea || ""}
                  onChange={(e) => handleChange("propertyArea", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Max. počet osob</label>
                <Input
                  type="number"
                  placeholder="např. 2"
                  value={formData.propertyMaxPersons || ""}
                  onChange={(e) => handleChange("propertyMaxPersons", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Vybavení bytu</label>
              <Input
                placeholder="např. kuchyňská linka, sporák, lednička, pračka..."
                value={formData.propertyEquipment || ""}
                onChange={(e) => handleChange("propertyEquipment", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Popis (pokoje, stav, atd.)</label>
              <Input
                placeholder="Další detaily o nemovitosti"
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
            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-sm font-semibold">Zálohy na služby (Kč)</label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={formData.servicesDeposit || ""}
                  onChange={(e) => handleChange("servicesDeposit", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Energie, voda, plyn - vyúčtovává se ročně</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">Splatnost (den v měsíci)</label>
                <Input
                  type="number"
                  placeholder="5"
                  min="1"
                  max="31"
                  value={formData.rentalPaymentDay || ""}
                  onChange={(e) => handleChange("rentalPaymentDay", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">např. 5 = do 5. dne v měsíci</p>
              </div>
              <div>
                <label className="text-sm font-semibold">Způsob platby</label>
                <Input
                  placeholder="Bankovní převod"
                  value={formData.rentalPaymentMethod || ""}
                  onChange={(e) => handleChange("rentalPaymentMethod", e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-md border border-accent/20">
              <Checkbox
                id="inflationClause"
                checked={formData.inflationClause === "true"}
                onCheckedChange={(checked) => handleChange("inflationClause", checked ? "true" : "false")}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <label htmlFor="inflationClause" className="text-sm font-semibold cursor-pointer">
                    Inflační doložka
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">
                          Umožňuje zvednout nájem každoročně k 1. červenci o míru inflace (CPI) vyhlášenou ČSÚ za předchozí rok.
                          Doporučeno pro dlouhodobé nájmy, chrání pronajímatele před znehodnocením příjmů.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Doporučeno: Chrání pronajímatele před inflací při dlouhodobém nájmu
                </p>
              </div>
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
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">⚖️ Důležité pro IT, grafiku, design</p>
              <p className="text-xs text-blue-800">
                Bez licence má klient problém dílo legálně užívat. Vždy specifikujte podmínky!
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold">Typ licence</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.licenseType || "non-exclusive"}
                onChange={(e) => handleChange("licenseType", e.target.value)}
              >
                <option value="non-exclusive">Nevýhradní (může být poskytnuta i jiným)</option>
                <option value="exclusive">Výhradní (jen pro tohoto klienta)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Územní rozsah</label>
              <Input
                placeholder="např. Česká republika, EU, celosvětově"
                value={formData.licenseTerritory || ""}
                onChange={(e) => handleChange("licenseTerritory", e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="sourceCodeIncluded"
                checked={formData.sourceCodeIncluded === "true"}
                onCheckedChange={(checked) => handleChange("sourceCodeIncluded", checked ? "true" : "false")}
              />
              <div className="flex-1">
                <label htmlFor="sourceCodeIncluded" className="text-sm font-medium cursor-pointer">
                  Předání zdrojových kódů / editovatelných souborů
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Umožňuje klientovi upravovat dílo (např. AI, PSD, zdrojový kód)
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Další podmínky (volitelné)</label>
              <Input
                placeholder="např. zákaz dalšího prodeje, povinnost uvádět autora..."
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
      case "purchase-item":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Typ předmětu</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.itemType || "movable"}
                onChange={(e) => handleChange("itemType", e.target.value)}
              >
                <option value="movable">Movitá věc (auto, elektronika, nábytek...)</option>
                <option value="real-estate">Nemovitost (dům, byt, pozemek)</option>
              </select>
            </div>

            {formData.itemType === "movable" ? (
              <>
                <div>
                  <label className="text-sm font-semibold">Popis věci</label>
                  <Input
                    placeholder="např. Osobní automobil Škoda Octavia"
                    value={formData.itemDescription || ""}
                    onChange={(e) => handleChange("itemDescription", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold">Výrobní číslo / VIN</label>
                    <Input
                      placeholder="např. VIN nebo sériové číslo"
                      value={formData.serialNumber || ""}
                      onChange={(e) => handleChange("serialNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Rok výroby</label>
                    <Input
                      type="number"
                      placeholder="např. 2020"
                      value={formData.yearOfManufacture || ""}
                      onChange={(e) => handleChange("yearOfManufacture", e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-1">⚠️ Důležité pro nemovitosti</p>
                  <p className="text-xs text-blue-800">
                    Údaje z katastru nemovitostí jsou povinné. Bez nich katastr vklad zamítne!
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Katastrální území</label>
                  <Input
                    placeholder="např. Praha 4"
                    value={formData.cadastralArea || ""}
                    onChange={(e) => handleChange("cadastralArea", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold">Číslo LV (List vlastnictví)</label>
                    <Input
                      placeholder="např. 1234"
                      value={formData.lvNumber || ""}
                      onChange={(e) => handleChange("lvNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Parcelní číslo</label>
                    <Input
                      placeholder="např. 123/45"
                      value={formData.parcelNumber || ""}
                      onChange={(e) => handleChange("parcelNumber", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold">Číslo popisné stavby</label>
                  <Input
                    placeholder="např. č.p. 567"
                    value={formData.buildingNumber || ""}
                    onChange={(e) => handleChange("buildingNumber", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )
      case "purchase-price":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Kupní cena (Kč)</label>
              <Input
                type="number"
                placeholder="500000"
                value={formData.purchasePrice || ""}
                onChange={(e) => handleChange("purchasePrice", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Způsob úhrady</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.paymentMethod || "direct"}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
              >
                <option value="direct">Přímý bankovní převod</option>
                <option value="escrow">Advokátní/notářská úschova</option>
                <option value="cash">Hotovost</option>
              </select>
              {formData.paymentMethod === "escrow" && (
                <p className="text-xs text-green-700 mt-1 bg-green-50 p-2 rounded">
                  ✅ Doporučeno pro nemovitosti - peníze se vyplatí až po vkladu do katastru
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold">Splatnost (dny od podpisu)</label>
              <Input
                type="number"
                placeholder="14"
                value={formData.paymentDueDays || ""}
                onChange={(e) => handleChange("paymentDueDays", e.target.value)}
              />
            </div>
          </div>
        )
      case "ownership-transfer":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Vlastnictví přechází</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.ownershipTransferMoment || "payment"}
                onChange={(e) => handleChange("ownershipTransferMoment", e.target.value)}
              >
                <option value="payment">Úplným zaplacením ceny</option>
                <option value="handover">Předáním věci</option>
                <option value="registration">Vkladem do katastru (jen nemovitosti)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.ownershipTransferMoment === "payment" && "Prodávající je chráněn až do zaplacení"}
                {formData.ownershipTransferMoment === "handover" && "Kupující získává vlastnictví ihned při převzetí"}
                {formData.ownershipTransferMoment === "registration" && "Standardní postup pro nemovitosti"}
              </p>
            </div>
          </div>
        )
      case "item-condition":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">Stav věci</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.itemCondition || "used"}
                onChange={(e) => handleChange("itemCondition", e.target.value)}
              >
                <option value="new">Nová</option>
                <option value="used">Použitá</option>
                <option value="damaged">S vadami</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Popis vad (pokud existují)</label>
              <Input
                placeholder="např. poškrábané dveře, nefungující klimatizace..."
                value={formData.knownDefects || ""}
                onChange={(e) => handleChange("knownDefects", e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="noLegalDefects"
                checked={formData.noLegalDefects === "true"}
                onCheckedChange={(checked) => handleChange("noLegalDefects", checked ? "true" : "false")}
              />
              <div className="flex-1">
                <label htmlFor="noLegalDefects" className="text-sm font-medium cursor-pointer">
                  Prohlášení o bezdlužnosti
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Prodávající prohlašuje, že na věci není exekuce, zástava ani jiné právní vady
                </p>
              </div>
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
    <>
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

      <ClientSelector
        open={showClientSelector}
        onOpenChange={setShowClientSelector}
        onSelect={handleClientSelect}
      />
    </>
  )
}
