# BusinessHub - Komplexní implementační plán

## Přehled projektu
Cíl: Vytvořit profesionální, konzistentní aplikaci pro živnostníky s plnou mobilní podporou.

---

## FÁZE 1: Konzistence designu (Základ)
**Priorita: KRITICKÁ** | **Odhadovaný rozsah: 13 stránek**

### 1.1 Stránky bez AppLayout (KRITICKÉ)
- [ ] `app/clients/[id]/page.tsx` - Přidat AppLayout, odstranit vlastní navigaci
- [ ] `app/clients/new/page.tsx` - Přidat AppLayout, odstranit vlastní navigaci
- [ ] `app/builder/page.tsx` - Zvážit AppLayout wrapper (specifický use-case)

### 1.2 Nekonzistentní hlavičky
- [ ] `app/drafts/page.tsx` - Opravit z text-3xl/4xl na text-2xl
- [ ] `app/settings/profile/page.tsx` - Opravit z text-4xl na text-2xl
- [ ] `app/settings/tax/page.tsx` - Sjednotit header layout
- [ ] `app/settings/bank-accounts/page.tsx` - Sjednotit z text-3xl na text-2xl
- [ ] `app/contract/[id]/page.tsx` - Odstranit duplicitní navigaci
- [ ] `app/cash-flow/monthly-overview/page.tsx` - Standardizovat header
- [ ] `app/cash-flow/tax-calendar/page.tsx` - Standardizovat header

### 1.3 Chybějící animace (stagger-item)
- [ ] `app/drafts/page.tsx` - Přidat na karty
- [ ] `app/settings/profile/page.tsx` - Přidat na sekce
- [ ] `app/settings/tax/page.tsx` - Přidat na radio groups
- [ ] `app/settings/bank-accounts/page.tsx` - Přidat na karty účtů
- [ ] `app/clients/[id]/page.tsx` - Přidat na karty
- [ ] `app/calculator/page.tsx` - Přidat na input/output sekce
- [ ] `app/contract/[id]/page.tsx` - Přidat na sekce
- [ ] `app/cash-flow/monthly-overview/page.tsx` - Přidat na měsíční karty
- [ ] `app/cash-flow/tax-calendar/page.tsx` - Přidat na události

### 1.4 Chybějící skeleton loading
- [ ] Vytvořit `SkeletonDrafts` komponentu
- [ ] Vytvořit `SkeletonSettings` komponentu
- [ ] Vytvořit `SkeletonClientDetail` komponentu
- [ ] Vytvořit `SkeletonContractDetail` komponentu
- [ ] Vytvořit `SkeletonCalculator` komponentu
- [ ] Implementovat skeletony do všech stránek s async daty

### 1.5 Hardcoded barvy → Design tokeny
- [ ] `app/cash-flow/monthly-overview/page.tsx` - Nahradit bg-green-100 → bg-success/10
- [ ] `app/cash-flow/tax-calendar/page.tsx` - Nahradit všechny hardcoded barvy
- [ ] Audit všech stránek pro konzistentní použití barev

---

## FÁZE 2: Mobilní optimalizace
**Priorita: VYSOKÁ** | **Zaměření: Mobile-friendly UX**

### 2.1 Vylepšený Hamburger Menu
- [ ] Přidat animaci otevření/zavření (slide + fade)
- [ ] Větší touch targets (min 44px)
- [ ] Haptic feedback indikátor (vizuální)
- [ ] Swipe-to-close gesto

### 2.2 Mobile Header vylepšení
- [ ] Sticky header s blur efektem (již částečně)
- [ ] Kompaktnější layout pro malé obrazovky
- [ ] Kontextové akce v headeru (např. +Přidat na stránce faktur)

### 2.3 Touch-friendly formuláře
- [ ] Větší input fields na mobilu (h-12 místo h-10)
- [ ] Správné keyboard types (inputmode="numeric", "email", "tel")
- [ ] Datum picker optimalizovaný pro touch
- [ ] Větší checkboxy a radio buttons

### 2.4 Swipe gestures
- [ ] Swipe-to-delete na seznamech (faktury, zakázky)
- [ ] Pull-to-refresh na hlavních stránkách
- [ ] Swipe mezi kartami/sekcemi kde to dává smysl

