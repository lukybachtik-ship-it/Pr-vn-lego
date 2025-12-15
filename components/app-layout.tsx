"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
}

export function AppLayout({ children, title, showBack = false }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - mobile header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              {showBack && (
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Zpět
                </Button>
              )}
              {title && <span className="font-semibold">{title}</span>}
            </div>
          </div>
        </header>

        {/* Desktop header with title */}
        {(title || showBack) && (
          <header className="hidden lg:flex items-center gap-4 h-16 px-8 border-b bg-background">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Zpět
              </Button>
            )}
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </header>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
