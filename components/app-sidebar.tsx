"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileStack,
  UsersRound,
  Landmark,
  Timer,
  Banknote,
  PieChart,
  Bolt,
  LifeBuoy,
  LogOut,
  UserCircle2,
  X,
  TrendingUp,
  Link2,
  Building2,
  Briefcase,
  Scale,
  Search,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

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
  { title: "Dashboard", href: "/", icon: <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Moje koncepty", href: "/drafts", icon: <FileStack className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Klienti", href: "/clients", icon: <UsersRound className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Peníze", href: "/cash-flow", icon: <Landmark className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Kalendář termínů", href: "/deadlines", icon: <Timer className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Rychlé zakázky", href: "/quick-orders", icon: <Bolt className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Kalkulačka zisku", href: "/calculator", icon: <PieChart className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
]

const settingsNavItems: NavItem[] = [
  { title: "Bankovní účty", href: "/settings/bank-accounts", icon: <Banknote className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Nastavení profilu", href: "/settings/profile", icon: <UserCircle2 className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
  { title: "Daňové nastavení", href: "/settings/tax", icon: <Scale className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
]

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  // Handle swipe to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    // Swipe left to close (diff > 50px)
    if (diff > 50 && isOpen) {
      onToggle()
    }
    setTouchStart(null)
  }

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
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[280px] sm:w-60 bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:z-auto flex flex-col lg:h-screen lg:sticky safe-area-inset",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Logo / Brand */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 bg-sidebar-primary rounded flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-sidebar-primary-foreground" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight">BusinessHub</h1>
                <p className="text-[10px] text-sidebar-muted uppercase tracking-wide">Pro živnostníky</p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent touch-target touch-feedback"
              onClick={onToggle}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search / Command Palette button */}
        <div className="px-3 py-3 border-b border-sidebar-border">
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              })
              document.dispatchEvent(event)
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors text-[13px] touch-feedback min-h-[44px]"
          >
            <Search className="w-4 h-4" strokeWidth={1.75} />
            <span className="flex-1 text-left">Hledat...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-sidebar-muted bg-sidebar-accent px-1.5 py-0.5 rounded">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* User info */}
        {userEmail && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-sidebar-accent rounded flex items-center justify-center">
                <UserCircle2 className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-medium truncate flex-1 min-w-0">{userEmail}</p>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 sidebar-scroll scroll-smooth-touch">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-[13px] touch-feedback min-h-[44px]",
                  isActive(item.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Settings section */}
          <div className="mt-6">
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
              Nastavení
            </p>
            <div className="space-y-1">
              {settingsNavItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-[13px] touch-feedback min-h-[44px]",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="mt-6">
            <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
              Užitečné odkazy
            </p>
            <div className="space-y-1">
              <a
                href="https://financnisprava.gov.cz/cs/kontakty"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground text-[13px] touch-feedback min-h-[44px]"
              >
                <Building2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Finanční úřady</span>
                <Link2 className="w-3 h-3 ml-auto opacity-50" />
              </a>
              <a
                href="https://rzp.gov.cz/adresar-uradu/cs/urady/vyber-uradu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground text-[13px] touch-feedback min-h-[44px]"
              >
                <Briefcase className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Živnostenské úřady</span>
                <Link2 className="w-3 h-3 ml-auto opacity-50" />
              </a>
              <a
                href="https://eformulare.justice.cz/msp-financni-zdravi/form/uvod"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground text-[13px] touch-feedback min-h-[44px]"
              >
                <Scale className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Finanční zdraví</span>
                <Link2 className="w-3 h-3 ml-auto opacity-50" />
              </a>
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[13px] text-sidebar-foreground/90">Téma</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => handleNavigation("/help")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground text-[13px] touch-feedback min-h-[44px]"
          >
            <LifeBuoy className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>Nápověda</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left transition-colors text-destructive/90 hover:bg-destructive/10 hover:text-destructive text-[13px] touch-feedback min-h-[44px]"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>Odhlásit se</span>
          </button>
        </div>
      </aside>
    </>
  )
}
