"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  PieChart,
  Plus,
  Trash2,
  TriangleAlert,
  CircleCheck,
  Cog,
  Save,
  History,
  TrendingUp,
  Loader2,
  Timer,
  Banknote,
  Building2,
  HeartPulse,
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
      <AppLayout>
        <div className="p-5 lg:p-6 max-w-[1200px] mx-auto flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  // Show settings prompt if not configured
  if (!hasSettings) {
    return (
      <AppLayout>
        <div className="p-5 lg:p-6 max-w-lg mx-auto py-16">
          <div className="text-center p-6 bg-card border border-border rounded-md">
            <div className="w-14 h-14 bg-warning/10 rounded flex items-center justify-center mx-auto mb-4">
              <Cog className="w-7 h-7 text-warning" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold tracking-tight mb-2">Nejdříve nastavte daně</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Pro přesný výpočet čistého zisku potřebujeme vědět, jak uplatňujete výdaje a jestli jste plátce DPH.
            </p>
            <Button size="sm" onClick={() => router.push("/settings/tax")}>
              <Cog className="w-4 h-4 mr-1.5" />
              Přejít do nastavení
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const taxSettings = getTaxSettings()

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <PieChart className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Kalkulačka zisku
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Zjistěte, kolik vám skutečně zůstane ze zakázky
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                Historie
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/settings/tax")}>
                <Cog className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
                Nastavení
              </Button>
            </div>
          </div>
        </header>

        {/* Tax Settings Badge */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline">
            {taxSettings.expenseType === "pausalni"
              ? `Paušál ${taxSettings.pausalniSazba}%`
              : "Skutečné výdaje"}
          </Badge>
          <Badge variant="outline">
            {taxSettings.vatStatus === "none"
              ? "Neplátce DPH"
              : `Plátce DPH ${taxSettings.vatStatus}%`}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            {/* Project Name */}
            <div className="p-4 bg-card border border-border rounded-md">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Název zakázky
              </Label>
              <Input
                placeholder="Např. Web pro klienta XY"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            {/* Costs */}
            <div className="p-4 bg-card border border-border rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Náklady
                </Label>
              </div>
              <div className="space-y-2">
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
                      className="w-28"
                    />
                    <span className="text-xs text-muted-foreground w-6">Kč</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCostItem(cost.id)}
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addCostItem} className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Přidat položku
                </Button>
              </div>

              <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm font-medium">Celkové náklady:</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatCurrency(costs.reduce((sum, c) => sum + c.amount, 0))}
                </span>
              </div>
            </div>

            {/* Hours */}
            <div className="p-4 bg-card border border-border rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Čas na zakázku
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  value={hours || ""}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">hodin</span>
              </div>
            </div>

            {/* Target Price */}
            <div className="p-4 bg-card border border-border rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cílová cena
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Koncová cena</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={grossRevenue || ""}
                      onChange={(e) => {
                        const price = Number(e.target.value)
                        setGrossRevenue(price)
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
                    <span className="text-xs text-muted-foreground">Kč</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Hodinová sazba</Label>
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
                    <span className="text-xs text-muted-foreground">Kč/h</span>
                  </div>
                  {hours === 0 && (
                    <p className="text-[10px] text-muted-foreground">Zadejte nejdříve hodiny</p>
                  )}
                </div>
              </div>
            </div>

            {/* Margin Slider */}
            <div className="p-4 bg-card border border-border rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Marže
                </Label>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary tabular-nums">{marginPercent}%</span>
                <span className="text-sm text-muted-foreground">
                  Koncová cena:{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(costs.reduce((sum, c) => sum + c.amount, 0) * (1 + marginPercent / 100))}
                  </span>
                </span>
              </div>
              <Slider
                value={[marginPercent]}
                onValueChange={([value]) => {
                  setMarginPercent(value)
                  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)
                  setGrossRevenue(Math.round(totalCosts * (1 + value / 100)))
                }}
                min={0}
                max={500}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
                <span>300%</span>
                <span>400%</span>
                <span>500%</span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {result && (
              <>
                {/* Main Result */}
                <div className={`relative p-5 bg-card border rounded-md overflow-hidden ${
                  result.isBelowMinimum ? "border-destructive/50" : "border-success/50"
                }`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${result.isBelowMinimum ? "bg-destructive" : "bg-success"}`} />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {result.isBelowMinimum ? (
                        <TriangleAlert className="w-5 h-5 text-destructive" strokeWidth={1.75} />
                      ) : (
                        <CircleCheck className="w-5 h-5 text-success" strokeWidth={1.75} />
                      )}
                      <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Čistý zisk</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="h-7">
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Uložit
                    </Button>
                  </div>

                  <div className="text-center py-4">
                    <div className={`text-4xl font-bold tabular-nums ${result.isBelowMinimum ? "text-destructive" : "text-success"}`}>
                      {formatCurrency(result.netProfit)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      z koncové ceny {formatCurrency(result.finalPrice)}
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div className={`mt-4 p-3 rounded ${result.isBelowMinimum ? "bg-destructive/5" : "bg-success/5"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Hodinová sazba:</span>
                      <span className={`text-xl font-bold tabular-nums ${result.isBelowMinimum ? "text-destructive" : "text-success"}`}>
                        {formatCurrency(result.hourlyRate)}/h
                      </span>
                    </div>
                    {result.isBelowMinimum && (
                      <p className="text-xs text-destructive mt-2">
                        Varování: Hodinová sazba je pod minimem {formatCurrency(result.minimumHourlyRate)}/h
                      </p>
                    )}
                  </div>
                </div>

                {/* Breakdown Chart */}
                <div className="p-4 bg-card border border-border rounded-md">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                    Rozdělení ceny
                  </Label>

                  {/* Visual Bar */}
                  <div className="h-6 rounded overflow-hidden flex mb-4">
                    <div
                      className="bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium"
                      style={{ width: `${result.materialPercent}%` }}
                    >
                      {result.materialPercent > 12 && `${Math.round(result.materialPercent)}%`}
                    </div>
                    <div
                      className="bg-destructive flex items-center justify-center text-destructive-foreground text-[10px] font-medium"
                      style={{ width: `${result.taxesPercent}%` }}
                    >
                      {result.taxesPercent > 12 && `${Math.round(result.taxesPercent)}%`}
                    </div>
                    <div
                      className="bg-success flex items-center justify-center text-white text-[10px] font-medium"
                      style={{ width: `${result.profitPercent}%` }}
                    >
                      {result.profitPercent > 12 && `${Math.round(result.profitPercent)}%`}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                        <span>Materiál a náklady</span>
                      </div>
                      <span className="font-medium tabular-nums">{formatCurrency(result.totalCosts)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                        <span>Odvody státu</span>
                      </div>
                      <span className="font-medium tabular-nums">{formatCurrency(result.totalTaxes)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                        <span>Čistý zisk</span>
                      </div>
                      <span className="font-medium tabular-nums">{formatCurrency(result.netProfit)}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Breakdown */}
                <div className="p-4 bg-card border border-border rounded-md">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                    Detail odvodů
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-warning" strokeWidth={1.75} />
                        <span className="text-sm">Sociální pojištění</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{formatCurrency(result.socialInsurance)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-destructive" strokeWidth={1.75} />
                        <span className="text-sm">Zdravotní pojištění</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{formatCurrency(result.healthInsurance)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-primary" strokeWidth={1.75} />
                        <span className="text-sm">Daň z příjmu</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{formatCurrency(result.incomeTax)}</span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                    <span className="text-sm font-semibold">Celkem odvody:</span>
                    <span className="text-base font-bold text-destructive tabular-nums">
                      {formatCurrency(result.totalTaxes)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    * Výpočet je orientační. Skutečné odvody se mohou lišit podle vašich celkových ročních příjmů.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Uložit kalkulaci</DialogTitle>
              <DialogDescription>
                Kalkulace bude uložena do historie pro pozdější referenci.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="text-xs font-medium">Název zakázky</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Zadejte název"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
                Zrušit
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1.5" />
                Uložit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Historie kalkulací</DialogTitle>
              <DialogDescription>
                Vaše uložené kalkulace ({savedCalculations.length})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {savedCalculations.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Zatím nemáte žádné uložené kalkulace.
                </p>
              ) : (
                savedCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-3 border border-border rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{calc.projectName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(calc.createdAt).toLocaleDateString("cs-CZ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-success tabular-nums">
                          {formatCurrency(calc.result.netProfit)}
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums">
                          {formatCurrency(calc.result.hourlyRate)}/h
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <Button variant="outline" size="sm" onClick={() => loadCalculation(calc)} className="h-7 text-xs">
                        Načíst
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                        onClick={() => handleDelete(calc.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
