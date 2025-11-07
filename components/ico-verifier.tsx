"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface IcoVerifierProps {
  value: string
  onChange: (value: string) => void
  onVerified?: (data: any) => void
  label?: string
  required?: boolean
}

interface VerificationResult {
  found: boolean
  verified?: boolean
  ico?: string
  obchodniJmeno?: string
  sidlo?: {
    nazevUlice: string
    cisloDomovniho: string
    nazevObce: string
    psc: string
    nazevKraje: string
  }
  dic?: string
  bankAccounts?: string[]
  jednatele?: string[]
  insolvencyStatus?: {
    hasInsolvency: boolean
    status: string
    error?: boolean
  }
  vatStatus?: {
    isUnreliable: boolean
    status: string
    error?: boolean
  }
  error?: string
  message?: string
}

export function IcoVerifier({ value, onChange, onVerified, label = "IČO", required = false }: IcoVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!value || value.length !== 8) {
      setError("IČO musí být 8-místné číslo")
      return
    }

    setIsVerifying(true)
    setError(null)
    setResult(null)

    try {
      console.log("[v0] Verifying ICO:", value)
      const response = await fetch(`/api/verify-ico?ico=${value}`)
      const data = await response.json()

      console.log("[v0] Verification response:", data)

      if (response.ok && data.found) {
        setResult(data)
        setError(null)
        if (onVerified) {
          onVerified(data)
        }
      } else {
        setError(data.error || "Chyba při ověřování")
        setResult({ found: false, error: data.error })
      }
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setError("Chyba při připojení k ARES - kontroluj připojení k internetu")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold">{label}</label>
      <div className="flex gap-2">
        <Input
          placeholder="12345678"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 8)
            onChange(val)
            setResult(null)
            setError(null)
          }}
          maxLength={8}
          disabled={isVerifying}
        />
        <Button onClick={handleVerify} disabled={isVerifying || !value || value.length !== 8} size="sm">
          {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ověřit"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result?.found && result.obchodniJmeno && (
        <div className="space-y-2">
          <Alert className="bg-accent/5 border-accent">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-foreground">{result.obchodniJmeno}</p>
                  {result.verified && <p className="text-xs text-accent">✓ Ověřeno v ARES</p>}
                  {result.message && <p className="text-xs text-muted-foreground italic">{result.message}</p>}
                </div>
                {result.sidlo && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {result.sidlo.nazevUlice} {result.sidlo.cisloDomovniho}
                    </p>
                    <p>
                      {result.sidlo.psc} {result.sidlo.nazevObce}
                    </p>
                  </div>
                )}
                {/* DIČ */}
                {result.dic && (
                  <div className="text-sm pt-2 border-t border-border">
                    <p className="font-semibold text-foreground">DIČ:</p>
                    <p className="text-muted-foreground">{result.dic}</p>
                  </div>
                )}
                {/* Bank Accounts */}
                {result.bankAccounts && result.bankAccounts.length > 0 && (
                  <div className="text-sm pt-2 border-t border-border">
                    <p className="font-semibold text-foreground">Bankovní účty:</p>
                    <ul className="text-muted-foreground">
                      {result.bankAccounts.map((account, idx) => (
                        <li key={idx}>• {account}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.jednatele && result.jednatele.length > 0 && (
                  <div className="text-sm pt-2 border-t border-border">
                    <p className="font-semibold text-foreground">Jednatelé:</p>
                    <ul className="text-muted-foreground">
                      {result.jednatele.map((jednatel, idx) => (
                        <li key={idx}>• {jednatel}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Insolvency Warning */}
          {result.insolvencyStatus?.hasInsolvency && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold">⚠️ Varování: Insolvence</p>
                <p className="text-sm">{result.insolvencyStatus.status}</p>
                <p className="text-xs mt-1">Doporučujeme zvýšenou opatrnost při uzavírání smlouvy.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* VAT Unreliable Payer Warning */}
          {result.vatStatus?.isUnreliable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold">⚠️ Varování: Nespolehlivý plátce DPH</p>
                <p className="text-sm">{result.vatStatus.status}</p>
                <p className="text-xs mt-1">Společnost je vedena jako nespolehlivý plátce DPH.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* All Clear Message */}
          {result.insolvencyStatus &&
            !result.insolvencyStatus.hasInsolvency &&
            result.vatStatus &&
            !result.vatStatus.isUnreliable &&
            !result.insolvencyStatus.error &&
            !result.vatStatus.error && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <p className="text-sm">✓ Bez insolvencí, spolehlivý plátce DPH</p>
                </AlertDescription>
              </Alert>
            )}
        </div>
      )}

      {result && !result.found && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error || "IČO nebylo nalezeno v ARES registru"}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
