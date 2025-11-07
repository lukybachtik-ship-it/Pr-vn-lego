import type { ContractBlock } from "@/types/contract"

export interface HandoverProtocol {
  id: string
  contractId: string
  contractName: string
  handoverDate: string
  withReservations: boolean
  reservationsDescription: string
  createdAt: string
  // Data from contract
  party1Name: string
  party2Name: string
  scopeDescription: string
  contractType: string
}

export function createHandoverProtocol(
  contractId: string,
  contractName: string,
  contractType: string,
  blocks: ContractBlock[],
  handoverDate: string,
  withReservations: boolean,
  reservationsDescription: string,
): HandoverProtocol {
  // Extract parties data
  const partiesBlock = blocks.find((b) => b.templateId === "parties")
  const party1Name = partiesBlock?.data.party1Name || "Neuvedeno"
  const party2Name = partiesBlock?.data.party2Name || "Neuvedeno"

  // Extract scope description
  const scopeBlock = blocks.find((b) => b.templateId === "scope")
  const scopeDescription = scopeBlock?.data.scopeDescription || "Neuvedeno"

  const protocol: HandoverProtocol = {
    id: `protocol-${Date.now()}`,
    contractId,
    contractName,
    handoverDate,
    withReservations,
    reservationsDescription,
    createdAt: new Date().toISOString(),
    party1Name,
    party2Name,
    scopeDescription,
    contractType,
  }

  return protocol
}

export function saveHandoverProtocol(protocol: HandoverProtocol): void {
  const protocolsJson = localStorage.getItem("handover-protocols")
  const protocols = protocolsJson ? JSON.parse(protocolsJson) : {}

  protocols[protocol.id] = protocol
  localStorage.setItem("handover-protocols", JSON.stringify(protocols))
}

export function getProtocolsForContract(contractId: string): HandoverProtocol[] {
  const protocolsJson = localStorage.getItem("handover-protocols")
  if (!protocolsJson) return []

  const protocols = JSON.parse(protocolsJson)
  return Object.values(protocols).filter((p: any) => p.contractId === contractId) as HandoverProtocol[]
}

export function getAllProtocols(): HandoverProtocol[] {
  const protocolsJson = localStorage.getItem("handover-protocols")
  if (!protocolsJson) return []

  const protocols = JSON.parse(protocolsJson)
  return Object.values(protocols) as HandoverProtocol[]
}

export function deleteProtocol(protocolId: string): void {
  const protocolsJson = localStorage.getItem("handover-protocols")
  if (!protocolsJson) return

  const protocols = JSON.parse(protocolsJson)
  delete protocols[protocolId]
  localStorage.setItem("handover-protocols", JSON.stringify(protocols))
}

export function getContractTypeLabel(type: string): string {
  switch (type) {
    case "work-contract":
      return "Smlouva o dílo"
    case "rental-contract":
      return "Nájemní smlouva"
    case "trade-contract":
      return "Obchodní podmínky"
    case "other-contract":
      return "Smlouva"
    default:
      return "Smlouva"
  }
}
