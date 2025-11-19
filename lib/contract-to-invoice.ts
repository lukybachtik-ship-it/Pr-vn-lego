/**
 * Contract to Invoice Conversion
 * Automatically generates invoice data from contract blocks
 */

import type { SavedContract } from "./contract-storage"
import type { Invoice } from "./cash-flow"

export interface InvoicePreset {
  from: string
  clientId?: string
  amount: number
  dueDate: string
  description: string
}

/**
 * Generate invoice preset data from contract
 */
export function generateInvoiceFromContract(contract: SavedContract): InvoicePreset | null {
  const { blocks } = contract

  // Find parties block
  const partiesBlock = blocks.find((b) => b.templateId === "parties" && b.isComplete)
  if (!partiesBlock) return null

  // Determine client (party2 is usually the client/counterparty)
  const clientName = partiesBlock.data.party2Name || partiesBlock.data.party1Name || "Klient"

  // Find payment block
  const paymentBlock = blocks.find((b) => b.templateId === "payment" && b.isComplete)
  const purchasePriceBlock = blocks.find((b) => b.templateId === "purchase-price" && b.isComplete)
  const rentalPriceBlock = blocks.find((b) => b.templateId === "rental-price" && b.isComplete)

  let amount = 0
  let maturityDays = 14
  let description = ""

  if (paymentBlock) {
    amount = parseFloat(paymentBlock.data.amount || "0")
    maturityDays = parseInt(paymentBlock.data.maturityDays || "14", 10)
    description = `Faktura dle smlouvy: ${contract.name}`
  } else if (purchasePriceBlock) {
    amount = parseFloat(purchasePriceBlock.data.purchasePrice || "0")
    maturityDays = parseInt(purchasePriceBlock.data.paymentDueDays || "14", 10)
    description = `Kupní cena - ${contract.name}`
  } else if (rentalPriceBlock) {
    amount = parseFloat(rentalPriceBlock.data.monthlyRent || "0")
    const deposit = parseFloat(rentalPriceBlock.data.servicesDeposit || "0")
    amount += deposit
    maturityDays = 7
    description = `Nájemné za ${new Date().toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}`
  } else {
    return null
  }

  // Calculate due date
  const now = new Date()
  const dueDate = new Date(now.getTime() + maturityDays * 24 * 60 * 60 * 1000)

  return {
    from: clientName,
    clientId: undefined, // Will be matched by name or user can select
    amount,
    dueDate: dueDate.toISOString().split("T")[0],
    description,
  }
}

/**
 * Get contract type-specific invoice description
 */
export function getInvoiceDescriptionForContract(contractType: string, contractName: string): string {
  const descriptions: Record<string, string> = {
    "work-contract": `Faktura za dílo: ${contractName}`,
    "rental-contract": `Nájemné: ${contractName}`,
    "purchase-contract": `Úhrada kupní ceny: ${contractName}`,
    "trade-contract": `Faktura: ${contractName}`,
    "other-contract": `Faktura: ${contractName}`,
  }

  return descriptions[contractType] || `Faktura: ${contractName}`
}
