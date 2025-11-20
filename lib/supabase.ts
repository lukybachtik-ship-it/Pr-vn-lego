/**
 * Supabase Client Setup
 * Handles authentication and database connections
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Client for browser use (respects RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper to get current user
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper to require authentication
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Musíš být přihlášený")
  }
  return user
}