### 2.5 Mobile-specific komponenty
- [ ] Sheet místo Dialog na mobilu pro formuláře
- [ ] Collapsible sekce pro dlouhé seznamy
- [ ] Floating Action Button (FAB) pro rychlé akce

### 2.6 Builder mobile optimalizace
- [ ] Zjednodušený mód pro mobil (seznam místo drag&drop)
- [ ] Tlačítka nahoru/dolů pro řazení bloků
- [ ] Větší touch targets pro editaci bloků

---

## FÁZE 3: Onboarding Wizard
**Priorita: VYSOKÁ** | **Nová funkcionalita**

### 3.1 Struktura onboardingu
- [ ] Vytvořit `components/onboarding-wizard.tsx`
- [ ] Krok 1: Uvítání + základní info o aplikaci
- [ ] Krok 2: Nastavení profilu (firma, IČO, adresa)
- [ ] Krok 3: Daňové nastavení (paušál vs skutečné výdaje, DPH)
- [ ] Krok 4: Bankovní účet pro QR platby
- [ ] Krok 5: Hotovo + quick tips

### 3.2 Logika onboardingu
- [ ] Vytvořit `lib/onboarding.ts` pro stav onboardingu
- [ ] Detekce prvního přihlášení
- [ ] Možnost přeskočit a vrátit se později
- [ ] Progress indikátor (kroky 1-5)
- [ ] Uložení stavu do Supabase/localStorage

### 3.3 UI/UX onboardingu
- [ ] Full-screen wizard layout
- [ ] Animace přechodů mezi kroky
- [ ] Validace před pokračováním
- [ ] Možnost vrátit se zpět

---

## FÁZE 4: Notifikační centrum
**Priorita: VYSOKÁ** | **Nová funkcionalita**

### 4.1 Komponenta notifikací
- [ ] Vytvořit `components/notification-center.tsx`
- [ ] Bell icon v headeru s badge počtem
- [ ] Dropdown panel s notifikacemi
- [ ] Typy: deadline, nezaplacená faktura, připomínka

### 4.2 Logika notifikací
- [ ] Vytvořit `lib/notifications.ts`
- [ ] Automatická detekce blížících se deadlines (3, 7, 14 dní)
- [ ] Detekce faktur po splatnosti
- [ ] Detekce nevyfakturovaného času
- [ ] Mark as read/dismiss funkcionalita

### 4.3 Persistence notifikací
- [ ] Uložení dismissed notifikací
- [ ] Nastavení frekvence upozornění
- [ ] Preference typů notifikací

---

## FÁZE 5: Kalendář deadlines
**Priorita: VYSOKÁ** | **Nová stránka**

### 5.1 Nová stránka kalendáře
- [ ] Vytvořit `app/calendar/page.tsx`
- [ ] Měsíční zobrazení kalendáře
- [ ] Týdenní zobrazení (volitelné)
- [ ] Seznam view jako alternativa

### 5.2 Typy událostí v kalendáři
- [ ] Splatnost faktur (příjmy/výdaje)
- [ ] Termíny ze smluv
- [ ] Daňové povinnosti (z tax-calendar)
- [ ] Vlastní připomínky (volitelné)

### 5.3 Interakce
- [ ] Click na den → detail událostí
- [ ] Color coding podle typu
- [ ] Quick actions (označit jako zaplaceno, apod.)
- [ ] Filtrování podle typu

### 5.4 Integrace
- [ ] Přidat do sidebaru
- [ ] Widget na dashboard s upcoming events
- [ ] Export do Google Calendar / iCal

---

## FÁZE 6: Breadcrumbs navigace
**Priorita: STŘEDNÍ** | **UX vylepšení**

### 6.1 Komponenta breadcrumbs
- [ ] Vytvořit/upravit `components/breadcrumbs.tsx`
- [ ] Automatická detekce cesty
- [ ] Klikatelné odkazy
- [ ] Mobilní verze (collapsed)

### 6.2 Implementace na stránkách
- [ ] Settings podstránky
- [ ] Client detail
- [ ] Contract detail
- [ ] Cash-flow podstránky

---

## FÁZE 7: Dark Mode Toggle
**Priorita: STŘEDNÍ** | **UX vylepšení**

### 7.1 Toggle komponenta
- [ ] Přidat toggle do sidebaru (spodní sekce)
- [ ] Přidat do settings/profile
- [ ] Animovaný sun/moon icon

