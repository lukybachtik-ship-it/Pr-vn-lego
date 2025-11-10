/**
 * Client Management Library
 * Manages client contacts and their relationship with contracts and invoices
 */

export interface Client {
  id: string
  // Basic Info (from ARES or manual)
  ico?: string
  name: string
  // Address
  street?: string
  city?: string
  zip?: string
  region?: string
  // Manual Contact Info
  contactPerson?: string
  phone?: string
  email?: string
  notes?: string
  // Metadata
  createdAt: string
  updatedAt: string
  // Source
  source: "ares" | "manual"
}

export interface ClientHistory {
  contracts: Array<{
    id: string
    type: string
    name: string
    createdAt: string
    status: "active" | "completed"
  }>
  invoices: Array<{
    id: string
    type: "income" | "expense"
    amount: number
    dueDate: string
    isPaid: boolean
    description?: string
  }>
}

/**
 * Get all clients
 */
export function getAllClients(): Client[] {
  if (typeof window === "undefined") return []

  const clientsJson = localStorage.getItem("clients")
  if (!clientsJson) return []

  const clientsObj = JSON.parse(clientsJson)
  return Object.values(clientsObj)
}

/**
 * Get client by ID
 */
export function getClient(clientId: string): Client | null {
  if (typeof window === "undefined") return null

  const clientsJson = localStorage.getItem("clients")
  if (!clientsJson) return null

  const clients = JSON.parse(clientsJson)
  return clients[clientId] || null
}

/**
 * Find client by ICO
 */
export function findClientByIco(ico: string): Client | null {
  const clients = getAllClients()
  return clients.find((c) => c.ico === ico) || null
}

/**
 * Create or update client
 */
export function saveClient(client: Partial<Client>): Client {
  if (typeof window === "undefined") throw new Error("Cannot save client on server")

  const clientsJson = localStorage.getItem("clients")
  const clients = clientsJson ? JSON.parse(clientsJson) : {}

  const clientId = client.id || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const savedClient: Client = {
    id: clientId,
    name: client.name || "",
    ico: client.ico,
    street: client.street,
    city: client.city,
    zip: client.zip,
    region: client.region,
    contactPerson: client.contactPerson,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    source: client.source || "manual",
    createdAt: client.createdAt || now,
    updatedAt: now,
  }

  clients[clientId] = savedClient
  localStorage.setItem("clients", JSON.stringify(clients))

  return savedClient
}

/**
 * Delete client
 */
export function deleteClient(clientId: string): void {
  if (typeof window === "undefined") return

  const clientsJson = localStorage.getItem("clients")
  if (!clientsJson) return

  const clients = JSON.parse(clientsJson)
  delete clients[clientId]
  localStorage.setItem("clients", JSON.stringify(clients))
}

/**
 * Auto-create client from contract party data
 */
export function createClientFromParty(partyData: {
  name: string
  ico?: string
  address?: string
  city?: string
  psc?: string
  region?: string
}): Client {
  // Check if client with this ICO already exists
  if (partyData.ico) {
    const existing = findClientByIco(partyData.ico)
    if (existing) {
      return existing
    }
  }

  return saveClient({
    name: partyData.name,
    ico: partyData.ico,
    street: partyData.address,
    city: partyData.city,
    zip: partyData.psc,
    region: partyData.region,
    source: partyData.ico ? "ares" : "manual",
  })
}

/**
 * Get client history (contracts and invoices)
 */
export function getClientHistory(clientId: string): ClientHistory {
  const client = getClient(clientId)
  if (!client) {
    return { contracts: [], invoices: [] }
  }

  // Get contracts
  const contractsJson = localStorage.getItem("contracts")
  const contracts = contractsJson ? JSON.parse(contractsJson) : {}

  const clientContracts = Object.values(contracts)
    .filter((contract: any) => {
      // Match by ICO or name
      const party1Match =
        (client.ico && contract.blocks?.some((b: any) => b.data?.party1Ico === client.ico)) ||
        contract.blocks?.some((b: any) => b.data?.party1Name === client.name)

      const party2Match =
        (client.ico && contract.blocks?.some((b: any) => b.data?.party2Ico === client.ico)) ||
        contract.blocks?.some((b: any) => b.data?.party2Name === client.name)

      return party1Match || party2Match
    })
    .map((contract: any) => ({
      id: contract.id,
      type: contract.type,
      name: contract.name || "Smlouva",
      createdAt: contract.createdAt,
      status: "completed" as const,
    }))

  // Get invoices
  const invoicesJson = localStorage.getItem("invoices")
  const invoices = invoicesJson ? JSON.parse(invoicesJson) : {}

  const clientInvoices = Object.values(invoices)
    .filter((invoice: any) => {
      // Match by name (invoices don't have ICO)
      return invoice.from === client.name
    })
    .map((invoice: any) => ({
      id: invoice.id,
      type: invoice.type,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      isPaid: invoice.isPaid,
      description: invoice.description,
    }))

  return {
    contracts: clientContracts,
    invoices: clientInvoices,
  }
}

/**
 * Search clients by name or ICO
 */
export function searchClients(query: string): Client[] {
  const clients = getAllClients()
  const lowercaseQuery = query.toLowerCase()

  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.ico?.includes(query) ||
      client.contactPerson?.toLowerCase().includes(lowercaseQuery),
  )
}
