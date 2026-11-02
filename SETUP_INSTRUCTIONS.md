# Supabase Setup - Instrukce

## 1. Založ projekt a spusť SQL

1. Na https://supabase.com/dashboard vytvoř nový projekt (Free plán stačí, region např. Frankfurt)
2. Jdi na **SQL Editor** v levém menu
3. Zkopíruj celý obsah souboru `supabase-setup.sql`
4. Vlož do editoru a klikni **RUN**

Skript vytvoří všechny tabulky, Row Level Security (každý uživatel vidí jen svá data), indexy, triggery a Storage bucket `logos` pro loga. Jde bezpečně spustit i opakovaně.

## 2. Nastav přihlašování

V **Authentication → Sign In / Providers → Email**:
- vypni **Confirm email**, aby se studenti mohli rovnou registrovat (vestavěný e-mail Supabase pošle jen pár e-mailů za hodinu)

V **Authentication → URL Configuration**:
- **Site URL**: `https://nejnovejsipravnilego.vercel.app`
- **Redirect URLs**: přidej `https://nejnovejsipravnilego.vercel.app/**` a `http://localhost:3000/**`

## 3. Propoj s Vercelem

1. V Supabase: **Project Settings → API** (nebo tlačítko **Connect**) zkopíruj **Project URL** a **anon public** klíč
2. Ve Vercelu: **Settings → Environment Variables** přepiš:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon klíč
3. **Deployments → poslední deployment → Redeploy** (proměnné se do aplikace dostanou až při novém buildu)

Pro lokální vývoj dej stejné dvě proměnné do souboru `.env.local`.

## 4. Udržení databáze vzhůru

Free projekty Supabase se po 7 dnech bez aktivity pozastaví. Vercel Cron (`vercel.json`) proto jednou denně volá `/api/keep-alive`, který udělá jeden dotaz do databáze. Funkčnost ověříš otevřením `https://nejnovejsipravnilego.vercel.app/api/keep-alive` – má vrátit `{"ok":true,...}`.
