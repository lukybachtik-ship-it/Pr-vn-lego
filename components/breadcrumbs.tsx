"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

// Route configuration for breadcrumbs
const ROUTE_NAMES: Record<string, string> = {
  "": "Dashboard",
  "drafts": "Moje koncepty",
  "clients": "Klienti",
  "cash-flow": "Peníze",
  "deadlines": "Kalendář termínů",
  "quick-orders": "Rychlé zakázky",
  "calculator": "Kalkulačka zisku",
  "time-tracking": "Time Tracking",
  "contract": "Smlouva",
  "builder": "Průvodce smlouvou",
  "settings": "Nastavení",
  "profile": "Profil",
  "tax": "Daně",
  "bank-accounts": "Bankovní účty",
  "monthly-overview": "Měsíční přehled",
  "tax-calendar": "Daňový kalendář",
  "new": "Nový",
  "help": "Nápověda",
}

interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on dashboard
  if (pathname === "/") return null

  // Parse pathname into breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean)

  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    const isLast = index === pathSegments.length - 1

    // Check if segment is a dynamic route (UUID or ID)
    const isDynamic = segment.match(/^[0-9a-f-]{36}$|^\d+$/)
    let label = ROUTE_NAMES[segment] || segment

    if (isDynamic) {
      // For dynamic routes, use a generic label or try to get from context
      label = "Detail"
    }

    return { label, href, isLast }
  })

  // Add home at the beginning
  breadcrumbs.unshift({
    label: "Dashboard",
    href: "/",
    isLast: false,
  })

  return (
    <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          )}
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="w-3 h-3" />}
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

// Hook to get page title for breadcrumbs context
export function usePageTitle(customTitle?: string) {
  const pathname = usePathname()

  if (customTitle) return customTitle

  const segments = pathname.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  if (!lastSegment) return "Dashboard"

  // Check if it's a dynamic route
  if (lastSegment.match(/^[0-9a-f-]{36}$|^\d+$/)) {
    return "Detail"
  }

  return ROUTE_NAMES[lastSegment] || lastSegment
}
