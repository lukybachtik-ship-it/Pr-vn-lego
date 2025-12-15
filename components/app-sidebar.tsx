"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Home,
  FileText,
  Users,
  Wallet,
  Clock,
  CreditCard,
  Calculator,
  Zap,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronLeft,
  Menu,
  X,
  Plus,
  BarChart3,
  ExternalLink,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: <Home className="w-5 h-5" /> },
  { title: "Moje koncepty", href: "/drafts", icon: <FileText className="w-5 h-5" /> },
  { title: "Klienti", href: "/clients", icon: <Users className="w-5 h-5" /> },
  { title: "Peníze", href: "/cash-flow", icon: <Wallet className="w-5 h-5" /> },
  { title: "Rychlé zakázky", href: "/quick-orders", icon: <Zap className="w-5 h-5" /> },
  { title: "Kalkulačka zisku", href: "/calculator", icon: <Calculator className="w-5 h-5" /> },
  { title: "Time Tracking", href: "/time-tracking", icon: <Clock className="w-5 h-5" /> },
]

const settingsNavItems: NavItem[] = [
  { title: "Bankovní účty", href: "/settings/bank-accounts", icon: <CreditCard className="w-5 h-5" /> },
  { title: "Nastavení profilu", href: "/settings/profile", icon: <User className="w-5 h-5" /> },
  { title: "Daňové nastavení", href: "/settings/tax", icon: <Calculator className="w-5 h-5" /> },
]

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle()
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">BusinessHub</h1>
                <p className="text-xs text-sidebar-muted">Pro živnostníky</p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onToggle}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User info */}
        {userEmail && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Settings section */}
          <div className="mt-8">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              Nastavení
            </p>
            <div className="space-y-1">
              {settingsNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="mt-8">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              Užitečné odkazy
            </p>
            <div className="space-y-1">
              <a
                href="https://financnisprava.gov.cz/cs/kontakty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sidebar-foreground hover:bg-sidebar-accent text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Finanční úřady</span>
              </a>
              <a
                href="https://rzp.gov.cz/adresar-uradu/cs/urady/vyber-uradu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sidebar-foreground hover:bg-sidebar-accent text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Živnostenské úřady</span>
              </a>
              <a
                href="https://eformulare.justice.cz/msp-financni-zdravi/form/uvod"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sidebar-foreground hover:bg-sidebar-accent text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Finanční zdraví</span>
              </a>
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => handleNavigation("/help")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Nápověda</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Odhlásit se</span>
          </button>
        </div>
      </aside>
    </>
  )
}
