import type { ContractBlock } from "@/types/contract"
import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export interface SavedContract {
  id: string
  name: string
  type: string
  blocks: ContractBlock[]
  finalized: boolean
  createdAt: string
  savedAt: string
  finalizedAt?: string
}

export interface ContractsStore {
  [id: string]: SavedContract
}

/**
 * Sync localStorage to Supabase (background)
 */
async function syncToCloud(contract: SavedContract) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      console.warn("Cannot sync contract - user not authenticated")
      return
    }

    console.log("Syncing contract to cloud:", contract.id, contract.name)

    const { error } = await supabase.from("contracts").upsert({
      id: contract.id,
      user_id: user.data.user.id,
      name: contract.name,
      type: contract.type,
      blocks: contract.blocks as any,
      finalized: contract.finalized,
      finalized_at: contract.finalizedAt,
      created_at: contract.createdAt,
      updated_at: contract.savedAt,
    } as any)

    if (error) {
      console.error("Contract sync error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }

    console.log("Contract synced successfully:", contract.id)
  } catch (error) {
    console.error("Cloud sync failed:", error)
  }
}

/**
 * Load from cloud - exported for manual loading in AuthProvider
 */
export async function loadContractsFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      console.warn("Cannot load contracts - user not authenticated")
      return
    }

    console.log("Loading contracts from cloud for user:", user.data.user.email)

    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", user.data.user.id)
      .eq("finalized", true)

    if (error) {
      console.error("Failed to fetch contracts from Supabase:", error)
      throw error
    }

    console.log(`Found ${data?.length || 0} contracts in cloud`)

    if (!data || data.length === 0) {
      console.log("No contracts found in cloud")
      return
    }

    // Merge with localStorage
    const localStr = localStorage.getItem("contracts")
    const local: ContractsStore = localStr ? JSON.parse(localStr) : {}

    data.forEach((c: any) => {
      local[c.id] = {
        id: c.id,
        name: c.name,
        type: c.type,
        blocks: c.blocks as ContractBlock[],
        finalized: c.finalized,
        createdAt: c.created_at,
        savedAt: c.updated_at,
        finalizedAt: c.finalized_at || undefined,
      }
    })

    localStorage.setItem("contracts", JSON.stringify(local))
    console.log(`Loaded ${data.length} contracts to localStorage`)
  } catch (error) {
    console.error("Cloud load failed:", error)
    throw error
  }
}

/**
 * Save contract as finalized
 */
export function finalizeContract(
  contractType: string,
  blocks: ContractBlock[],
  name?: string,
): SavedContract {
  if (typeof window === "undefined") {
    throw new Error("Cannot finalize contract on server")
  }

  const id = uuidv4()
  const now = new Date().toISOString()

  const contract: SavedContract = {
    id,
    name: name || `Smlouva ${new Date().toLocaleDateString("cs-CZ")}`,
    type: contractType,
    blocks,
    finalized: true,
    createdAt: now,
    savedAt: now,
    finalizedAt: now,
  }

  const contractsStr = localStorage.getItem("contracts")
  const contracts: ContractsStore = contractsStr ? JSON.parse(contractsStr) : {}
  contracts[id] = contract
  localStorage.setItem("contracts", JSON.stringify(contracts))

  // Sync to cloud in background
  syncToCloud(contract)

  return contract
}

/**
 * Get all finalized contracts
 */
export function getFinalizedContracts(): SavedContract[] {
  if (typeof window === "undefined") return []

  const contractsStr = localStorage.getItem("contracts")
  if (!contractsStr) return []

  try {
    const contracts: ContractsStore = JSON.parse(contractsStr)
    return Object.values(contracts)
      .filter((c) => c.finalized)
      .sort((a, b) => new Date(b.finalizedAt || b.savedAt).getTime() - new Date(a.finalizedAt || a.savedAt).getTime())
  } catch (e) {
    console.error("Error loading contracts:", e)
    return []
  }
}

/**
 * Get single contract
 */
export function getContract(id: string): SavedContract | null {
  if (typeof window === "undefined") return null

  const contractsStr = localStorage.getItem("contracts")
  if (!contractsStr) return null

  try {
    const contracts: ContractsStore = JSON.parse(contractsStr)
    return contracts[id] || null
  } catch (e) {
    console.error("Error loading contract:", e)
    return null
  }
}

/**
 * Delete contract
 */
export function deleteContract(id: string): void {
  if (typeof window === "undefined") return

  const contractsStr = localStorage.getItem("contracts")
  if (!contractsStr) return

  const contracts: ContractsStore = JSON.parse(contractsStr)
  delete contracts[id]
  localStorage.setItem("contracts", JSON.stringify(contracts))

  // Delete from cloud
  supabase.from("contracts").delete().eq("id", id).then()
}
