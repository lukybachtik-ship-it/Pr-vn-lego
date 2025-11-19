/**
 * Bank Account Management
 * Manages multiple bank accounts for invoicing with QR payments
 */

export interface BankAccount {
  id: string
  accountNumber: string // předčíslí-číslo účtu
  bankCode: string // kód banky (0100, 0300, 2010, atd.)
  iban?: string // mezinárodní formát
  currency: "CZK" | "EUR" | "USD"
  label: string // např. "Hlavní účet CZK", "EUR účet"
  isDefault: boolean
  createdAt: string
}

/**
 * Get all bank accounts
 */
export function getAllBankAccounts(): BankAccount[] {
  if (typeof window === "undefined") return []

  const accountsJson = localStorage.getItem("bankAccounts")
  if (!accountsJson) return []

  return JSON.parse(accountsJson) as BankAccount[]
}

/**
 * Get default bank account
 */
export function getDefaultBankAccount(): BankAccount | null {
  const accounts = getAllBankAccounts()
  return accounts.find((acc) => acc.isDefault) || accounts[0] || null
}

/**
 * Save or update bank account
 */
export function saveBankAccount(account: Partial<BankAccount>): BankAccount {
  if (typeof window === "undefined") throw new Error("Cannot save bank account on server")

  const accountsJson = localStorage.getItem("bankAccounts")
  const accounts: BankAccount[] = accountsJson ? JSON.parse(accountsJson) : []

  const accountId = account.id || `bank-${Date.now()}`
  const now = new Date().toISOString()

  // If this is set as default, unset all others
  if (account.isDefault) {
    accounts.forEach((acc) => {
      acc.isDefault = false
    })
  }

  const savedAccount: BankAccount = {
    id: accountId,
    accountNumber: account.accountNumber || "",
    bankCode: account.bankCode || "",
    iban: account.iban,
    currency: account.currency || "CZK",
    label: account.label || "Bankovní účet",
    isDefault: account.isDefault !== undefined ? account.isDefault : accounts.length === 0,
    createdAt: account.createdAt || now,
  }

  const existingIndex = accounts.findIndex((acc) => acc.id === accountId)
  if (existingIndex >= 0) {
    accounts[existingIndex] = savedAccount
  } else {
    accounts.push(savedAccount)
  }

  localStorage.setItem("bankAccounts", JSON.stringify(accounts))
  return savedAccount
}

/**
 * Delete bank account
 */
export function deleteBankAccount(accountId: string): void {
  if (typeof window === "undefined") return

  const accountsJson = localStorage.getItem("bankAccounts")
  if (!accountsJson) return

  let accounts: BankAccount[] = JSON.parse(accountsJson)
  accounts = accounts.filter((acc) => acc.id !== accountId)

  // If we deleted the default, set another as default
  if (accounts.length > 0 && !accounts.some((acc) => acc.isDefault)) {
    accounts[0].isDefault = true
  }

  localStorage.setItem("bankAccounts", JSON.stringify(accounts))
}

/**
 * Set default bank account
 */
export function setDefaultBankAccount(accountId: string): void {
  if (typeof window === "undefined") return

  const accountsJson = localStorage.getItem("bankAccounts")
  if (!accountsJson) return

  const accounts: BankAccount[] = JSON.parse(accountsJson)

  // Set all to non-default first
  accounts.forEach((acc) => {
    acc.isDefault = false
  })

  // Set the selected account as default
  const account = accounts.find((acc) => acc.id === accountId)
  if (account) {
    account.isDefault = true
  }

  localStorage.setItem("bankAccounts", JSON.stringify(accounts))
}

/**
 * Format account number for display
 */
export function formatAccountNumber(accountNumber: string, bankCode: string): string {
  return `${accountNumber}/${bankCode}`
}

/**
 * Generate IBAN from Czech account number
 * Note: Simplified - real IBAN generation requires check digit calculation
 */
export function generateIBAN(accountNumber: string, bankCode: string): string {
  // Remove spaces and dashes
  const cleanAccount = accountNumber.replace(/[-\s]/g, "")
  const [prefix, number] = cleanAccount.includes("-") ? cleanAccount.split("-") : ["", cleanAccount]

  // Pad prefix to 6 digits, number to 10 digits
  const paddedPrefix = prefix.padStart(6, "0")
  const paddedNumber = number.padStart(10, "0")

  return `CZ__${bankCode}${paddedPrefix}${paddedNumber}` // __ = check digits (would need calculation)
}
