"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Star, CreditCard, Info } from "lucide-react"
import {
  getAllBankAccounts,
  saveBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  type BankAccount,
} from "@/lib/bank-accounts"
import { AppLayout } from "@/components/app-layout"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton component
function SkeletonBankAccounts() {
  return (
    <div className="p-5 lg:p-6 max-w-[800px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-md stagger-item">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Form state
  const [accountNumber, setAccountNumber] = useState("")
  const [bankCode, setBankCode] = useState("")
  const [iban, setIban] = useState("")
  const [currency, setCurrency] = useState<"CZK" | "EUR" | "USD">("CZK")
  const [label, setLabel] = useState("")

  useEffect(() => {
    loadAccounts()

    // Reload after a short delay to catch data loaded by AuthProvider
    const reloadTimer = setTimeout(() => {
      loadAccounts()
    }, 500)

    return () => clearTimeout(reloadTimer)
  }, [])

  const loadAccounts = () => {
    setAccounts(getAllBankAccounts())
    setIsLoading(false)
  }

  const handleAddAccount = () => {
    if (!accountNumber || !bankCode || !label) {
      alert("Vyplň číslo účtu, kód banky a název")
      return
    }

    saveBankAccount({
      accountNumber,
      bankCode,
      iban: iban || undefined,
      currency,
      label,
      isDefault: accounts.length === 0,
    })

    loadAccounts()
    setShowAddDialog(false)
    resetForm()
  }

  const handleSetDefault = (accountId: string) => {
    setDefaultBankAccount(accountId)
    loadAccounts()
  }

  const handleDeleteAccount = (accountId: string) => {
    if (!confirm("Opravdu smazat tento účet?")) return
    deleteBankAccount(accountId)
    loadAccounts()
  }

  const resetForm = () => {
    setAccountNumber("")
    setBankCode("")
    setIban("")
    setCurrency("CZK")
    setLabel("")
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SkeletonBankAccounts />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-6 max-w-[800px] mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                <CreditCard className="w-6 h-6 text-primary" strokeWidth={1.75} />
                Bankovní účty
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Správa účtů pro QR platby na fakturách
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
              Přidat účet
            </Button>
          </div>
        </header>

        {/* Accounts List */}
        <div className="space-y-3 mb-6">
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-muted-foreground mb-1">Zatím žádné bankovní účty</p>
              <p className="text-xs text-muted-foreground">
                Přidejte účet pro generování QR kódů na fakturách
              </p>
            </div>
          ) : (
            accounts.map((account, index) => (
              <div
                key={account.id}
                className={`p-4 bg-card border rounded-md stagger-item ${
                  account.isDefault ? "border-primary" : "border-border"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium">{account.label}</h3>
                      {account.isDefault && (
                        <Badge variant="default" className="text-[10px]">
                          <Star className="w-3 h-3 mr-1" />
                          Výchozí
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {account.accountNumber}/{account.bankCode}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {!account.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(account.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                      >
                        <Star className="w-3.5 h-3.5 mr-1" strokeWidth={1.75} />
                        Nastavit jako výchozí
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteAccount(account.id)}
                      size="icon-sm"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  {account.iban && (
                    <div>
                      <p className="text-muted-foreground mb-0.5">IBAN</p>
                      <p className="font-mono">{account.iban}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-0.5">Měna</p>
                    <p className="font-semibold">{account.currency}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Card */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="text-xs text-foreground/80">
              <p className="font-medium mb-1.5">Jak to funguje?</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                <li>QR kódy se generují automaticky při vytváření faktur</li>
                <li>Používá se standardní formát SPD (Short Payment Descriptor)</li>
                <li>Výchozí účet se použije, pokud není specifikován jiný</li>
                <li>Zákazníci mohou platit naskenováním QR kódu v mobilní bance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Přidat bankovní účet</DialogTitle>
            <DialogDescription>
              Zadejte údaje o bankovním účtu pro QR platby
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Název účtu
              </Label>
              <Input
                placeholder="např. Hlavní účet, EUR účet..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Číslo účtu
                </Label>
                <Input
                  placeholder="123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Kód banky
                </Label>
                <Input
                  placeholder="0100"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                IBAN (volitelné)
              </Label>
              <Input
                placeholder="CZ6508000000192000145399"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Pokud nevyplníte, IBAN se vygeneruje automaticky
              </p>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Měna
              </Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value as "CZK" | "EUR" | "USD")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CZK">CZK - Česká koruna</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Americký dolar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>
              Zrušit
            </Button>
            <Button size="sm" onClick={handleAddAccount}>
              <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.75} />
              Přidat účet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
