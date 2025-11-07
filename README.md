# Právní LEGO 📄⚖️

**Tvoř smlouvy bez právníka** - Sestavte si právní smlouvu jako stavebnici LEGO.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)

## 🎯 O Projektu

Právní LEGO je moderní webová aplikace, která umožňuje podnikatelům, freelancerům a drobným živnostníkům vytvářet profesionální právní smlouvy bez nutnosti angažovat právníka. Aplikace používá koncept "stavebnice" - uživatel si vytváří smlouvu přidáváním bloků (LEGO kostek), které reprezentují jednotlivé části smlouvy.

## ✨ Hlavní Funkce

### 📋 Builder Smluv
- **Drag & Drop interface** - Intuitivní přetahování bloků
- **4 typy smluv**: Smlouva o dílo, Nájemní smlouva, Obchodní podmínky, Vlastní smlouva
- **30+ bloků** různých kategorií (povinné, volitelné)
- **Automatické ukládání** konceptů do localStorage

### 🔍 Ověření IČO a Kontrola Spolehlivosti
- **ARES integrace** - automatické načtení firemních údajů
- **Kontrola insolvencí** - dotaz do insolvenčního rejstříku (ISIR)
- **Nespolehlivý plátce DPH** - kontrola přes API Ministerstva financí
- **DIČ a bankovní účty** - automatická extrakce z ARES dat
- **Seznam jednatelů** - zobrazení statutárních orgánů

### 📊 Analýza Smlouvy
- **Automatická detekce chybějících bloků** s doporučeními
- **Skóre kompletnosti** v procentech
- **3 úrovně důležitosti**: Povinné, Doporučené, Volitelné
- **Specifická varování** (např. přiměřenost smluvních pokut)

### 📅 Správa Životního Cyklu Smlouvy
- **Časová osa** s automatickou detekcí termínů
- **Sledování deadlinů**: platby, dodání, pronájem, záruka
- **Barevné upozornění**: červená (po termínu), žlutá (blíží se), zelená (v pořádku)
- **Dashboard s přehledem** všech aktivních smluv

### 📄 Generátor Předávacích Protokolů
- **1-click generování** protokolu o předání díla
- **Automatické vyplnění** z dat smlouvy
- **Stav díla**: S výhradami / Bez výhrad
- **Export do DOCX** s profesionální šablonou
- **Historie protokolů** u každé smlouvy

### 💸 Palubní Deska Peněz (Cash-Flow)
- **Sledování příjmů** (faktury vystavené)
- **Sledování výdajů** (faktury přijaté)
- **Očekávaný zůstatek** - okamžitý přehled
- **Přehled měsíce** s detailním rozpisem
- **Upozornění na faktury po splatnosti**

### 📤 Export
- **DOCX** - plně formátovaný dokument
- **Kopírování textu** do schránky
- **Připraveno pro tisk**

## 🛠️ Technologie