### 7.2 Persistence
- [ ] Uložit preferenci do localStorage
- [ ] Respektovat system preference jako default
- [ ] Okamžitá aplikace bez reload

---

## FÁZE 8: Email upomínky
**Priorita: STŘEDNÍ** | **Backend funkcionalita**

### 8.1 Nastavení upomínek
- [ ] UI pro nastavení email upomínek v settings
- [ ] Konfigurace: kolik dní před/po splatnosti
- [ ] Šablona emailu (customizable)

### 8.2 Backend integrace
- [ ] Supabase Edge Functions / externíslužba
- [ ] Cron job pro kontrolu splatností
- [ ] Email sending (Resend/SendGrid)
- [ ] Logging odeslaných upomínek

### 8.3 Manuální upomínky
- [ ] Tlačítko "Odeslat upomínku" u faktury
- [ ] Preview emailu před odesláním
- [ ] Historie odeslaných upomínek

---

## FÁZE 9: Rychlé faktury ze zakázek
**Priorita: STŘEDNÍ** | **Workflow vylepšení**

### 9.1 One-click fakturace
- [ ] Tlačítko "Vytvořit fakturu" na quick-orders
- [ ] Automatické vyplnění údajů ze zakázky
- [ ] Přechod do cash-flow s předvyplněným formulářem

### 9.2 Hromadná fakturace
- [ ] Výběr více zakázek
- [ ] Sloučení do jedné faktury
- [ ] Seskupení položek

---

## FÁZE 10: Sdílení smlouvy
**Priorita: NÍZKÁ** | **Pokročilá funkcionalita**

### 10.1 Generování share linku
- [ ] Unikátní URL pro každou smlouvu
- [ ] Volitelná expirace linku
- [ ] Volitelné heslo

### 10.2 Veřejná view stránka
- [ ] `app/share/[token]/page.tsx`
- [ ] Read-only zobrazení smlouvy
- [ ] Možnost stažení PDF
- [ ] Tlačítko "Schválit" (volitelné)

### 10.3 Tracking
- [ ] Notifikace při otevření
- [ ] Historie přístupů
- [ ] Status schválení

---

## FÁZE 11: Technická vylepšení
**Priorita: PRŮBĚŽNĚ** | **Kvalita kódu**

### 11.1 Error Boundaries
- [ ] Vytvořit `components/error-boundary.tsx`
- [ ] Graceful error handling
- [ ] Retry mechanismus
- [ ] Error reporting

### 11.2 Toast notifikace
- [ ] Audit všech alert() volání
- [ ] Nahradit za toast z Sonner
- [ ] Konzistentní success/error/info stavy

### 11.3 Keyboard shortcuts
- [ ] Rozšířit command palette o další akce
- [ ] Cmd+N → Nová faktura
- [ ] Cmd+Shift+N → Nová zakázka
- [ ] Cmd+, → Nastavení
- [ ] ? → Help / seznam zkratek

### 11.4 PWA základ
- [ ] Web app manifest
- [ ] Service worker pro cache
- [ ] Install prompt
- [ ] Offline indikátor

---

## Pořadí implementace

### Sprint 1: Základ (Fáze 1)
1. Konzistence všech stránek
2. Skeleton loading komponenty
3. Animace a design tokeny

### Sprint 2: Mobile (Fáze 2)
1. Touch-friendly formuláře
2. Vylepšený hamburger
3. Swipe gestures
4. Mobile builder

### Sprint 3: Core Features (Fáze 3-4)
1. Onboarding wizard
2. Notifikační centrum

### Sprint 4: Kalendář & Navigation (Fáze 5-6)
1. Kalendář deadlines
2. Breadcrumbs

### Sprint 5: Polish (Fáze 7-9)
1. Dark mode toggle
2. Email upomínky
3. Rychlé faktury

### Sprint 6: Advanced (Fáze 10-11)
1. Sdílení smluv
2. Technická vylepšení
3. PWA

---

## Měření úspěchu

- [ ] Všechny stránky používají AppLayout
- [ ] Konzistentní header styling (text-2xl)
- [ ] Stagger animace na všech seznamech
- [ ] Skeleton loading na všech async stránkách
- [ ] Touch targets min 44px na mobilu
- [ ] Onboarding completion rate > 80%
- [ ] Snížení support dotazů o nastavení

---

*Dokument vytvořen: {{DATE}}*
*Poslední aktualizace: {{DATE}}*
