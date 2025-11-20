# Migrace na Supabase - Status

## ✅ Hotovo

1. **Database Schema** - všechny tabulky vytvořeny v Supabase
2. **Auth Setup** - login/signup funkční
3. **Lib soubory** - contract-storage.ts a clients.ts přepsány na Supabase

## ⚠️ Známé problémy

### Async/Sync konflikt
Lib funkce jsou teď **async** (vrací Promise), ale components je volají **synchronně**.

**Příklad problému**:
```typescript
// Starý kód (sync)
const contracts = getFinalizedContracts() // ✅ funguje

// Nový kód (async)
const contracts = await getFinalizedContracts() // ❌ components nejsou async
```

## 🔧 Možná řešení

### Varianta A: Postupná migrace (doporučuji)
1. Nechat localStorage funkce jako fallback
2. Přidat "Sync do cloudu" tlačítko
3. User ručně migruje data když chce
4. Zbytek funguje normálně

### Varianta B: Plná migrace (složitější)
1. Updatovat VŠECHNY components na async
2. Použít useEffect + useState všude
3. Složité, hodně změn

## 📋 Co zbývá udělat

Pokud chceš **varianta A** (jednodušší):
- Vrátit lib funkce na localStorage
- Přidat paralelní Supabase funkce (např. `syncContractsToCloud()`)
- Přidat UI tlačítko pro sync
- Data fungují lokálně + volitelně v cloudu

Pokud chceš **varianta B** (kompletní cloud):
- Update ~15 component souborů
- Všude async/await + useEffect
- Cca 2-3 hodiny práce

**Který přístup chceš?**
