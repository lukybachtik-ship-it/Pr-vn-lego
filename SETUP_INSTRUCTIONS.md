# Supabase Setup - Instrukce

## 1. Spusť SQL Schema

1. Otevři https://supabase.com/dashboard/project/imrbnrzbjyesdpjmkfuv
2. Jdi na **SQL Editor** v levém menu
3. Zkopíruj celý obsah souboru `supabase-schema.sql`
4. Vlož do editoru a klikni **RUN**
5. Počkej až se vytvoří všechny tabulky

## 2. Co se stane

- **Vytvoří se 7 tabulek**: contracts, clients, invoices, time_entries, bank_accounts, change_requests, user_settings
- **Row Level Security (RLS)**: Každý user vidí jen svá data
- **Indexy**: Pro rychlé dotazy
- **Triggery**: Auto-update `updated_at` sloupců

## 3. Test Auth

Po buildu:
1. Spusť `npm run dev`
2. Otevři http://localhost:3000
3. Automaticky redirect na `/login`
4. Registruj se (email + heslo min 6 znaků)
5. Zkontroluj email pro potvrzení

## 4. Migrace localStorage dat

Po prvním přihlášení můžeš spustit migraci:
- Tlačítko "Migrovat data z localStorage" se objeví na hlavní stránce
- Zkopíruje všechna data do Supabase
- Data v localStorage zůstanou jako backup

## 5. Hotovo!

Všechny funkce budou fungovat stejně, ale data budou:
- ✅ V cloudu (bezpečná záloha)
- ✅ Multi-device (přihlásit se odkudkoliv)
- ✅ Sdílená mezi zařízeními
- ✅ Chráněná RLS (nikdo jiný nevidí tvá data)
