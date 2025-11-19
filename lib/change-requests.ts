/**
 * Change Requests (Změnové listy)
 * Manage contract amendments and scope changes
 */

export interface ChangeRequest {
  id: string
  contractId: string
  requestNumber: number // automatically incremented
  requestDate: string
  description: string // co klient chce navíc
  priceIncrease: number // CZK
  deadlineExtensionDays: number
  status: "pending" | "approved" | "rejected"
  approvedAt?: string
  rejectedAt?: string
  notes?: string
  createdAt: string
}

/**
 * Get all change requests
 */
export function getAllChangeRequests(): ChangeRequest[] {
  if (typeof window === "undefined") return []

  const requestsJson = localStorage.getItem("changeRequests")
  if (!requestsJson) return []

  return JSON.parse(requestsJson) as ChangeRequest[]
}

/**
 * Get change requests for a contract
 */
export function getChangeRequestsByContract(contractId: string): ChangeRequest[] {
  const requests = getAllChangeRequests()
  return requests
    .filter((r) => r.contractId === contractId)
    .sort((a, b) => b.requestNumber - a.requestNumber)
}

/**
 * Create new change request
 */
export function createChangeRequest(
  contractId: string,
  description: string,
  priceIncrease: number,
  deadlineExtensionDays: number,
): ChangeRequest {
  if (typeof window === "undefined") throw new Error("Cannot create change request on server")

  const requests = getAllChangeRequests()

  // Get next request number for this contract
  const contractRequests = requests.filter((r) => r.contractId === contractId)
  const nextNumber = contractRequests.length > 0 ? Math.max(...contractRequests.map((r) => r.requestNumber)) + 1 : 1

  const changeRequest: ChangeRequest = {
    id: `change-${Date.now()}`,
    contractId,
    requestNumber: nextNumber,
    requestDate: new Date().toISOString(),
    description,
    priceIncrease,
    deadlineExtensionDays,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  requests.push(changeRequest)
  localStorage.setItem("changeRequests", JSON.stringify(requests))

  return changeRequest
}

/**
 * Update change request status
 */
export function updateChangeRequestStatus(
  requestId: string,
  status: "approved" | "rejected",
  notes?: string,
): ChangeRequest {
  if (typeof window === "undefined") throw new Error("Cannot update on server")

  const requests = getAllChangeRequests()
  const requestIndex = requests.findIndex((r) => r.id === requestId)

  if (requestIndex === -1) {
    throw new Error("Change request not found")
  }

  const request = requests[requestIndex]
  request.status = status
  request.notes = notes

  if (status === "approved") {
    request.approvedAt = new Date().toISOString()
  } else {
    request.rejectedAt = new Date().toISOString()
  }

  requests[requestIndex] = request
  localStorage.setItem("changeRequests", JSON.stringify(requests))

  return request
}

/**
 * Delete change request
 */
export function deleteChangeRequest(requestId: string): void {
  if (typeof window === "undefined") return

  const requests = getAllChangeRequests()
  const filtered = requests.filter((r) => r.id !== requestId)
  localStorage.setItem("changeRequests", JSON.stringify(filtered))
}

/**
 * Generate amendment text
 */
export function generateAmendmentText(request: ChangeRequest, contractName: string): string {
  const date = new Date(request.requestDate).toLocaleDateString("cs-CZ")

  let text = `DODATEK Č. ${request.requestNumber} KE SMLOUVĚ\n`
  text += `${contractName}\n\n`
  text += `---\n\n`
  text += `Dne ${date} se smluvní strany dohodly na následujících změnách:\n\n`

  text += `PŘEDMĚT ZMĚNY:\n`
  text += `${request.description}\n\n`

  if (request.priceIncrease > 0) {
    text += `FINANČNÍ DOPAD:\n`
    text += `Původní cena se navyšuje o ${request.priceIncrease.toLocaleString("cs-CZ")} Kč\n\n`
  }

  if (request.deadlineExtensionDays > 0) {
    text += `TERMÍN:\n`
    text += `Původní termín dokončení se prodlužuje o ${request.deadlineExtensionDays} ${request.deadlineExtensionDays === 1 ? "den" : request.deadlineExtensionDays <= 4 ? "dny" : "dnů"}\n\n`
  }

  text += `---\n\n`
  text += `PODPISY STRAN:\n\n`
  text += `________________                ________________\n`
  text += `Podpis 1. strany              Podpis 2. strany\n`

  return text
}

/**
 * Calculate total contract adjustments
 */
export function calculateContractAdjustments(contractId: string): {
  totalPriceIncrease: number
  totalDeadlineExtension: number
  approvedChanges: number
} {
  const requests = getChangeRequestsByContract(contractId).filter((r) => r.status === "approved")

  const totalPriceIncrease = requests.reduce((sum, r) => sum + r.priceIncrease, 0)
  const totalDeadlineExtension = requests.reduce((sum, r) => sum + r.deadlineExtensionDays, 0)

  return {
    totalPriceIncrease,
    totalDeadlineExtension,
    approvedChanges: requests.length,
  }
}
