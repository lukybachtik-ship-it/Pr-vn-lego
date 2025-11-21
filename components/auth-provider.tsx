"use client"

import { createContext, useContext, useEffect, useState } from "react"
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

  useEffect(() => {
    // Load all user data from cloud
    const loadUserData = async () => {
      if (typeof window === "undefined") return

      try {
        const user = await supabase.auth.getUser()
        if (!user.data.user) return

        // Load all data modules dynamically to trigger their cloud sync
        await Promise.all([
          import("@/lib/contract-storage").then((m) => m.loadContractsFromCloud?.()),
          import("@/lib/clients").then((m) => m.loadClientsFromCloud?.()),
          import("@/lib/cash-flow").then((m) => m.loadInvoicesFromCloud?.()),
          import("@/lib/time-tracking").then((m) => m.loadTimeEntriesFromCloud?.()),
          import("@/lib/bank-accounts").then((m) => m.loadBankAccountsFromCloud?.()),
          import("@/lib/change-requests").then((m) => m.loadChangeRequestsFromCloud?.()),
          import("@/lib/user-settings").then((m) => m.loadUserSettingsFromCloud?.()),
        ])
      } catch (error) {
        console.error("Failed to load user data:", error)
      }
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Load user data if authenticated
      if (session) {
        loadUserData()
      }

      // Redirect to login if not authenticated (except on login page)
      if (!session && pathname !== "/login") {
        router.push("/login")
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      // Load user data when user logs in
      if (session) {
        loadUserData()
      }

      if (!session && pathname !== "/login") {
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
      if (typeof window !== "undefined") {
        localStorage.clear()
      }
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
