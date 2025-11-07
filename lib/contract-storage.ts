import type { ContractBlock } from "@/types/contract"

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

  const id = `contract-${Date.now()}`
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

  // Load existing contracts
  const contractsStr = localStorage.getItem("contracts")
  const contracts: ContractsStore = contractsStr ? JSON.parse(contractsStr) : {}

  // Add new contract
  contracts[id] = contract

  // Save back
  localStorage.setItem("contracts", JSON.stringify(contracts))

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

  try {
    const contracts: ContractsStore = JSON.parse(contractsStr)
    delete contracts[id]
    localStorage.setItem("contracts", JSON.stringify(contracts))
  } catch (e) {
    console.error("Error deleting contract:", e)
  }
}

/**
 * Update contract name
 */
export function updateContractName(id: string, name: string): void {
  if (typeof window === "undefined") return

  const contractsStr = localStorage.getItem("contracts")
  if (!contractsStr) return

  try {
    const contracts: ContractsStore = JSON.parse(contractsStr)
    if (contracts[id]) {
      contracts[id].name = name
      contracts[id].savedAt = new Date().toISOString()
      localStorage.setItem("contracts", JSON.stringify(contracts))
    }
  } catch (e) {
    console.error("Error updating contract:", e)
  }
}
