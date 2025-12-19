"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { CommandPalette } from "@/components/command-palette"
import { NotificationCenter } from "@/components/notification-center"
import { Breadcrumbs } from "@/components/breadcrumbs"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
}

export function AppLayout({ children, title, showBack = false }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen flex bg-background overflow-hidden safe-area-inset">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar - mobile header */}
        <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="touch-target touch-feedback"
              >
                <Menu className="w-5 h-5" strokeWidth={1.75} />
              </Button>
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="touch-feedback h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.75} />
                  Zpět
                </Button>
              )}
              {title && <span className="font-semibold text-sm truncate max-w-[180px]">{title}</span>}
            </div>
            {/* Notification and Search buttons for mobile */}
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                    bubbles: true,
                  })
                  document.dispatchEvent(event)
                }}
                className="text-muted-foreground touch-target touch-feedback"
              >
                <Search className="w-5 h-5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop header with breadcrumbs and notifications */}
        <div className="hidden lg:flex items-center justify-between px-6 pt-4">
          <Breadcrumbs />
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto scroll-smooth-touch">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  )
}
