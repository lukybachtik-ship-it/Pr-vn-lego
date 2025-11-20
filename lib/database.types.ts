/**
 * Database Types
 * Generated from Supabase schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          blocks: Json
          finalized: boolean
          finalized_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          blocks: Json
          finalized?: boolean
          finalized_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          blocks?: Json
          finalized?: boolean
          finalized_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          ico: string | null
          dic: string | null
          street: string | null
          city: string | null
          zip: string | null
          email: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          ico?: string | null
          dic?: string | null
          street?: string | null
          city?: string | null
          zip?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          ico?: string | null
          dic?: string | null
          street?: string | null
          city?: string | null
          zip?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          type: "income" | "expense"
          from: string
          amount: number
          due_date: string
          description: string | null
          is_paid: boolean
          paid_date: string | null
          client_id: string | null
          invoice_number: string | null
          variable_symbol: string | null
          bank_account_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "income" | "expense"
          from: string
          amount: number
          due_date: string
          description?: string | null
          is_paid?: boolean
          paid_date?: string | null
          client_id?: string | null
          invoice_number?: string | null
          variable_symbol?: string | null
          bank_account_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "income" | "expense"
          from?: string
          amount?: number
          due_date?: string
          description?: string | null
          is_paid?: boolean
          paid_date?: string | null
          client_id?: string | null
          invoice_number?: string | null
          variable_symbol?: string | null
          bank_account_id?: string | null
          created_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          contract_id: string | null
          description: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          hourly_rate: number | null
          billable: boolean
          invoice_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          contract_id?: string | null
          description: string
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          hourly_rate?: number | null
          billable?: boolean
          invoice_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          contract_id?: string | null
          description?: string
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          hourly_rate?: number | null
          billable?: boolean
          invoice_id?: string | null
          created_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: string
          user_id: string
          account_number: string
          bank_code: string
          iban: string
          currency: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_number: string
          bank_code: string
          iban: string
          currency?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_number?: string
          bank_code?: string
          iban?: string
          currency?: string
          is_default?: boolean
          created_at?: string
        }
      }
      change_requests: {
        Row: {
          id: string
          user_id: string
          contract_id: string
          request_number: number
          description: string
          price_increase: number
          deadline_extension_days: number
          status: "pending" | "approved" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_id: string
          request_number: number
          description: string
          price_increase?: number
          deadline_extension_days?: number
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contract_id?: string
          request_number?: number
          description?: string
          price_increase?: number
          deadline_extension_days?: number
          status?: "pending" | "approved" | "rejected"
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          vat_limit_dismissed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          vat_limit_dismissed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          vat_limit_dismissed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
