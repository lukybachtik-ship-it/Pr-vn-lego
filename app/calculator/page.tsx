"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppLayout } from "@/components/app-layout"
import {
  Calculator,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  History,
  TrendingUp,
  Loader2,
  Clock,
  Banknote,
  Building2,
  Heart,
  Receipt,
} from "lucide-react"
import {
  calculateProfit,
  formatCurrency,
  saveCalculation,
  getCalculations,
  deleteCalculation,
  createCostItem,
  DEFAULT_COST_ITEMS,
  type CalculatorInput,
  type CalculatorResult,
  type CostItem,
  type SavedCalculation,
} from "@/lib/profit-calculator"
import { hasTaxSettingsConfigured, getTaxSettings } from "@/lib/user-settings"

export default function CalculatorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasSettings, setHasSettings] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState("")
  const [grossRevenue, setGrossRevenue] = useState(0)
  const [costs, setCosts] = useState<CostItem[]>([])
  const [hours, setHours] = useState(0)
  const [marginPercent, setMarginPercent] = useState(30)

  // History
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Load initial data
  useEffect(() => {
    setHasSettings(hasTaxSettingsConfigured())

    // Initialize default cost items
    setCosts(DEFAULT_COST_ITEMS.map((item) => createCostItem(item.name, item.amount)))

    // Load saved calculations
    setSavedCalculations(getCalculations())

    setIsLoading(false)
  }, [])

  // Calculate result whenever inputs change
  const result = useMemo<CalculatorResult | null>(() => {
    if (!hasSettings) return null

    const input: CalculatorInput = {
      projectName: projectName || "Bez názvu",
      grossRevenue,
      costs,
      hours,
      marginPercent,
    }

    return calculateProfit(input)
  }, [hasSettings, projectName, grossRevenue, costs, hours, marginPercent])

  // Cost item handlers
  const addCostItem = () => {
    setCosts([...costs, createCostItem()])
  }

  const updateCostItem = (id: string, field: "name" | "amount", value: string | number) => {
    setCosts(
      costs.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "amount" ? Number(value) : value }
          : item
      )
    )
  }

  const removeCostItem = (id: string) => {
    setCosts(costs.filter((item) => item.id !== id))
  }

  // Save calculation
  const handleSave = () => {
    if (!result) return

    const saved = saveCalculation(result)
    setSavedCalculations([saved, ...savedCalculations].slice(0, 50))
    setShowSaveDialog(false)
  }

  // Load from history
  const loadCalculation = (calc: SavedCalculation) => {
    const { input } = calc.result
    setProjectName(input.projectName)
    setGrossRevenue(input.grossRevenue)
    setCosts(input.costs)
    setHours(input.hours)
    setMarginPercent(input.marginPercent)
    setShowHistory(false)
  }

  // Delete from history
  const handleDelete = (id: string) => {
    deleteCalculation(id)
    setSavedCalculations(savedCalculations.filter((c) => c.id !== id))
  }

  if (isLoading) {
    return (
      <AppLayout title="Kalkulačka zisku" showBack>
        <main className="p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </AppLayout>
    )
  }

  // Show settings prompt if not configured
  if (!hasSettings) {
    return (
      <AppLayout title="Kalkulačka zisku" showBack>
        <main className="p-4">
          <div className="max-w-lg mx-auto py-20">
            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mx-auto mb-4">
                  <Settings className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle>Nejdříve nastavte daně</CardTitle>
                <CardDescription>
                  Pro přesný výpočet čistého zisku potřebujeme vědět, jak uplatňujete výdaje a jestli
                  jste plátce DPH.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => router.push("/settings/tax")} size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Přejít do nastavení
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </AppLayout>
    )
  }

  const taxSettings = getTaxSettings()

  return (
    <AppLayout title="Kalkulačka zisku" showBack>
      <main className="p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calculator className="w-8 h-8 text-primary" />
                Kalkulačka čistého zisku
              </h1>
              <p className="text-muted-foreground mt-1">
                Zjistěte, kolik vám skutečně zůstane ze zakázky
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                Historie
              </Button>
              <Button variant="outline" onClick={() => router.push("/settings/tax")}>
                <Settings className="w-4 h-4 mr-2" />
                Nastavení
              </Button>
            </div>
          </div>

          {/* Tax Settings Badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">
              {taxSettings.expenseType === "pausalni"
                ? `Paušál ${taxSettings.pausalniSazba}%`
                : "Skutečné výdaje"}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {taxSettings.vatStatus === "none"
                ? "Neplátce DPH"
                : `Plátce DPH ${taxSettings.vatStatus}%`}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Project Name */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Název zakázky</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Např. Web pro klienta XY"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Costs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Náklady
                  </CardTitle>
                  <CardDescription>Zadejte vaše náklady na zakázku</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {costs.map((cost) => (
                    <div key={cost.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Název položky"
                        value={cost.name}
                        onChange={(e) => updateCostItem(cost.id, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="0"
                        value={cost.amount || ""}
                        onChange={(e) => updateCostItem(cost.id, "amount", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground text-sm">Kč</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCostItem(cost.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCostItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Přidat položku
                  </Button>

                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-medium">Celkové náklady:</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(costs.reduce((sum, c) => sum + c.amount, 0))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Čas na zakázku
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      value={hours || ""}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">hodin</span>
                  </div>
                </CardContent>
              </Card>

              {/* Target Price - NEW */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Cílová cena
                  </CardTitle>
                  <CardDescription>
                    Zadejte požadovanou koncovou cenu nebo hodinovou sazbu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Koncová cena</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          value={grossRevenue || ""}
                          onChange={(e) => {
                            const price = Number(e.target.value)
                            setGrossRevenue(price)
                            // Vypočítat marži zpětně
                            const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)
                            if (totalCosts > 0) {
                              const newMargin = Math.round(((price / totalCosts) - 1) * 100)
                              if (newMargin >= 0 && newMargin <= 500) {
                                setMarginPercent(newMargin)
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground text-sm">Kč</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Hodinová sazba</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          value={hours > 0 && grossRevenue > 0 ? Math.round(grossRevenue / hours) : ""}
                          onChange={(e) => {
                            if (hours > 0) {
                              const targetHourly = Number(e.target.value)
                              const newPrice = targetHourly * hours
                              setGrossRevenue(newPrice)
                              // Vypočítat marži zpětně
                              const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)
                              if (totalCosts > 0) {
                                const newMargin = Math.round(((newPrice / totalCosts) - 1) * 100)
                                if (newMargin >= 0 && newMargin <= 500) {
                                  setMarginPercent(newMargin)
                                }
                              }
                            }
                          }}
                          className="flex-1"
                          disabled={hours === 0}
                        />
                        <span className="text-muted-foreground text-sm">Kč/h</span>
                      </div>
                      {hours === 0 && (
                        <p className="text-xs text-muted-foreground">Zadejte nejdříve hodiny</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Margin Slider */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Marže
                  </CardTitle>
                  <CardDescription>
                    Navýšení nad náklady pro vaši odměnu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold text-primary">{marginPercent}%</span>
                    <span className="text-muted-foreground">
                      Koncová cena:{" "}
                      <span className="font-bold text-foreground">
                        {formatCurrency(
                          costs.reduce((sum, c) => sum + c.amount, 0) * (1 + marginPercent / 100)
                        )}
                      </span>
                    </span>
                  </div>
                  <Slider
                    value={[marginPercent]}
                    onValueChange={([value]) => {
                      setMarginPercent(value)
                      // Aktualizovat grossRevenue podle marže
                      const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)
                      setGrossRevenue(Math.round(totalCosts * (1 + value / 100)))
                    }}
                    min={0}
                    max={500}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                    <span>200%</span>
                    <span>300%</span>
                    <span>400%</span>
                    <span>500%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && (
                <>
                  {/* Main Result */}
                  <Card
                    className={
                      result.isBelowMinimum
                        ? "border-destructive bg-destructive/5"
                        : "border-green-500 bg-green-50"
                    }
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {result.isBelowMinimum ? (
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          )}
                          Čistý zisk
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                          <Save className="w-4 h-4 mr-2" />
                          Uložit
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <div
                          className={`text-5xl font-bold ${
                            result.isBelowMinimum ? "text-destructive" : "text-green-600"
                          }`}
                        >
                          {formatCurrency(result.netProfit)}
                        </div>
                        <div className="text-muted-foreground mt-2">
                          z koncové ceny {formatCurrency(result.finalPrice)}
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      <div
                        className={`mt-4 p-4 rounded-lg ${
                          result.isBelowMinimum ? "bg-destructive/10" : "bg-green-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Hodinová sazba:</span>
                          <span
                            className={`text-2xl font-bold ${
                              result.isBelowMinimum ? "text-destructive" : "text-green-700"
                            }`}
                          >
                            {formatCurrency(result.hourlyRate)}/h
                          </span>
                        </div>
                        {result.isBelowMinimum && (
                          <p className="text-sm text-destructive mt-2">
                            Varování: Hodinová sazba je pod minimem {formatCurrency(result.minimumHourlyRate)}
                            /h. Tato zakázka se vám nevyplatí!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Breakdown Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Rozdělení ceny</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Visual Bar */}
                      <div className="h-8 rounded-full overflow-hidden flex mb-4">
                        <div
                          className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${result.materialPercent}%` }}
                        >
                          {result.materialPercent > 10 && `${Math.round(result.materialPercent)}%`}
                        </div>
                        <div
                          className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${result.taxesPercent}%` }}
                        >
                          {result.taxesPercent > 10 && `${Math.round(result.taxesPercent)}%`}
                        </div>
                        <div
                          className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${result.profitPercent}%` }}
                        >
                          {result.profitPercent > 10 && `${Math.round(result.profitPercent)}%`}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Materiál a náklady</span>
                          </div>
                          <span className="font-medium">{formatCurrency(result.totalCosts)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Odvody státu</span>
                          </div>
                          <span className="font-medium">{formatCurrency(result.totalTaxes)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Čistý zisk</span>
                          </div>
                          <span className="font-medium">{formatCurrency(result.netProfit)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detail odvodů</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-orange-600" />
                          <span>Sociální pojištění</span>
                        </div>
                        <span className="font-medium">{formatCurrency(result.socialInsurance)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-600" />
                          <span>Zdravotní pojištění</span>
                        </div>
                        <span className="font-medium">{formatCurrency(result.healthInsurance)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-purple-600" />
                          <span>Daň z příjmu</span>
                        </div>
                        <span className="font-medium">{formatCurrency(result.incomeTax)}</span>
                      </div>
                      <div className="pt-3 border-t flex justify-between items-center">
                        <span className="font-bold">Celkem odvody:</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(result.totalTaxes)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        * Výpočet je orientační a závisí na vašich daňových nastaveních. Skutečné
                        odvody se mohou lišit podle vašich celkových ročních příjmů.
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uložit kalkulaci</DialogTitle>
            <DialogDescription>
              Kalkulace bude uložena do historie pro pozdější referenci.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Název zakázky</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Zadejte název"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Uložit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historie kalkulací</DialogTitle>
            <DialogDescription>
              Vaše uložené kalkulace ({savedCalculations.length})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {savedCalculations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Zatím nemáte žádné uložené kalkulace.
              </p>
            ) : (
              savedCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{calc.projectName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(calc.createdAt).toLocaleDateString("cs-CZ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(calc.result.netProfit)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(calc.result.hourlyRate)}/h
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => loadCalculation(calc)}>
                      Načíst
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(calc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
