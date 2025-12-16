"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Users,
  Wallet,
  Clock,
  Settings,
  Download,
  HelpCircle,
  BookOpen,
  CheckCircle,
  Zap,
  Calculator,
  CreditCard,
  QrCode,
  BarChart3,
  CalendarDays,
  Bell,
  ExternalLink,
  Home,
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
      icon: Home,
      title: "Dashboard",
      badge: null,
      description: "Hlavní přehled vašeho podnikání - měsíční statistiky, nezaplacené faktury a rychlé akce.",
      steps: ["Zobrazí měsíční příjmy, výdaje a zisk", "Upozorní na nezaplacené faktury", "Rychlý přístup k důležitým funkcím"],
    },
    {
      icon: FileText,
      title: "Moje koncepty",
      badge: null,
      description: "Tvorba právních dokumentů a smluv pomocí modulárních bloků.",
      steps: ["Vyberte typ smlouvy", "Vyplňte údaje smluvních stran", "Přidejte bloky obsahu", "Exportujte jako PDF nebo DOCX"],
    },
    {
      icon: Users,
      title: "Klienti",
      badge: null,
      description: "Evidence klientů s kontaktními údaji, hodinovými sazbami a přehledem faktur.",
      steps: ["Přidejte klienta ručně nebo ze smlouvy", "Nastavte IČO, DIČ a adresu", "Určete výchozí hodinovou sazbu", "Sledujte smlouvy a faktury klienta"],
    },
    {
      icon: Wallet,
      title: "Peníze",
      badge: null,
      description: "Kompletní správa příjmů a výdajů s QR platbami a měsíčními přehledy.",
      steps: ["Přidávejte příjmové a výdajové faktury", "Generujte QR kódy pro platby", "Sledujte měsíční cash flow", "Nastavte připomenutí splatnosti"],
    },
    {
      icon: Zap,
      title: "Rychlé zakázky",
      badge: "Nové",
      description: "Zjednodušené vystavování zakázek pro rychlé objednávky a malé práce.",
      steps: ["Klikněte 'Nová zakázka'", "Vyberte nebo vytvořte klienta", "Zadejte popis a cenu", "Vygenerujte fakturu s QR kódem"],
    },
    {
      icon: Calculator,
      title: "Kalkulačka zisku",
      badge: "Nové",
      description: "Výpočet čistého příjmu po odečtení daní, sociálního a zdravotního pojištění.",
      steps: ["Zadejte hrubé příjmy", "Zadejte výdaje", "Zobrazte odvody a daně", "Zjistěte čistý měsíční příjem"],
    },
    {
      icon: Clock,
      title: "Time Tracking",
      badge: null,
      description: "Sledování odpracovaného času s automatickou fakturací.",
      steps: ["Vyberte klienta v postranním panelu", "Spusťte časomíru", "Zastavte po dokončení práce", "Vyfakturujte nevyfakturované hodiny"],
    },
    {
      icon: CreditCard,
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
      icon: BarChart3,
    },
    {
      title: "Daňový kalendář",
      description: "Tlačítko 'Daňový kalendář' zobrazuje důležité termíny pro podání daňových přiznání a platby odvodů.",
      icon: CalendarDays,
    },
    {
      title: "Připomenutí",
      description: "U nezaplacených faktur můžete nastavit připomenutí, které vás upozorní na blížící se splatnost.",
      icon: Bell,
    },
    {
      title: "Synchronizace",
      description: "Data se automaticky ukládají lokálně i do cloudu. Funguje i offline.",
      icon: CheckCircle,
    },
    {
      title: "Užitečné odkazy",
      description: "V postranním panelu najdete odkazy na finanční úřady, živnostenské úřady a test finančního zdraví.",
      icon: ExternalLink,
    },
  ]

  return (
    <AppLayout title="Nápověda" showBack>
      <main className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <HelpCircle className="w-10 h-10 text-primary" />
                Nápověda a dokumentace
              </h1>
              <p className="text-muted-foreground">
                Kompletní průvodce aplikací BusinessHub pro živnostníky
              </p>
            </div>
            <Button onClick={handleDownloadGuide} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Stáhnout příručku
            </Button>
          </div>

          {/* Quick Start */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Rychlý start
              </CardTitle>
              <CardDescription>Začněte používat BusinessHub za 5 minut</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <strong>Nastavte profil:</strong> V menu Nastavení → Nastavení profilu vyplňte IČO, DIČ a adresu firmy
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <strong>Přidejte bankovní účet:</strong> V menu Nastavení → Bankovní účty zadejte číslo účtu pro QR platby
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <strong>Vytvořte klienty:</strong> V sekci Klienti přidejte své zákazníky s kontaktními údaji
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <strong>Vystavte první fakturu:</strong> V sekci Peníze nebo Rychlé zakázky vytvořte fakturu
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <strong>Sledujte finance:</strong> Dashboard vám zobrazí přehled příjmů, výdajů a nezaplacených faktur
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Funkce aplikace</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5" />
                      {feature.title}
                      {feature.badge && (
                        <Badge variant="secondary" className="ml-2">
                          {feature.badge}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tipy a triky</CardTitle>
              <CardDescription>Vylepšete svou produktivitu s BusinessHub</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <tip.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-sm">{tip.title}</strong>
                      <p className="text-sm text-muted-foreground mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* DPH Warning */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Calculator className="w-5 h-5" />
                Sledování limitu pro DPH
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-700">
              <p>
                BusinessHub automaticky sleduje vaše příjmy a upozorní vás, když se blížíte k limitu{" "}
                <strong>2 000 000 Kč</strong> pro povinnou registraci k DPH. Tento ukazatel najdete v sekci Peníze.
              </p>
            </CardContent>
          </Card>

          {/* Version Info */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>BusinessHub verze 3.0 | Vytvořeno pro živnostníky v České republice</p>
            <p className="mt-1">© 2025 BusinessHub</p>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
