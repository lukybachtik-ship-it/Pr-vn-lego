"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  LayoutDashboard,
  FileStack,
  UsersRound,
  Landmark,
  Timer,
  Bolt,
  PieChart,
  LifeBuoy,
  Banknote,
  UserCircle2,
  Settings,
  LogOut,
  Search,
  FilePlus2,
  Receipt,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllClients, type Client } from "@/lib/clients"
import { getFinalizedContracts, type SavedContract } from "@/lib/contract-storage"

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
  category: "navigation" | "action" | "client" | "contract"
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [clients, setClients] = React.useState<Client[]>([])
  const [contracts, setContracts] = React.useState<SavedContract[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load data when opened
  React.useEffect(() => {
    if (open) {
      setClients(getAllClients())
      setContracts(getFinalizedContracts())
      setSearch("")
      setSelectedIndex(0)
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navigationItems: CommandItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      subtitle: "Přehled financí a smluv",
      icon: LayoutDashboard,
      action: () => router.push("/"),
      keywords: ["home", "přehled", "domů"],
      category: "navigation",
    },
    {
      id: "contracts",
      title: "Moje koncepty",
      subtitle: "Správa smluv a dokumentů",
      icon: FileStack,
      action: () => router.push("/contracts"),
      keywords: ["smlouvy", "dokumenty", "koncepty"],
      category: "navigation",
    },
    {
      id: "clients",
      title: "Klienti",
      subtitle: "Adresář kontaktů",
      icon: UsersRound,
      action: () => router.push("/clients"),
      keywords: ["zákazníci", "kontakty", "firmy"],
      category: "navigation",
    },
    {
      id: "cash-flow",
      title: "Peníze",
      subtitle: "Příjmy a výdaje",
      icon: Landmark,
      action: () => router.push("/cash-flow"),
      keywords: ["faktury", "finance", "příjmy", "výdaje"],
      category: "navigation",
    },
    {
      id: "quick-orders",
      title: "Rychlé zakázky",
      subtitle: "Evidence menších zakázek",
      icon: Bolt,
      action: () => router.push("/quick-orders"),
      keywords: ["zakázky", "objednávky"],
      category: "navigation",
    },
    {
      id: "calculator",
      title: "Kalkulačka zisku",
      subtitle: "Výpočet čistého příjmu",
      icon: PieChart,
      action: () => router.push("/calculator"),
      keywords: ["kalkulačka", "daně", "zisk"],
      category: "navigation",
    },
    {
      id: "time-tracking",
      title: "Time Tracking",
      subtitle: "Evidence odpracovaného času",
      icon: Timer,
      action: () => router.push("/time-tracking"),
      keywords: ["čas", "hodiny", "práce"],
      category: "navigation",
    },
    {
      id: "help",
      title: "Nápověda",
      subtitle: "Průvodce aplikací",
      icon: LifeBuoy,
      action: () => router.push("/help"),
      keywords: ["pomoc", "návod", "help"],
      category: "navigation",
    },
    {
      id: "settings-profile",
      title: "Nastavení profilu",
      subtitle: "Firemní údaje",
      icon: UserCircle2,
      action: () => router.push("/settings/profile"),
      keywords: ["profil", "ico", "dic", "firma"],
      category: "navigation",
    },
    {
      id: "settings-bank",
      title: "Bankovní účty",
      subtitle: "Správa účtů pro QR platby",
      icon: Banknote,
      action: () => router.push("/settings/bank-accounts"),
      keywords: ["banka", "účet", "platby"],
      category: "navigation",
    },
  ]

  const actionItems: CommandItem[] = [
    {
      id: "new-contract",
      title: "Nová smlouva",
      subtitle: "Vytvořit nový dokument",
      icon: FilePlus2,
      action: () => router.push("/builder"),
      keywords: ["vytvořit", "přidat", "nový"],
      category: "action",
    },
    {
      id: "new-invoice",
      title: "Nová faktura",
      subtitle: "Přidat příjmovou fakturu",
      icon: Receipt,
      action: () => router.push("/cash-flow"),
      keywords: ["faktura", "příjem"],
      category: "action",
    },
    {
      id: "new-client",
      title: "Nový klient",
      subtitle: "Přidat do adresáře",
      icon: Plus,
      action: () => router.push("/clients/new"),
      keywords: ["klient", "zákazník", "přidat"],
      category: "action",
    },
    {
      id: "new-order",
      title: "Nová zakázka",
      subtitle: "Rychlá zakázka bez smlouvy",
      icon: Bolt,
      action: () => router.push("/quick-orders"),
      keywords: ["zakázka", "objednávka"],
      category: "action",
    },
  ]

  // Generate client items
  const clientItems: CommandItem[] = clients.slice(0, 5).map((client) => ({
    id: `client-${client.id}`,
    title: client.name,
    subtitle: client.ico ? `IČO: ${client.ico}` : client.email || undefined,
    icon: UsersRound,
    action: () => router.push(`/clients/${client.id}`),
    keywords: [client.name.toLowerCase(), client.ico || "", client.email || ""].filter(Boolean),
    category: "client" as const,
  }))

  // Generate contract items
  const contractItems: CommandItem[] = contracts.slice(0, 5).map((contract) => ({
    id: `contract-${contract.id}`,
    title: contract.name,
    subtitle: new Date(contract.savedAt).toLocaleDateString("cs-CZ"),
    icon: FileStack,
    action: () => router.push(`/contract/${contract.id}`),
    keywords: [contract.name.toLowerCase()],
    category: "contract" as const,
  }))

  // Filter items based on search
  const filterItems = (items: CommandItem[]): CommandItem[] => {
    if (!search) return items
    const searchLower = search.toLowerCase()
    return items.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchLower)
      const subtitleMatch = item.subtitle?.toLowerCase().includes(searchLower)
      const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(searchLower))
      return titleMatch || subtitleMatch || keywordMatch
    })
  }

  const filteredNavigation = filterItems(navigationItems)
  const filteredActions = filterItems(actionItems)
  const filteredClients = filterItems(clientItems)
  const filteredContracts = filterItems(contractItems)

  const allItems = [
    ...filteredActions,
    ...filteredNavigation,
    ...filteredClients,
    ...filteredContracts,
  ]

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault()
        allItems[selectedIndex].action()
        setOpen(false)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, selectedIndex, allItems])

  // Reset selection when search changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const renderGroup = (title: string, items: CommandItem[], startIndex: number) => {
    if (items.length === 0) return null

    return (
      <div className="px-1 pb-2">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{title}</div>
        {items.map((item, index) => {
          const globalIndex = startIndex + index
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={cn(
                "flex items-center gap-3 w-full px-2 py-2 rounded-md text-left transition-colors",
                globalIndex === selectedIndex
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-muted/50 text-foreground"
              )}
              onClick={() => {
                item.action()
                setOpen(false)
              }}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded bg-muted/50">
                <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                )}
              </div>
              {globalIndex === selectedIndex && (
                <div className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                  Enter
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  let currentIndex = 0
  const actionsStartIndex = currentIndex
  currentIndex += filteredActions.length
  const navigationStartIndex = currentIndex
  currentIndex += filteredNavigation.length
  const clientsStartIndex = currentIndex
  currentIndex += filteredClients.length
  const contractsStartIndex = currentIndex

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Hledej stránku, akci nebo klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {allItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Žádné výsledky pro "{search}"
            </div>
          ) : (
            <>
              {renderGroup("Rychlé akce", filteredActions, actionsStartIndex)}
              {renderGroup("Navigace", filteredNavigation, navigationStartIndex)}
              {renderGroup("Klienti", filteredClients, clientsStartIndex)}
              {renderGroup("Smlouvy", filteredContracts, contractsStartIndex)}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-muted border border-border">↑</kbd>
              <kbd className="px-1 rounded bg-muted border border-border">↓</kbd>
              navigace
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-muted border border-border">Enter</kbd>
              vybrat
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 rounded bg-muted border border-border">Esc</kbd>
            zavřít
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for opening command palette programmatically
export function useCommandPalette() {
  const openCommandPalette = React.useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [])

  return { openCommandPalette }
}
