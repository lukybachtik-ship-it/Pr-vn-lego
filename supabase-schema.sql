-- Supabase Database Schema for Právní LEGO
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  finalized BOOLEAN DEFAULT FALSE,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  ico TEXT,
  dic TEXT,
  street TEXT,
  city TEXT,
  zip TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  "from" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT,
  variable_symbol TEXT,
  bank_account_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time entries table
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients(id),
  contract_id UUID REFERENCES contracts(id),
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  hourly_rate NUMERIC,
  billable BOOLEAN DEFAULT TRUE,
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank accounts table
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  account_number TEXT NOT NULL,
  bank_code TEXT NOT NULL,
  iban TEXT NOT NULL,
  currency TEXT DEFAULT 'CZK',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change requests table
CREATE TABLE change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  request_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  price_increase NUMERIC DEFAULT 0,
  deadline_extension_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  vat_limit_dismissed BOOLEAN DEFAULT FALSE,
  tax_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick orders table (for simplified job tracking)
CREATE TABLE quick_orders (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  orders JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit calculations table (for calculator history)
CREATE TABLE profit_calculations (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  calculations JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table (for business details)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  company_name TEXT,
  ico TEXT,
  dic TEXT,
  street TEXT,
  city TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Contracts policies
CREATE POLICY "Users can view own contracts" ON contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contracts" ON contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contracts" ON contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contracts" ON contracts FOR DELETE USING (auth.uid() = user_id);

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

-- Time entries policies
CREATE POLICY "Users can view own time entries" ON time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time entries" ON time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time entries" ON time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time entries" ON time_entries FOR DELETE USING (auth.uid() = user_id);

-- Bank accounts policies
CREATE POLICY "Users can view own bank accounts" ON bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank accounts" ON bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank accounts" ON bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank accounts" ON bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- Change requests policies
CREATE POLICY "Users can view own change requests" ON change_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own change requests" ON change_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own change requests" ON change_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own change requests" ON change_requests FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Quick orders policies
CREATE POLICY "Users can view own quick orders" ON quick_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quick orders" ON quick_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quick orders" ON quick_orders FOR UPDATE USING (auth.uid() = user_id);

-- Profit calculations policies
CREATE POLICY "Users can view own calculations" ON profit_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calculations" ON profit_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calculations" ON profit_calculations FOR UPDATE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_paid_date ON invoices(paid_date);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_created_at ON time_entries(created_at DESC);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_change_requests_contract_id ON change_requests(contract_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to contracts
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_settings
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