- **Framework**: [Next.js 16.0](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19.2](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **State Management**: React Context API
- **Document Generation**: [docx](https://www.npmjs.com/package/docx)
- **Storage**: localStorage (client-side)

## 🚀 Instalace a Spuštění

### Prerekvizity
- Node.js 18+
- npm nebo pnpm

### Instalace

```bash
# Klonování repozitáře
git clone https://github.com/your-username/pravni-lego.git
cd pravni-lego

# Instalace závislostí
npm install --legacy-peer-deps

# Spuštění vývojového serveru
npm run dev
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000)

### Build pro produkci

```bash
npm run build
npm start
```

## 📁 Struktura Projektu

```
právní-lego/
├── app/                      # Next.js App Router stránky
│   ├── api/                  # API routes
│   │   └── verify-ico/       # ARES ověření IČO
│   ├── builder/              # Stavebnice smluv
│   ├── cash-flow/            # Cash-flow management
│   ├── contract/[id]/        # Detail smlouvy
│   ├── drafts/               # Koncepty
│   └── review/               # Kontrola smlouvy
├── components/               # React komponenty
│   ├── ui/                   # shadcn/ui komponenty
│   ├── block-library.tsx     # Knihovna bloků
│   ├── contract-review.tsx   # Kontrola smlouvy
│   ├── contract-timeline.tsx # Časová osa
│   ├── handover-protocol-generator.tsx
│   └── ...
├── lib/                      # Utility funkce
│   ├── contract-analysis.ts  # Analýza smluv
│   ├── contract-timeline.ts  # Správa termínů
│   ├── contract-storage.ts   # Persistance smluv
│   ├── cash-flow.ts          # Cash-flow logika
│   └── handover-protocol.ts  # Předávací protokoly
├── contexts/                 # React Context
│   └── contract-context.tsx  # Globální stav smlouvy
├── types/                    # TypeScript typy
└── public/                   # Statické soubory
```

## 🎨 Použití

### 1. Vytvoření nové smlouvy

1. Klikněte na **"Nová smlouva"** na hlavní stránce
2. Vyberte typ smlouvy (Dílo, Nájem, Obchod, Vlastní)
3. Přetáhněte bloky z knihovny do pracovní plochy
4. Vyplňte údaje v jednotlivých blocích
5. Použijte IČO ověření pro automatické načtení dat

### 2. Kontrola a uzavření

1. Klikněte **"Kontrola smlouvy"**
2. Zkontrolujte analýzu chybějících bloků
3. Prohlédněte si časovou osu termínů
4. Exportujte do DOCX nebo zkopírujte text
5. Klikněte **"Uzavřít a uložit smlouvu"**

### 3. Generování předávacího protokolu

1. V detailu smlouvy o dílo najdete **"Předávací protokol"**
2. Klikněte **"Vygenerovat"**
3. Vyberte datum a stav díla (S/Bez výhrad)
4. Protokol se automaticky stáhne jako DOCX

### 4. Sledování cash-flow

1. Klikněte **"Peníze"** na hlavní stránce
2. Přidejte faktury (příjmy a výdaje)
3. Sledujte očekávaný zůstatek
4. Označujte faktury jako zaplacené

## 🔐 Bezpečnost a Soukromí

- ✅ **Žádná registrace** - aplikace neukládá data na server
- ✅ **100% client-side** - všechna data zůstávají v prohlížeči
- ✅ **localStorage** - data jsou uložena lokálně na vašem zařízení
- ✅ **Žádné cookies** pro tracking
- ⚠️ **Záloha dat** - doporučujeme pravidelně exportovat smlouvy

## 🌐 Použité API

- **ARES** - `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}`
- **Insolvenční rejstřík (ISIR)** - `https://isir.justice.cz/isir/common/search.do`
- **Nespolehlivý plátce DPH** - `https://adisrws.mfcr.cz/dpr/api/v1/nespolehlivy-platce/{ico}`

## 📝 Roadmap

- [ ] Email notifikace před termíny
- [ ] Integrace s BankID Sign pro elektronický podpis
- [ ] Mobilní aplikace
- [ ] AI asistent pro generování klauzulí
- [ ] Export do PDF
- [ ] Grafy a statistiky cash-flow
- [ ] Cloudová synchronizace (volitelná)

## 🤝 Přispívání

Příspěvky jsou vítány! Prosím:

1. Forkněte repozitář
2. Vytvořte novou větev (`git checkout -b feature/amazing-feature`)
3. Commitněte změny (`git commit -m 'Add amazing feature'`)
4. Pushněte do větve (`git push origin feature/amazing-feature`)
5. Otevřete Pull Request

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz soubor [LICENSE](LICENSE) pro detaily.

## 👨‍💻 Autor

Vytvořeno s ❤️ pro snadnější právní život

---

**Poznámka**: Tato aplikace slouží jako pomocný nástroj. Pro složitější právní záležitosti doporučujeme konzultaci s právníkem.
