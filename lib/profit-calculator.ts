/**
 * Profit Calculator - výpočetní logika pro kalkulačku čistého zisku
 * Používá české daňové sazby pro rok 2026
 */

import { getTaxSettings, type TaxSettings } from "./user-settings"
import { supabase } from "./supabase"

// Daňové sazby 2026
export const TAX_RATES_2026 = {
  // Sociální pojištění OSVČ - 29.2% z vyměřovacího základu (50% zisku)
  socialniPojisteni: 0.292,
  socialniVymerovaciZaklad: 0.5, // 50% ze zisku

  // Zdravotní pojištění OSVČ - 13.5% z vyměřovacího základu (50% zisku)
  zdravotniPojisteni: 0.135,
  zdravotniVymerovaciZaklad: 0.5, // 50% ze zisku

  // Daň z příjmů - 15% (základní), 23% (nad limit)
  danZPrijmu: 0.15,
  danZPrijmuZvysena: 0.23,
  danZPrijmuLimit: 1935552, // Limit pro zvýšenou sazbu 2026

  // Minimální zálohy 2026
  minZalohaSocialni: 3852, // měsíční
  minZalohaZdravotni: 2968, // měsíční (u hlavní činnosti)
}

// Nákladová položka
export interface CostItem {
  id: string
  name: string
  amount: number
}

// Vstup pro kalkulaci
export interface CalculatorInput {
  // Název zakázky
  projectName: string
  // Hrubý příjem (fakturovaná částka bez DPH)
  grossRevenue: number
  // Nákladové položky
  costs: CostItem[]
  // Počet hodin na zakázku
  hours: number
  // Marže v procentech (0-100)
  marginPercent: number
}

// Výsledek kalkulace
export interface CalculatorResult {
  // Vstupní data
  input: CalculatorInput
  taxSettings: TaxSettings

  // Výpočty
  totalCosts: number // Celkové náklady
  grossProfit: number // Hrubý zisk (příjem - náklady)
  finalPrice: number // Koncová cena s marží

  // Odvody státu (při skutečných výdajích)
  taxBase: number // Daňový základ
  socialInsurance: number // Sociální pojištění
  healthInsurance: number // Zdravotní pojištění
  incomeTax: number // Daň z příjmů
  totalTaxes: number // Celkové odvody

  // Čistý zisk
  netProfit: number // Čistý zisk na ruku
  hourlyRate: number // Hodinová sazba

  // Rozložení v procentech
  materialPercent: number
  taxesPercent: number
  profitPercent: number

  // Varování
  isBelowMinimum: boolean
  minimumHourlyRate: number
}

// Uložená kalkulace
export interface SavedCalculation {
  id: string
  projectName: string
  result: CalculatorResult
  createdAt: string
}

/**
 * Vypočítá čistý zisk z zakázky
 */
export function calculateProfit(input: CalculatorInput): CalculatorResult {
  const taxSettings = getTaxSettings()

  // Celkové náklady
  const totalCosts = input.costs.reduce((sum, cost) => sum + cost.amount, 0)

  // Hrubý zisk (příjem - náklady)
  const grossProfit = input.grossRevenue - totalCosts

  // Koncová cena s marží
  // Marže se počítá jako navýšení nad náklady
  const marginMultiplier = 1 + input.marginPercent / 100
  const finalPrice = totalCosts * marginMultiplier

  // Daňový základ
  let taxBase: number
  if (taxSettings.expenseType === "pausalni") {
    // Paušální výdaje - základ je (100 - paušál)% z příjmu
    const pausalPercent = taxSettings.pausalniSazba / 100
    taxBase = finalPrice * (1 - pausalPercent)
  } else {
    // Skutečné výdaje - základ je příjem - náklady
    taxBase = finalPrice - totalCosts
  }

  // Vyměřovací základ pro pojištění (50% ze zisku, min. minimální základ)
  const vymerovaciZaklad = Math.max(taxBase * TAX_RATES_2026.socialniVymerovaciZaklad, 0)

  // Sociální pojištění
  const socialInsurance = vymerovaciZaklad * TAX_RATES_2026.socialniPojisteni

  // Zdravotní pojištění
  const healthInsurance = vymerovaciZaklad * TAX_RATES_2026.zdravotniPojisteni

  // Daň z příjmů (po odečtení pojištění)
  const taxBaseAfterInsurance = Math.max(taxBase - socialInsurance - healthInsurance, 0)
  let incomeTax: number
  if (taxBaseAfterInsurance <= TAX_RATES_2026.danZPrijmuLimit) {
    incomeTax = taxBaseAfterInsurance * TAX_RATES_2026.danZPrijmu
  } else {
    // Progresivní zdanění
    const basicTax = TAX_RATES_2026.danZPrijmuLimit * TAX_RATES_2026.danZPrijmu
    const extraTax = (taxBaseAfterInsurance - TAX_RATES_2026.danZPrijmuLimit) * TAX_RATES_2026.danZPrijmuZvysena
    incomeTax = basicTax + extraTax
  }

  // Celkové odvody
  const totalTaxes = socialInsurance + healthInsurance + incomeTax

  // Čistý zisk = příjem - náklady - odvody
  const netProfit = finalPrice - totalCosts - totalTaxes

  // Hodinová sazba
  const hourlyRate = input.hours > 0 ? netProfit / input.hours : 0

  // Procenta rozložení
  const materialPercent = finalPrice > 0 ? (totalCosts / finalPrice) * 100 : 0
  const taxesPercent = finalPrice > 0 ? (totalTaxes / finalPrice) * 100 : 0
  const profitPercent = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0

  // Kontrola minimální sazby
  const isBelowMinimum = hourlyRate < taxSettings.minHourlyRate && input.hours > 0

  return {
    input,
    taxSettings,
    totalCosts,
    grossProfit,
    finalPrice,
    taxBase,
    socialInsurance,
    healthInsurance,
    incomeTax,
    totalTaxes,
    netProfit,
    hourlyRate,
    materialPercent,
    taxesPercent,
    profitPercent,
    isBelowMinimum,
    minimumHourlyRate: taxSettings.minHourlyRate,
  }
}

