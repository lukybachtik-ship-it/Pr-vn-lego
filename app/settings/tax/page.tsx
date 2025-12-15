"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AppLayout } from "@/components/app-layout"
import { Calculator, Receipt, Percent, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import {
  getUserSettings,
  updateUserSettings,
  getTaxSettings,
  type TaxSettings,
  type ExpenseType,
  type PausalniSazba,
  type VatStatus,
  DEFAULT_TAX_SETTINGS,
} from "@/lib/user-settings"

export default function TaxSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form state
  const [expenseType, setExpenseType] = useState<ExpenseType>("pausalni")
  const [pausalniSazba, setPausalniSazba] = useState<PausalniSazba>(60)
  const [vatStatus, setVatStatus] = useState<VatStatus>("none")
  const [minHourlyRate, setMinHourlyRate] = useState(190)

  useEffect(() => {
    const settings = getTaxSettings()
    setExpenseType(settings.expenseType)
    setPausalniSazba(settings.pausalniSazba)
    setVatStatus(settings.vatStatus)
    setMinHourlyRate(settings.minHourlyRate)
    setIsLoading(false)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)

    const taxSettings: TaxSettings = {
      expenseType,
      pausalniSazba,
      vatStatus,
      minHourlyRate,
    }

    updateUserSettings({ taxSettings })

    // Simulate async save for UX
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)

    // Auto-hide success message
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading) {
    return (
      <AppLayout title="Daňové nastavení" showBack>
        <main className="p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Daňové nastavení" showBack>
      <main className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Daňové nastavení</h1>
            <p className="text-muted-foreground">
              Nastavte své daňové parametry pro výpočet čistého zisku z zakázek
            </p>
          </div>

          {/* Expense Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Uplatňování výdajů
              </CardTitle>
              <CardDescription>
                Jak uplatňujete výdaje ve svém daňovém přiznání?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={expenseType}
                onValueChange={(value) => setExpenseType(value as ExpenseType)}
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="pausalni" id="pausalni" />
                  <Label htmlFor="pausalni" className="flex-1 cursor-pointer">
                    <div className="font-medium">Paušální výdaje</div>
                    <div className="text-sm text-muted-foreground">
                      Procento z příjmů bez nutnosti dokladovat skutečné výdaje
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="skutecne" id="skutecne" />
                  <Label htmlFor="skutecne" className="flex-1 cursor-pointer">
                    <div className="font-medium">Skutečné výdaje</div>
                    <div className="text-sm text-muted-foreground">
                      Dokladované výdaje na základě účetnictví
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Paušální sazba - jen pokud je vybrán paušál */}
              {expenseType === "pausalni" && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                  <Label className="text-sm font-medium">Výše paušálu:</Label>
                  <RadioGroup
                    value={String(pausalniSazba)}
                    onValueChange={(value) => setPausalniSazba(Number(value) as PausalniSazba)}
                    className="flex flex-wrap gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="80" id="p80" />
                      <Label htmlFor="p80" className="cursor-pointer">
                        <span className="font-bold">80%</span>
                        <span className="text-xs text-muted-foreground ml-1">(řemesla)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="60" id="p60" />
                      <Label htmlFor="p60" className="cursor-pointer">
                        <span className="font-bold">60%</span>
                        <span className="text-xs text-muted-foreground ml-1">(živnosti)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="40" id="p40" />
                      <Label htmlFor="p40" className="cursor-pointer">
                        <span className="font-bold">40%</span>
                        <span className="text-xs text-muted-foreground ml-1">(svobodná pov.)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    Paušální výdaje snižují váš daňový základ. Např. při 60% paušálu z příjmu 100 000 Kč
                    je daňový základ pouze 40 000 Kč.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* VAT Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                DPH (plátce)
              </CardTitle>
              <CardDescription>
                Jste plátcem DPH? Pokud ano, jaká je vaše sazba?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={vatStatus}
                onValueChange={(value) => setVatStatus(value as VatStatus)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="none" id="vat-none" />
                  <Label htmlFor="vat-none" className="flex-1 cursor-pointer">
                    <div className="font-medium">Nejsem plátce DPH</div>
                    <div className="text-sm text-muted-foreground">
                      Obrat pod 2 000 000 Kč ročně
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="15" id="vat-15" />
                  <Label htmlFor="vat-15" className="flex-1 cursor-pointer">
                    <div className="font-medium">Snížená sazba 15%</div>
                    <div className="text-sm text-muted-foreground">
                      Stavební práce, ubytování, stravování...
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="21" id="vat-21" />
                  <Label htmlFor="vat-21" className="flex-1 cursor-pointer">
                    <div className="font-medium">Základní sazba 21%</div>
                    <div className="text-sm text-muted-foreground">
                      Většina služeb a zboží
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Minimum Hourly Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Minimální hodinová sazba
              </CardTitle>
              <CardDescription>
                Kalkulačka vás upozorní, pokud je čistý zisk na hodinu pod touto hranicí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  value={minHourlyRate}
                  onChange={(e) => setMinHourlyRate(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-muted-foreground">Kč/hodina</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Doporučená minimální sazba je 190 Kč/h (odpovídá přibližně minimální mzdě včetně odvodů).
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Nastavení uloženo</span>
              </div>
            )}
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ukládám...
                </>
              ) : (
                "Uložit nastavení"
              )}
            </Button>
          </div>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Proč je toto nastavení důležité?</p>
                  <p>
                    Kalkulačka čistého zisku používá tyto údaje pro přesný výpočet odvodů státu
                    (sociální a zdravotní pojištění, daň z příjmů). Bez správného nastavení
                    by výpočty nebyly přesné.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  )
}
