/**
 * Bank Account Management
 * Manages multiple bank accounts for invoicing with QR payments
 */

import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

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
 * Sync bank account to cloud
 */
async function syncBankAccountToCloud(account: BankAccount) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      console.log("Bank account sync: No user found")
      return
    }

    console.log("Syncing bank account to cloud:", account.label, account.accountNumber)

    const { error } = await supabase.from("bank_accounts").upsert({
      id: account.id,
      user_id: user.data.user.id,
      account_number: account.accountNumber,
      bank_code: account.bankCode,
      iban: account.iban || null,
      currency: account.currency,
      label: account.label,
      is_default: account.isDefault,
      created_at: account.createdAt,
    } as any)

    if (error) {
      console.error("Bank account sync error:", error)
      throw error
    }

    console.log("Bank account synced successfully:", account.id)
  } catch (error) {
    console.error("Bank account cloud sync failed:", error)
  }
}

/**
 * Sync all accounts to cloud (for bulk updates like setDefault)
 */
async function syncAllAccountsToCloud(accounts: BankAccount[]) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    for (const account of accounts) {
      await syncBankAccountToCloud(account)
    }
  } catch (error) {
    console.error("Bank accounts bulk sync failed:", error)
  }
}

/**
 * Load bank accounts from cloud - exported for manual loading in AuthProvider
 */
export async function loadBankAccountsFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      console.log("Bank accounts: No user found, skipping load")
      return
    }

    console.log("Loading bank accounts from cloud for user:", user.data.user.email)

    const { data, error } = await supabase.from("bank_accounts").select("*").eq("user_id", user.data.user.id)

    if (error) {
      console.error("Bank accounts query error:", error)
      return
    }

    console.log("Bank accounts found:", data?.length || 0)

    if (!data || data.length === 0) {
      console.log("No bank accounts in cloud")
      return
    }

    const accounts: BankAccount[] = data.map((acc: any) => ({
      id: acc.id,
      accountNumber: acc.account_number,
      bankCode: acc.bank_code,
      iban: acc.iban || undefined,
      currency: acc.currency,
      label: acc.label,
      isDefault: acc.is_default,
      createdAt: acc.created_at,
    }))

    localStorage.setItem("bankAccounts", JSON.stringify(accounts))
    console.log("Bank accounts loaded to localStorage:", accounts.length)
  } catch (error) {
    console.error("Bank accounts cloud load failed:", error)
  }
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

  const accountId = account.id || uuidv4()
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

  // Sync to cloud (including default changes)
  syncAllAccountsToCloud(accounts)

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

  // Delete from cloud
  supabase.from("bank_accounts").delete().eq("id", accountId).then()

  // Sync remaining accounts if default changed
  if (accounts.length > 0) {
    syncAllAccountsToCloud(accounts)
  }
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

  // Sync all accounts to cloud (default changed)
  syncAllAccountsToCloud(accounts)
}

/**
 * Format account number for display
 */
export function formatAccountNumber(accountNumber: string, bankCode: string): string {
  return `${accountNumber}/${bankCode}`
}

/**
 * Generate IBAN from Czech account number
 * Uses MOD 97-10 algorithm for proper check digit calculation
 */
export function generateIBAN(accountNumber: string, bankCode: string): string {
  // Remove spaces
  const cleanAccount = accountNumber.replace(/\s/g, "")
  const cleanBankCode = bankCode.replace(/\s/g, "")

  // Split by dash if present (format: prefix-number or just number)
  let prefix = ""
  let number = cleanAccount

  if (cleanAccount.includes("-")) {
    const parts = cleanAccount.split("-")
    prefix = parts[0]
    number = parts[1]
  }

  // Pad bank code to 4 digits, prefix to 6 digits, number to 10 digits
  const paddedBankCode = cleanBankCode.padStart(4, "0")
  const paddedPrefix = prefix.padStart(6, "0")
  const paddedNumber = number.padStart(10, "0")

  // BBAN = bank code (4) + prefix (6) + account number (10) = 20 digits
  const bban = `${paddedBankCode}${paddedPrefix}${paddedNumber}`

  // For MOD 97-10 calculation:
  // 1. Move country code to end: BBAN + CZ00
  // 2. Replace letters with numbers: C=12, Z=35
  // 3. Calculate: 98 - (number mod 97)
  const numericString = `${bban}123500` // BBAN + C(12) + Z(35) + 00

  // Use string-based modulo for large numbers
  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97
  }

  const checkDigits = String(98 - remainder).padStart(2, "0")

  return `CZ${checkDigits}${bban}`
}
