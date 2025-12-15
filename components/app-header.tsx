"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Menu, Home, User, LogOut, Settings, HelpCircle, Calculator, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"

interface AppHeaderProps {
  title?: string
  showBack?: boolean
  showMenu?: boolean
}

export function AppHeader({ title, showBack = true, showMenu = true }: AppHeaderProps) {
  const router = useRouter()
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Zpět
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <Home className="w-4 h-4 mr-1" />
            Domů
          </Button>
          {title && <span className="font-semibold ml-4">{title}</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Menu */}
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/drafts")}>
                  Moje koncepty
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/clients")}>
                  Klienti
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/cash-flow")}>
                  Peníze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/quick-orders")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Rychlé zakázky
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/calculator")}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Kalkulačka zisku
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/time-tracking")}>
                  Time Tracking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings/bank-accounts")}>
                  Bankovní účty
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/help")}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Nápověda
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {userEmail && (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">{userEmail}</div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                <Settings className="w-4 h-4 mr-2" />
                Nastavení profilu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/tax")}>
                <Calculator className="w-4 h-4 mr-2" />
                Daňové nastavení
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/help")}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Nápověda
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Odhlásit se
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
