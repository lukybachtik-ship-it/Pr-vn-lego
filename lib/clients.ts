/**
 * Client Management Library
 * Auto-syncs to Supabase when user is logged in
 */

import { supabase } from "./supabase"

export interface Client {
  id: string
  ico?: string
  dic?: string
  name: string
  street?: string
  city?: string
  zip?: string
  phone?: string
  email?: string
  createdAt: string
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
 * Sync client to cloud
 */
async function syncClientToCloud(client: Client) {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { error } = await supabase.from("clients").upsert({
      id: client.id,
      user_id: user.data.user.id,
      name: client.name,
      ico: client.ico || null,
      dic: client.dic || null,
      street: client.street || null,
      city: client.city || null,
      zip: client.zip || null,
      email: client.email || null,
      phone: client.phone || null,
      created_at: client.createdAt,
    } as any)
    if (error) throw error
  } catch (error) {
    console.error("Client cloud sync failed:", error)
  }
}

/**
 * Load clients from cloud
 */
async function loadClientsFromCloud() {
  try {
    const user = await supabase.auth.getUser()
    if (!user.data.user) return

    const { data } = await supabase.from("clients").select("*").eq("user_id", user.data.user.id)

    if (!data || data.length === 0) return

    const localStr = localStorage.getItem("clients")
    const local: Record<string, Client> = localStr ? JSON.parse(localStr) : {}

    data.forEach((c: any) => {
      local[c.id] = {
        id: c.id,
        name: c.name,
        ico: c.ico || undefined,
        dic: c.dic || undefined,
        street: c.street || undefined,
        city: c.city || undefined,
        zip: c.zip || undefined,
        email: c.email || undefined,
        phone: c.phone || undefined,
        createdAt: c.created_at,
      }
    })

    localStorage.setItem("clients", JSON.stringify(local))
  } catch (error) {
    console.error("Clients cloud load failed:", error)
  }
}

// Auto-load on module import
if (typeof window !== "undefined") {
  loadClientsFromCloud()
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
    dic: client.dic,
    street: client.street,
    city: client.city,
    zip: client.zip,
    phone: client.phone,
    email: client.email,
    createdAt: client.createdAt || now,
  }

  clients[clientId] = savedClient
  localStorage.setItem("clients", JSON.stringify(clients))

  // Sync to cloud
  syncClientToCloud(savedClient)

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

  // Delete from cloud
  supabase.from("clients").delete().eq("id", clientId).then()
}

/**
 * Auto-create client from party data
 */
export function createClientFromParty(partyData: {
  name: string
  ico?: string
  address?: string
  city?: string
  psc?: string
}): Client {
  if (partyData.ico) {
    const existing = findClientByIco(partyData.ico)
    if (existing) return existing
  }

  return saveClient({
    name: partyData.name,
    ico: partyData.ico,
    street: partyData.address,
    city: partyData.city,
    zip: partyData.psc,
  })
}

/**
 * Get client history
 */
export function getClientHistory(clientId: string): ClientHistory {
  const client = getClient(clientId)
  if (!client) return { contracts: [], invoices: [] }

  // Get contracts
  const contractsJson = localStorage.getItem("contracts")
  const contracts = contractsJson ? JSON.parse(contractsJson) : {}

  const clientContracts = Object.values(contracts)
    .filter((contract: any) => {
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
      if (invoice.clientId) return invoice.clientId === clientId
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
 * Search clients
 */
export function searchClients(query: string): Client[] {
  const clients = getAllClients()
  const lowercaseQuery = query.toLowerCase()

  return clients.filter(
    (client) => client.name.toLowerCase().includes(lowercaseQuery) || client.ico?.includes(query),
  )
}
