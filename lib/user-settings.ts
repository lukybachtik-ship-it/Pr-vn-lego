/**
 * User Settings Management
 * Syncs user preferences to cloud
 */

import { supabase } from "./supabase"

export interface UserSettings {
  vatLimitDismissed: boolean
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
    } as any)
    if (error) throw error
  } catch (error) {
    console.error("Settings cloud sync failed:", error)
  }
}

/**
 * Load settings from cloud
 */
async function loadSettingsFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.data.user.id).single()

    if (!data) return

    const settings: UserSettings = {
      vatLimitDismissed: (data as any).vat_limit_dismissed,
    }

    localStorage.setItem("userSettings", JSON.stringify(settings))
  } catch (error) {
    console.error("Settings cloud load failed:", error)
  }
}

// Auto-load on module import
if (typeof window !== "undefined") {
  loadSettingsFromCloud()
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
