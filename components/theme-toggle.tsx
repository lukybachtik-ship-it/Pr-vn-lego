"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" disabled>
        <Sun className="w-4 h-4" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycleTheme}
      title={`Téma: ${theme === "light" ? "Světlé" : theme === "dark" ? "Tmavé" : "Systémové"}`}
      className="touch-feedback"
    >
      {theme === "light" && <Sun className="w-4 h-4" strokeWidth={1.75} />}
      {theme === "dark" && <Moon className="w-4 h-4" strokeWidth={1.75} />}
      {theme === "system" && <Monitor className="w-4 h-4" strokeWidth={1.75} />}
      <span className="sr-only">Přepnout téma</span>
    </Button>
  )
}

// Full theme selector with dropdown
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const options = [
    { value: "light", label: "Světlé", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Tmavé", icon: <Moon className="w-4 h-4" /> },
    { value: "system", label: "Systémové", icon: <Monitor className="w-4 h-4" /> },
  ]

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start gap-2"
      >
        {theme === "light" && <Sun className="w-4 h-4" />}
        {theme === "dark" && <Moon className="w-4 h-4" />}
        {theme === "system" && <Monitor className="w-4 h-4" />}
        <span>{options.find((o) => o.value === theme)?.label || "Téma"}</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-md shadow-lg z-50 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                  theme === option.value ? "bg-primary/10 text-primary" : ""
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
