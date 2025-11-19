/**
 * Time Tracking for Client Work
 * Track billable hours and generate invoices
 */

export interface TimeEntry {
  id: string
  clientId?: string
  contractId?: string
  description: string
  startTime: string // ISO timestamp
  endTime?: string // ISO timestamp (null = běží)
  durationMinutes?: number // calculated
  hourlyRate?: number // CZK/hodina
  billable: boolean
  invoiceId?: string // pokud už vyfakturováno
  createdAt: string
}

export interface TimeTrackingStats {
  totalHoursThisMonth: number
  billableHoursThisMonth: number
  unbilledRevenue: number // hodiny * sazba
  runningEntry: TimeEntry | null
}

/**
 * Get all time entries
 */
export function getAllTimeEntries(): TimeEntry[] {
  if (typeof window === "undefined") return []

  const entriesJson = localStorage.getItem("timeEntries")
  if (!entriesJson) return []

  return JSON.parse(entriesJson) as TimeEntry[]
}

/**
 * Get running time entry
 */
export function getRunningTimeEntry(): TimeEntry | null {
  const entries = getAllTimeEntries()
  return entries.find((e) => !e.endTime) || null
}

/**
 * Create manual time entry (without timer)
 */
export function createManualTimeEntry(
  description: string,
  durationMinutes: number,
  hourlyRate: number,
  clientId?: string,
  contractId?: string,
): TimeEntry {
  if (typeof window === "undefined") throw new Error("Cannot create entry on server")

  const now = new Date()
  const startTime = new Date(now.getTime() - durationMinutes * 60000) // Zpětné vypočítání času

  const entry: TimeEntry = {
    id: `time-${Date.now()}`,
    clientId,
    contractId,
    description,
    startTime: startTime.toISOString(),
    endTime: now.toISOString(),
    durationMinutes,
    hourlyRate,
    billable: true,
    createdAt: now.toISOString(),
  }

  const entries = getAllTimeEntries()
  entries.push(entry)
  localStorage.setItem("timeEntries", JSON.stringify(entries))

  return entry
}

/**
 * Start new time entry
 */
export function startTimeEntry(
  description: string,
  hourlyRate: number,
  clientId?: string,
  contractId?: string,
): TimeEntry {
  if (typeof window === "undefined") throw new Error("Cannot start timer on server")

  // Check if there's already a running entry
  const running = getRunningTimeEntry()
  if (running) {
    throw new Error("Timer už běží! Zastav ho před spuštěním nového.")
  }

  const entry: TimeEntry = {
    id: `time-${Date.now()}`,
    clientId,
    contractId,
    description,
    startTime: new Date().toISOString(),
    endTime: undefined,
    durationMinutes: undefined,
    hourlyRate,
    billable: true,
    createdAt: new Date().toISOString(),
  }

  const entries = getAllTimeEntries()
  entries.push(entry)
  localStorage.setItem("timeEntries", JSON.stringify(entries))

  return entry
}

/**
 * Stop running time entry
 */
export function stopTimeEntry(entryId: string): TimeEntry {
  if (typeof window === "undefined") throw new Error("Cannot stop timer on server")

  const entries = getAllTimeEntries()
  const entryIndex = entries.findIndex((e) => e.id === entryId)

  if (entryIndex === -1) {
    throw new Error("Time entry not found")
  }

  const entry = entries[entryIndex]
  if (entry.endTime) {
    throw new Error("Timer už je zastaven")
  }

  const now = new Date()
  entry.endTime = now.toISOString()

  // Calculate duration in minutes
  const start = new Date(entry.startTime)
  entry.durationMinutes = Math.round((now.getTime() - start.getTime()) / (1000 * 60))

  entries[entryIndex] = entry
  localStorage.setItem("timeEntries", JSON.stringify(entries))

  return entry
}

/**
 * Update time entry
 */
export function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): TimeEntry {
  if (typeof window === "undefined") throw new Error("Cannot update on server")

  const entries = getAllTimeEntries()
  const entryIndex = entries.findIndex((e) => e.id === entryId)

  if (entryIndex === -1) {
    throw new Error("Time entry not found")
  }

  entries[entryIndex] = { ...entries[entryIndex], ...updates }
  localStorage.setItem("timeEntries", JSON.stringify(entries))

  return entries[entryIndex]
}

/**
 * Delete time entry
 */
export function deleteTimeEntry(entryId: string): void {
  if (typeof window === "undefined") return

  const entries = getAllTimeEntries()
  const filtered = entries.filter((e) => e.id !== entryId)
  localStorage.setItem("timeEntries", JSON.stringify(filtered))
}

/**
 * Get time tracking stats for current month
 */
export function getTimeTrackingStats(): TimeTrackingStats {
  const entries = getAllTimeEntries()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthEntries = entries.filter((e) => {
    const date = new Date(e.createdAt)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && e.durationMinutes
  })

  const billableEntries = thisMonthEntries.filter((e) => e.billable && !e.invoiceId)

  const totalHours = thisMonthEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / 60
  const billableHours = billableEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / 60

  const unbilledRevenue = billableEntries.reduce((sum, e) => {
    const hours = (e.durationMinutes || 0) / 60
    return sum + hours * (e.hourlyRate || 0)
  }, 0)

  return {
    totalHoursThisMonth: Math.round(totalHours * 10) / 10,
    billableHoursThisMonth: Math.round(billableHours * 10) / 10,
    unbilledRevenue: Math.round(unbilledRevenue),
    runningEntry: getRunningTimeEntry(),
  }
}

/**
 * Get unbilled time entries
 */
export function getUnbilledTimeEntries(): TimeEntry[] {
  const entries = getAllTimeEntries()
  return entries.filter((e) => e.billable && !e.invoiceId && e.durationMinutes)
}

/**
 * Mark time entries as invoiced
 */
export function markTimeEntriesAsInvoiced(entryIds: string[], invoiceId: string): void {
  if (typeof window === "undefined") return

  const entries = getAllTimeEntries()
  entries.forEach((entry) => {
    if (entryIds.includes(entry.id)) {
      entry.invoiceId = invoiceId
    }
  })

  localStorage.setItem("timeEntries", JSON.stringify(entries))
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}
