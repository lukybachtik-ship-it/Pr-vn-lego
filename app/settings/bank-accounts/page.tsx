"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Star, CreditCard } from "lucide-react"
import {
  getAllBankAccounts,
  saveBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  type BankAccount,
} from "@/lib/bank-accounts"
import { AppLayout } from "@/components/app-layout"

export default function BankAccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
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
      isDefault: accounts.length === 0, // First account is default
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

  return (
    <AppLayout title="Bankovní účty" showBack>
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bankovní účty</h1>
              <p className="text-muted-foreground">Správa účtů pro QR platby</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Přidat účet
            </Button>
          </div>

        {/* Accounts List */}
        <div className="grid gap-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Zatím žádné bankovní účty</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Přidej účet pro generování QR kódů na fakturách
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id} className={account.isDefault ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{account.label}</CardTitle>
                        {account.isDefault && (
                          <Badge variant="default">
                            <Star className="w-3 h-3 mr-1" />
                            Výchozí
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {account.accountNumber}/{account.bankCode}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {!account.isDefault && (
                        <Button
                          onClick={() => handleSetDefault(account.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Nastavit jako výchozí
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteAccount(account.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {account.iban && (
                      <div>
                        <p className="text-muted-foreground">IBAN</p>
                        <p className="font-mono">{account.iban}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Měna</p>
                      <p className="font-semibold">{account.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm text-blue-900">Jak to funguje?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <ul className="list-disc list-inside space-y-1">
              <li>QR kódy se generují automaticky při vytváření faktur</li>
              <li>Používá se standardní formát SPD (Short Payment Descriptor)</li>
              <li>Výchozí účet se použije, pokud není specifikován jiný</li>
              <li>Zákazníci mohou platit naskenováním QR kódu v mobilní bance</li>
            </ul>
          </CardContent>
        </Card>
        </div>

        {/* Add Account Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Přidat bankovní účet</DialogTitle>
            <DialogDescription>Zadej údaje o bankovním účtu pro QR platby</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Název účtu</Label>
              <Input
                id="label"
                placeholder="např. Hlavní účet, EUR účet..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber">Číslo účtu</Label>
                <Input
                  id="accountNumber"
                  placeholder="123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bankCode">Kód banky</Label>
                <Input
                  id="bankCode"
                  placeholder="0100"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="iban">IBAN (volitelné)</Label>
              <Input
                id="iban"
                placeholder="CZ6508000000192000145399"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pokud nevyplníš, IBAN se vygeneruje automaticky
              </p>
            </div>

            <div>
              <Label htmlFor="currency">Měna</Label>
              <select
                id="currency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "CZK" | "EUR" | "USD")}
              >
                <option value="CZK">CZK - Česká koruna</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Americký dolar</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleAddAccount}>
              <Plus className="w-4 h-4 mr-2" />
              Přidat účet
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </main>
    </AppLayout>
  )
}
