"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const hasLoadedData = useRef(false)

  useEffect(() => {
    // Load all user data from cloud
    const loadUserData = async () => {
      if (typeof window === "undefined") return

      try {
        const user = await supabase.auth.getUser()
        if (!user.data.user) return

        console.log("Loading user data for:", user.data.user.email)

        // Check if this is a different user - if so, clear app data (but keep Supabase session)
        const lastUserId = localStorage.getItem("last_user_id")
        if (lastUserId && lastUserId !== user.data.user.id) {
          console.log("Different user detected - clearing old user's data")

          // Save Supabase session keys
          const supabaseKeys: string[] = []
          const savedData: { [key: string]: string } = {}

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
              supabaseKeys.push(key)
              const value = localStorage.getItem(key)
              if (value) savedData[key] = value
            }
          }

          // Clear everything
          localStorage.clear()

          // Restore Supabase session
          Object.entries(savedData).forEach(([key, value]) => {
            localStorage.setItem(key, value)
          })

          console.log("Cleared previous user's data, preserved Supabase session")
        }

        // Store current user ID
        localStorage.setItem("last_user_id", user.data.user.id)

        // Load all data modules dynamically - they will merge with existing localStorage
        const results = await Promise.allSettled([
          import("@/lib/contract-storage").then((m) => m.loadContractsFromCloud()),
          import("@/lib/clients").then((m) => m.loadClientsFromCloud()),
          import("@/lib/cash-flow").then((m) => m.loadInvoicesFromCloud()),
          import("@/lib/time-tracking").then((m) => m.loadTimeEntriesFromCloud()),
          import("@/lib/bank-accounts").then((m) => m.loadBankAccountsFromCloud()),
          import("@/lib/change-requests").then((m) => m.loadChangeRequestsFromCloud()),
          import("@/lib/user-settings").then((m) => m.loadUserSettingsFromCloud()),
          import("@/lib/profit-calculator").then((m) => m.loadCalculationsFromCloud()),
          import("@/lib/quick-orders").then((m) => m.loadQuickOrdersFromCloud()),
          import("@/lib/user-profile").then((m) => m.loadUserProfileFromCloud()),
        ])

        // Log any failures
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Failed to load module ${index}:`, result.reason)
          }
        })

        console.log("User data loaded successfully")
      } catch (error) {
        console.error("Failed to load user data:", error)
      }
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Load user data if authenticated AND not already loaded
      if (session && !hasLoadedData.current) {
        hasLoadedData.current = true
        loadUserData()
      }

      // Redirect to login if not authenticated (except on login and callback pages)
      if (!session && pathname !== "/login" && !pathname.startsWith("/auth/callback")) {
        router.push("/login")
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // Load user data ONLY on SIGN_IN event, not on every auth state change
      if (event === "SIGNED_IN" && session && !hasLoadedData.current) {
        hasLoadedData.current = true
        loadUserData()
      }

      // Reset flag on sign out
      if (event === "SIGNED_OUT") {
        hasLoadedData.current = false
      }

      if (!session && pathname !== "/login" && !pathname.startsWith("/auth/callback")) {
        router.push("/login")
      } else if (session && pathname === "/login") {
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  const signOut = async () => {
    try {
      // Wait a moment to ensure any pending sync operations complete
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset the data loaded flag
      hasLoadedData.current = false

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear all localStorage to prevent data leaking between users
      if (typeof window !== "undefined") {
        localStorage.clear()
      }

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      // Even on error, clear localStorage and redirect
      hasLoadedData.current = false
      if (typeof window !== "undefined") {
        localStorage.clear()
      }
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
