-- Migration to add new fields for enhanced features
-- Run this in your Supabase SQL Editor

-- 1. Add billing configuration fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS default_hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS billing_type TEXT CHECK (billing_type IN ('hourly', 'flat'));

-- 2. Create invoice_items table for line-item invoicing
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('service', 'material', 'travel')),
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_user_id ON invoice_items(user_id);

-- 4. Add Row Level Security (RLS) policies for invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoice items"
  ON invoice_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice items"
  ON invoice_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice items"
  ON invoice_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice items"
  ON invoice_items FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Add user profile settings table for logo and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  company_name TEXT,
  company_address TEXT,
  company_ico TEXT,
  company_dic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create index and RLS for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Add comment to describe tables
COMMENT ON TABLE invoice_items IS 'Line items for invoices (services, materials, travel expenses)';
COMMENT ON TABLE user_profiles IS 'User profile settings including company logo and information';
COMMENT ON COLUMN clients.default_hourly_rate IS 'Default hourly rate in CZK for this client';
COMMENT ON COLUMN clients.billing_type IS 'Billing type: hourly or flat rate';

-- Migration complete!
-- Note: This SQL creates tables and adds columns in a non-destructive way.
-- Existing data will not be affected.
