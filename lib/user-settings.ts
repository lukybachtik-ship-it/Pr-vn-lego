/**
 * User Settings Management
 * Syncs user preferences to cloud
 */

import { supabase } from "./supabase"

// Typ uplatňování výdajů
export type ExpenseType = "pausalni" | "skutecne"

// Paušální sazby
export type PausalniSazba = 80 | 60 | 40

// DPH status
export type VatStatus = "none" | "15" | "21"

export interface TaxSettings {
  // Typ uplatňování výdajů
  expenseType: ExpenseType
  // Paušální sazba (pokud expenseType === "pausalni")
  pausalniSazba: PausalniSazba
  // DPH status
  vatStatus: VatStatus
  // Minimální hodinová sazba pro varování (Kč/h)
  minHourlyRate: number
}

export interface UserSettings {
  vatLimitDismissed: boolean
  // Daňová nastavení pro kalkulačku
  taxSettings?: TaxSettings
}

/**
 * Sync settings to cloud
 */
async function syncSettingsToCloud(settings: UserSettings) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.data.user.id,
      vat_limit_dismissed: settings.vatLimitDismissed,
      tax_settings: settings.taxSettings ? JSON.stringify(settings.taxSettings) : null,
    } as any)
    if (error) throw error
  } catch (error) {
    console.error("Settings cloud sync failed:", error)
  }
}

/**
 * Load settings from cloud - exported for manual loading in AuthProvider
 */
export async function loadUserSettingsFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.data.user.id).single()

    if (!data) return

    const taxSettingsRaw = (data as any).tax_settings
    let taxSettings: TaxSettings | undefined
    if (taxSettingsRaw) {
      try {
        taxSettings = typeof taxSettingsRaw === "string" ? JSON.parse(taxSettingsRaw) : taxSettingsRaw
      } catch {
        taxSettings = undefined
      }
    }

    const settings: UserSettings = {
      vatLimitDismissed: (data as any).vat_limit_dismissed,
      taxSettings,
    }

    localStorage.setItem("userSettings", JSON.stringify(settings))
  } catch (error) {
    console.error("Settings cloud load failed:", error)
  }
}


/**
 * Default tax settings
 */
export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  expenseType: "pausalni",
  pausalniSazba: 60,
  vatStatus: "none",
  minHourlyRate: 190,
}

/**
 * Get user settings
 */
export function getUserSettings(): UserSettings {
  if (typeof window === "undefined") {
    return { vatLimitDismissed: false }
  }

  const settingsJson = localStorage.getItem("userSettings")
  if (!settingsJson) {
    return { vatLimitDismissed: false }
  }

  return JSON.parse(settingsJson)
}

/**
 * Get tax settings with defaults
 */
export function getTaxSettings(): TaxSettings {
  const settings = getUserSettings()
  return settings.taxSettings || DEFAULT_TAX_SETTINGS
}

/**
 * Check if tax settings are configured
 */
export function hasTaxSettingsConfigured(): boolean {
  const settings = getUserSettings()
  return settings.taxSettings !== undefined
}

/**
 * Update user settings
 */
export function updateUserSettings(updates: Partial<UserSettings>): UserSettings {
  if (typeof window === "undefined") throw new Error("Cannot update settings on server")

  const current = getUserSettings()
  const updated = { ...current, ...updates }

  localStorage.setItem("userSettings", JSON.stringify(updated))

  // Sync to cloud
  syncSettingsToCloud(updated)

  return updated
}
