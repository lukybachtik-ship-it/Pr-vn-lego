import type { ContractBlock } from "@/types/contract"

export interface ContractDeadline {
  id: string
  type: "payment" | "delivery" | "deadline" | "renewal" | "termination" | "warranty" | "other"
  title: string
  date: Date
  description?: string
  completed: boolean
  blockId: string
  daysUntil: number
  isPast: boolean
  isUpcoming: boolean // within 7 days
}

export interface ContractTimeline {
  deadlines: ContractDeadline[]
  nextDeadline: ContractDeadline | null
  overdueCount: number
  upcomingCount: number
}

/**
 * Extract all deadlines from contract blocks
 */
export function extractContractDeadlines(blocks: ContractBlock[], contractType: string): ContractTimeline {
  const deadlines: ContractDeadline[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Start of today

  blocks.forEach((block) => {
    if (!block.isComplete) return

    // Extract dates based on block type
    switch (block.templateId) {
      case "scope":
        if (block.data.deadline) {
          deadlines.push({
            id: `${block.id}-deadline`,
            type: "deadline",
            title: "Termín plnění díla",
            date: new Date(block.data.deadline),
            description: `Dokončení: ${block.data.scopeDescription || "dílo"}`,
            completed: false,
            blockId: block.id,
            daysUntil: 0,
            isPast: false,
            isUpcoming: false,
          })
        }
        break

      case "timeline":
        if (block.data.startDate) {
          deadlines.push({
            id: `${block.id}-start`,
            type: "other",
            title: "Zahájení projektu",
            date: new Date(block.data.startDate),
            description: "Začátek prací",
            completed: false,
            blockId: block.id,
            daysUntil: 0,
            isPast: false,
            isUpcoming: false,
          })
        }
        if (block.data.endDate) {
          deadlines.push({
            id: `${block.id}-end`,
            type: "deadline",
            title: "Dokončení projektu",
            date: new Date(block.data.endDate),
            description: block.data.milestones ? `Milníky: ${block.data.milestones}` : undefined,
            completed: false,
            blockId: block.id,
            daysUntil: 0,
            isPast: false,
            isUpcoming: false,
          })
        }
        break

      case "payment":
        // Try to extract payment date from terms
        if (block.data.paymentTerms) {
          const terms = block.data.paymentTerms.toLowerCase()
          // Simple heuristic - look for dates or days
          const daysMatch = terms.match(/(\d+)\s*dn[uůí]/)
          if (daysMatch) {
            const days = parseInt(daysMatch[1], 10)
            const paymentDate = new Date()
            paymentDate.setDate(paymentDate.getDate() + days)

            deadlines.push({
              id: `${block.id}-payment`,
              type: "payment",
              title: "Splatnost platby",
              date: paymentDate,
              description: `${block.data.amount} Kč - ${block.data.paymentTerms}`,
              completed: false,
              blockId: block.id,
              daysUntil: 0,
              isPast: false,
              isUpcoming: false,
            })
          }
        }
        break

      case "rental-period":
        if (block.data.rentalStart) {
          deadlines.push({
            id: `${block.id}-start`,
            type: "other",
            title: "Začátek pronájmu",
            date: new Date(block.data.rentalStart),
            description: "Předání nemovitosti",
            completed: false,
            blockId: block.id,
            daysUntil: 0,
            isPast: false,
            isUpcoming: false,
          })
        }
        if (block.data.rentalEnd) {
          deadlines.push({
            id: `${block.id}-end`,
            type: "termination",
            title: "Konec pronájmu",
            date: new Date(block.data.rentalEnd),
            description: "Vrácení nemovitosti",
            completed: false,
            blockId: block.id,
            daysUntil: 0,
            isPast: false,
            isUpcoming: false,
          })
        }
        break

      case "warranty":
        if (block.data.warrantyPeriod) {
          const months = parseInt(block.data.warrantyPeriod, 10)
          if (!isNaN(months)) {
            const warrantyEnd = new Date()
            warrantyEnd.setMonth(warrantyEnd.getMonth() + months)

            deadlines.push({
              id: `${block.id}-warranty`,
              type: "warranty",
              title: "Konec záruky",
              date: warrantyEnd,
              description: `Záruka ${months} měsíců - ${block.data.warrantyCoverage || ""}`,
              completed: false,
              blockId: block.id,
              daysUntil: 0,
              isPast: false,
              isUpcoming: false,
            })
          }
        }
        break

      case "delivery":
        if (block.data.deliveryTime) {
          const timeStr = block.data.deliveryTime.toLowerCase()
          const daysMatch = timeStr.match(/(\d+)\s*dn[uůí]/)
          if (daysMatch) {
            const days = parseInt(daysMatch[1], 10)
            const deliveryDate = new Date()
            deliveryDate.setDate(deliveryDate.getDate() + days)

            deadlines.push({
              id: `${block.id}-delivery`,
              type: "delivery",
              title: "Termín dodání",
              date: deliveryDate,
              description: `Dodání na: ${block.data.deliveryPlace || ""}`,
              completed: false,
              blockId: block.id,
              daysUntil: 0,
              isPast: false,
              isUpcoming: false,
            })
          }
        }
        break
    }
  })

  // Calculate daysUntil, isPast, isUpcoming
  deadlines.forEach((deadline) => {
    const diffTime = deadline.date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    deadline.daysUntil = diffDays
    deadline.isPast = diffDays < 0
    deadline.isUpcoming = diffDays >= 0 && diffDays <= 7
  })

  // Sort by date
  deadlines.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Find next deadline
  const nextDeadline = deadlines.find((d) => !d.isPast && !d.completed) || null

  // Count overdue and upcoming
  const overdueCount = deadlines.filter((d) => d.isPast && !d.completed).length
  const upcomingCount = deadlines.filter((d) => d.isUpcoming && !d.completed).length

  return {
    deadlines,
    nextDeadline,
    overdueCount,
    upcomingCount,
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Get deadline urgency color
 */
export function getDeadlineUrgency(deadline: ContractDeadline): "red" | "yellow" | "green" | "gray" {
  if (deadline.completed) return "gray"
  if (deadline.isPast) return "red"
  if (deadline.isUpcoming) return "yellow"
  return "green"
}
