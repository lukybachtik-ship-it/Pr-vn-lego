"use client"

import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import {
  FileStack,
  UsersRound,
  Landmark,
  Timer,
  Download,
  LifeBuoy,
  BookOpen,
  CircleCheck,
  Bolt,
  PieChart,
  Banknote,
  QrCode,
  BarChart4,
  CalendarRange,
  BellRing,
  Link2,
  LayoutDashboard,
  TriangleAlert,
} from "lucide-react"

export default function HelpPage() {
  const handleDownloadGuide = () => {
    const guideContent = `
BUSINESSHUB - KOMPLETNÍ UŽIVATELSKÁ PŘÍRUČKA
=============================================

## 1. ÚVOD
BusinessHub je komplexní aplikace pro živnostníky a malé podnikatele, která pomáhá s:
- Správou klientů a jejich kontaktních údajů
- Evidencí příjmů a výdajů
- Rychlým vystavováním zakázek
- Kalkulací zisku a daní
- Sledováním odpracovaného času
- Tvorbou právních dokumentů a smluv

## 2. DASHBOARD
Hlavní přehledová stránka zobrazující:
- Měsíční statistiky (příjmy, výdaje, zisk)
- Nezaplacené faktury
- Nadcházející splatnosti
- Rychlé akce

## 3. MOJE KONCEPTY
Správa právních dokumentů a smluv:
- Tvorba smluv pomocí bloků
- Šablony pro různé typy smluv
- Export do PDF a DOCX
- Změnové listy a dodatky

## 4. KLIENTI
Evidence a správa klientů:
- Kontaktní údaje (jméno, IČO, DIČ, adresa)
- Výchozí hodinová sazba
- Typ fakturace (hodinová, paušální)
- Přehled smluv a faktur pro klienta

## 5. PENÍZE (CASH FLOW)
Kompletní správa financí:
- Evidence příjmů a výdajů
- Měsíční přehled s filtrováním
- Varování nezaplacených faktur
- QR kódy pro snadnou platbu
- Položkové faktury (služby, materiál, cestovné)
- Připomenutí splatnosti
- Měsíční přehled grafů
- Daňový kalendář

## 6. RYCHLÉ ZAKÁZKY
Zjednodušené vystavování zakázek:
1. Klikněte "Nová zakázka"
2. Vyberte klienta nebo zadejte nového
3. Zadejte popis zakázky
4. Nastavte cenu
5. Vygenerujte fakturu s QR kódem

Stavy zakázek:
- Nová - čeká na zpracování
- Fakturovaná - vystavena faktura
- Dokončená - zaplaceno

## 7. KALKULAČKA ZISKU
Výpočet čistého zisku po odečtení daní a odvodů:
- Příjmy z fakturace
- Výdaje na materiál a služby
- Paušální výdaje (60%)
- Sociální pojištění
- Zdravotní pojištění
- Daň z příjmu (15%)

Výstup:
- Čistý měsíční příjem
- Odhadovaný roční příjem
- Upozornění na DPH limit

## 8. TIME TRACKING
Sledování odpracovaného času:
- Výběr klienta z postranního panelu
- Automatické vyplnění hodinové sazby
- Časomíra pro přesné měření
- Ruční zadání času
- Fakturace nevyfakturovaných hodin
- Historie odpracovaného času

## 9. NASTAVENÍ

### Bankovní účty
- Více bankovních účtů
- Výchozí účet pro QR platby
- Podporované měny: CZK, EUR, USD

### Nastavení profilu
- Firemní údaje (IČO, DIČ)
- Adresa firmy
- Logo firmy pro dokumenty

### Daňové nastavení
- Plátce DPH ano/ne
- Paušální výdaje
- Zdravotní a sociální pojištění

## 10. UŽITEČNÉ ODKAZY
V postranním panelu najdete odkazy na:
- Finanční úřady ČR
- Živnostenské úřady
- Test finančního zdraví

## 11. TIPY A TRIKY

### Workflow pro nového klienta
1. Vytvořte klienta v sekci Klienti
2. Nastavte výchozí hodinovou sazbu
3. Vytvořte smlouvu nebo zakázku
4. Sledujte čas v Time Trackingu
5. Vyfakturujte odpracované hodiny

### QR platby
- Každá faktura obsahuje QR kód
- Klient naskenuje mobilním bankovnictvím
- Automaticky se vyplní platební údaje

### Synchronizace dat
- Data jsou automaticky synchronizována s cloudem
- Funguje i offline s lokálním úložištěm
- Při přihlášení se data načtou ze serveru

## 12. KLÁVESOVÉ ZKRATKY
- Sidebar: Kliknutím na logo přejdete na Dashboard

---
BusinessHub v3.0
Vytvořeno pro živnostníky v České republice
Datum: ${new Date().toLocaleDateString("cs-CZ")}
`

    const blob = new Blob([guideContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "businesshub-prirucka.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      badge: null,
      description: "Hlavní přehled vašeho podnikání - měsíční statistiky, nezaplacené faktury a rychlé akce.",
      steps: ["Zobrazí měsíční příjmy, výdaje a zisk", "Upozorní na nezaplacené faktury", "Rychlý přístup k důležitým funkcím"],
    },
    {
      icon: FileStack,
      title: "Moje koncepty",
      badge: null,
      description: "Tvorba právních dokumentů a smluv pomocí modulárních bloků.",
      steps: ["Vyberte typ smlouvy", "Vyplňte údaje smluvních stran", "Přidejte bloky obsahu", "Exportujte jako PDF nebo DOCX"],
    },
    {
      icon: UsersRound,
      title: "Klienti",
      badge: null,
      description: "Evidence klientů s kontaktními údaji, hodinovými sazbami a přehledem faktur.",
      steps: ["Přidejte klienta ručně nebo ze smlouvy", "Nastavte IČO, DIČ a adresu", "Určete výchozí hodinovou sazbu", "Sledujte smlouvy a faktury klienta"],
    },
    {
      icon: Landmark,
      title: "Peníze",
      badge: null,
      description: "Kompletní správa příjmů a výdajů s QR platbami a měsíčními přehledy.",
      steps: ["Přidávejte příjmové a výdajové faktury", "Generujte QR kódy pro platby", "Sledujte měsíční cash flow", "Nastavte připomenutí splatnosti"],
    },
    {
      icon: Bolt,
      title: "Rychlé zakázky",
      badge: "Nové",
      description: "Zjednodušené vystavování zakázek pro rychlé objednávky a malé práce.",
      steps: ["Klikněte 'Nová zakázka'", "Vyberte nebo vytvořte klienta", "Zadejte popis a cenu", "Vygenerujte fakturu s QR kódem"],
    },
    {
      icon: PieChart,
      title: "Kalkulačka zisku",
      badge: "Nové",
      description: "Výpočet čistého příjmu po odečtení daní, sociálního a zdravotního pojištění.",
      steps: ["Zadejte hrubé příjmy", "Zadejte výdaje", "Zobrazte odvody a daně", "Zjistěte čistý měsíční příjem"],
    },
    {
      icon: Timer,
      title: "Time Tracking",
      badge: null,
      description: "Sledování odpracovaného času s automatickou fakturací.",
      steps: ["Vyberte klienta v postranním panelu", "Spusťte časomíru", "Zastavte po dokončení práce", "Vyfakturujte nevyfakturované hodiny"],
    },
    {
      icon: Banknote,
      title: "Bankovní účty",
      badge: null,
      description: "Správa více bankovních účtů pro QR platby na fakturách.",
      steps: ["Přidejte bankovní účty", "Nastavte výchozí účet", "Účet se automaticky použije pro QR kódy"],
    },
  ]

  const tips = [
    {
      title: "QR platby",
      description: "Každá faktura obsahuje QR kód, který klient naskenuje mobilním bankovnictvím pro okamžitou platbu.",
      icon: QrCode,
    },
    {
      title: "Měsíční přehled",
      description: "V sekci Peníze najdete tlačítko 'Měsíční přehled' s grafy příjmů a výdajů za celý rok.",
      icon: BarChart4,
    },
    {
      title: "Daňový kalendář",
      description: "Tlačítko 'Daňový kalendář' zobrazuje důležité termíny pro podání daňových přiznání a platby odvodů.",
      icon: CalendarRange,
    },
    {
      title: "Připomenutí",
      description: "U nezaplacených faktur můžete nastavit připomenutí, které vás upozorní na blížící se splatnost.",
      icon: BellRing,
    },
    {
      title: "Synchronizace",
      description: "Data se automaticky ukládají lokálně i do cloudu. Funguje i offline.",
      icon: CircleCheck,
    },
    {
      title: "Užitečné odkazy",
      description: "V postranním panelu najdete odkazy na finanční úřady, živnostenské úřady a test finančního zdraví.",
      icon: Link2,
    },
  ]

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <LifeBuoy className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Nápověda
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kompletní průvodce aplikací BusinessHub
              </p>
            </div>
            <Button onClick={handleDownloadGuide} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              Stáhnout příručku
            </Button>
          </div>
        </header>

        {/* Quick Start */}
        <section className="mb-6 p-4 bg-card border border-primary/20 rounded-md">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rychlý start</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Začněte používat BusinessHub za 5 minut</p>

          <ol className="space-y-2">
            {[
              { num: 1, text: "Nastavte profil: V menu Nastavení → Nastavení profilu vyplňte IČO, DIČ a adresu firmy" },
              { num: 2, text: "Přidejte bankovní účet: V menu Nastavení → Bankovní účty zadejte číslo účtu pro QR platby" },
              { num: 3, text: "Vytvořte klienty: V sekci Klienti přidejte své zákazníky s kontaktními údaji" },
              { num: 4, text: "Vystavte první fakturu: V sekci Peníze nebo Rychlé zakázky vytvořte fakturu" },
              { num: 5, text: "Sledujte finance: Dashboard vám zobrazí přehled příjmů, výdajů a nezaplacených faktur" },
            ].map((step) => (
              <li key={step.num} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5">
                  {step.num}
                </div>
                <p className="text-sm">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Funkce aplikace</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="p-4 bg-card border border-border rounded-md stagger-item interactive-card">
                <div className="flex items-center gap-2 mb-2">
                  <feature.icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  <span className="text-sm font-medium">{feature.title}</span>
                  {feature.badge && (
                    <Badge variant="success" className="ml-1">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{feature.description}</p>
                <div className="space-y-1.5">
                  {feature.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-1.5 text-xs">
                      <CircleCheck className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tipy a triky</h2>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-md stagger-item">
                <tip.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DPH Warning */}
        <section className="mb-6">
          <div className="p-4 bg-warning/5 border border-warning/20 rounded-md">
            <div className="flex items-start gap-2.5">
              <TriangleAlert className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium text-foreground">Sledování limitu pro DPH</p>
                <p className="text-xs text-muted-foreground mt-1">
                  BusinessHub automaticky sleduje vaše příjmy a upozorní vás, když se blížíte k limitu{" "}
                  <strong className="text-foreground">2 000 000 Kč</strong> pro povinnou registraci k DPH. Tento ukazatel najdete v sekci Peníze.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Version Info */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>BusinessHub verze 3.0 | Vytvořeno pro živnostníky v České republice</p>
          <p className="mt-1">© 2025 BusinessHub</p>
        </div>
      </div>
    </AppLayout>
  )
}
