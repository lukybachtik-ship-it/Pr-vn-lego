"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import {
  FileText,
  Users,
  DollarSign,
  Clock,
  Settings,
  Download,
  HelpCircle,
  BookOpen,
  CheckCircle,
} from "lucide-react"

export default function HelpPage() {
  const handleDownloadGuide = () => {
    // Create a simple text guide
    const guideContent = `
PRÁVNÍ LEGO - UŽIVATELSKÁ PŘÍRUČKA
=====================================

## 1. ÚVOD
Právní LEGO je aplikace pro správu právních dokumentů, klientů, faktur a časové evidence práce.

## 2. PŘEHLED FUNKCÍ

### 2.1 Dashboard
- Přehled všech smluv
- Rychlé akce pro vytvoření nové smlouvy nebo faktury
- Vyhledávání a filtrování smluv

### 2.2 Tvorba smluv
1. Klikněte na "Nová smlouva"
2. Vyberte typ smlouvy
3. Vyplňte údaje smluvních stran
4. Přidejte bloky obsahu podle potřeby
5. Exportujte jako PDF nebo DOCX

### 2.3 Správa klientů
- Automatické vytváření klientů ze smluv
- Ruční přidání klientů
- Nastavení výchozí hodinové sazby pro klienta
- Typ fakturace: hodinový nebo paušál
- Přehled smluv a faktur klienta

### 2.4 Fakturace
**Jednoduché faktury:**
- Klikněte na "Nová faktura"
- Vyber příjem nebo výdaj
- Zadejte částku a splatnost

**Položkové faktury:**
- Zaškrtněte "Použít položkovou fakturu"
- Přidejte položky:
  * Služby (hodiny práce)
  * Materiál (kusy, metry)
  * Cestovné (kilometry)
- Automatický výpočet celkové částky

**QR platby:**
- Každá faktura obsahuje QR kód pro okamžitou platbu
- Možnost tisku nebo stažení

### 2.5 Time Tracking
**Časomíra:**
1. Vyberte klienta z postranního panelu
2. Zadejte popis práce
3. Spusťte časomíru
4. Po dokončení zastavte

**Ruční záznamy:**
- Klikněte "Přidat čas ručně"
- Zadejte hodiny a minuty
- Hodinová sazba se automaticky vyplní z klienta

**Fakturace času:**
- Nevyfakturované hodiny se zobrazí v přehledu
- Klikněte "Vystavit fakturu"
- Faktura se vytvoří s detailním popisem

### 2.6 Změnové listy
- Správa dodatků ke smlouvám
- Sledování navýšení ceny
- Prodloužení termínů
- Export jako DOCX

### 2.7 Nastavení profilu
- Změna hesla
- Firemní údaje (IČO, DIČ, adresa)
- Nahrání loga firmy
- Logo se zobrazí na fakturách a smlouvách

## 3. TIPY A TRIKY

### Rychlé akce
- CTRL+K: Vyhledávání
- Kliknutím na klienta v Time Trackingu se automaticky vyplní sazba

### Doporučené workflow
1. Vytvořte klienta s výchozí sazbou
2. Vytvořte smlouvu pro klienta
3. Sledujte čas v Time Trackingu
4. Vyfakturujte odpracované hodiny
5. Exportujte fakturu s QR kódem

### Export dokumentů
- PDF: Pro sdílení a archivaci
- DOCX: Pro další úpravy v Wordu

## 4. PODPORA
Pro další pomoc kontaktujte podporu nebo navštivte dokumentaci online.

Verze: 2.0
Datum: ${new Date().toLocaleDateString("cs-CZ")}
`

    const blob = new Blob([guideContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "pravni-lego-prirucka.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const features = [
    {
      icon: FileText,
      title: "Tvorba smluv",
      description: "Vytvářejte právní dokumenty pomocí bloků. Vyberte typ smlouvy a postupně přidávejte bloky obsahu.",
      steps: ["Klikněte na 'Nová smlouva'", "Vyberte typ smlouvy", "Vyplňte údaje stran", "Přidejte bloky obsahu", "Exportujte jako PDF/DOCX"],
    },
    {
      icon: Users,
      title: "Správa klientů",
      description: "Spravujte své klienty, nastavte výchozí hodinové sazby a typ fakturace.",
      steps: ["Přidejte klienta ručně nebo ze smlouvy", "Nastavte výchozí hodinovou sazbu", "Vyberte typ fakturace", "Sledujte smlouvy a faktury klienta"],
    },
    {
      icon: DollarSign,
      title: "Fakturace",
      description: "Vytvářejte jednoduché i položkové faktury s QR kódy pro okamžitou platbu.",
      steps: ["Vytvořte novou fakturu", "Použijte položkovou fakturu pro detaily", "Přidejte služby, materiál, cestovné", "Vygenerujte QR kód", "Vytiskněte nebo stáhněte"],
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Sledujte odpracovaný čas a automaticky generujte faktury.",
      steps: ["Vyberte klienta z postranního panelu", "Spusťte časomíru", "Zastavte po dokončení", "Vyfakturujte nevyfakturované hodiny"],
    },
    {
      icon: Settings,
      title: "Nastavení profilu",
      description: "Spravujte své firemní údaje a nahrajte logo pro dokumenty.",
      steps: ["Otevřete nastavení profilu", "Vyplňte firemní údaje", "Nahrajte logo firmy", "Uložte změny"],
    },
  ]

  return (
    <>
      <AppHeader title="Nápověda" />
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <HelpCircle className="w-10 h-10 text-primary" />
                Nápověda a dokumentace
              </h1>
              <p className="text-muted-foreground">Vše, co potřebujete vědět o použití aplikace Právní LEGO</p>
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
              <CardDescription>První kroky s aplikací</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>Nastavte profil:</strong> Vyplňte firemní údaje a nahrajte logo v Nastavení profilu
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>Přidejte klienty:</strong> Vytvořte klienty a nastavte jejich výchozí hodinové sazby
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>Vytvořte první smlouvu:</strong> Použijte builder smluv pro vytvoření právního dokumentu
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>Sledujte čas:</strong> Používejte Time Tracking pro evidenci práce
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <strong>Fakturujte:</strong> Generujte faktury s QR kódy pro snadnou platbu
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="w-5 h-5" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tipy a triky</CardTitle>
              <CardDescription>Vylepšete svou produktivitu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <strong>Postranní panel klientů:</strong> V Time Trackingu klikněte na klienta v postranním panelu
                  pro automatické vyplnění hodinové sazby
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <strong>Položková fakturace:</strong> Použijte pro detailní faktury se službami, materiálem a
                  cestovným
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <strong>Změnové listy:</strong> Spravujte dodatky ke smlouvám přímo v detailu smlouvy
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <strong>Export dokumentů:</strong> PDF pro sdílení, DOCX pro další úpravy v Wordu
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