/**
 * Formátování měny
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Storage key
const CALCULATIONS_STORAGE_KEY = "profit_calculations"

/**
 * Uloží kalkulaci
 */
export function saveCalculation(result: CalculatorResult): SavedCalculation {
  const calculation: SavedCalculation = {
    id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectName: result.input.projectName,
    result,
    createdAt: new Date().toISOString(),
  }

  const calculations = getCalculations()
  calculations.unshift(calculation) // Přidat na začátek

  // Limit na 50 kalkulací
  const trimmed = calculations.slice(0, 50)

  localStorage.setItem(CALCULATIONS_STORAGE_KEY, JSON.stringify(trimmed))

  // Sync to cloud
  syncCalculationsToCloud(trimmed)

  return calculation
}

/**
 * Získá uložené kalkulace
 */
export function getCalculations(): SavedCalculation[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(CALCULATIONS_STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Smaže kalkulaci
 */
export function deleteCalculation(id: string): void {
  const calculations = getCalculations()
  const filtered = calculations.filter((c) => c.id !== id)
  localStorage.setItem(CALCULATIONS_STORAGE_KEY, JSON.stringify(filtered))
  syncCalculationsToCloud(filtered)
}

/**
 * Sync kalkulací do cloudu
 */
async function syncCalculationsToCloud(calculations: SavedCalculation[]) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { error } = await supabase.from("profit_calculations").upsert({
      user_id: user.data.user.id,
      calculations: JSON.stringify(calculations),
      updated_at: new Date().toISOString(),
    } as any)

    if (error) throw error
  } catch (error) {
    console.error("Calculations cloud sync failed:", error)
  }
}

/**
 * Načte kalkulace z cloudu
 */
export async function loadCalculationsFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { data } = await supabase
      .from("profit_calculations")
      .select("*")
      .eq("user_id", user.data.user.id)
      .single()

    if (!data) return

    const calculationsRaw = (data as any).calculations
    let calculations: SavedCalculation[] = []

    if (calculationsRaw) {
      try {
        calculations = typeof calculationsRaw === "string"
          ? JSON.parse(calculationsRaw)
          : calculationsRaw
      } catch {
        calculations = []
      }
    }

    localStorage.setItem(CALCULATIONS_STORAGE_KEY, JSON.stringify(calculations))
  } catch (error) {
    console.error("Calculations cloud load failed:", error)
  }
}

/**
 * Výchozí nákladové položky
 */
export const DEFAULT_COST_ITEMS: Omit<CostItem, "id">[] = [
  { name: "Materiál", amount: 0 },
  { name: "Doprava", amount: 0 },
  { name: "Subdodávky", amount: 0 },
]

/**
 * Vytvoří novou nákladovou položku
 */
export function createCostItem(name: string = "", amount: number = 0): CostItem {
  return {
    id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    amount,
  }
}
