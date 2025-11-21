"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Download, Printer } from "lucide-react"
import { useEffect, useState } from "react"
import type { Invoice } from "@/lib/cash-flow"
import { formatCurrency } from "@/lib/cash-flow"
import { getDefaultBankAccount, formatAccountNumber } from "@/lib/bank-accounts"
import { generateQRCode, generateInvoiceNumber } from "@/lib/qr-payment"
import type { BankAccount } from "@/lib/bank-accounts"

interface QRInvoicePreviewProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRInvoicePreview({ invoice, open, onOpenChange }: QRInvoicePreviewProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (open && invoice.type === "income") {
      generateQR()
    }
  }, [open, invoice])

  const generateQR = async () => {
    setIsGenerating(true)
    try {
      const account = getDefaultBankAccount()
      if (!account) {
        console.warn("No bank account configured")
        return
      }

      setBankAccount(account)

      const qrCode = await generateQRCode({
        iban: account.iban,
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        amount: invoice.amount,
        currency: account.currency,
        vs: invoice.variableSymbol || invoice.invoiceNumber || generateInvoiceNumber(),
        message: invoice.description || `Faktura ${invoice.from}`,
      })

      setQrCodeDataUrl(qrCode)
    } catch (error) {
      console.error("QR generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = `qr-faktura-${invoice.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-content, #invoice-print-content * {
            visibility: visible;
          }
          #invoice-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="print:hidden">
            <DialogTitle>Faktura s QR platbou</DialogTitle>
            <DialogDescription>
              {invoice.type === "income" ? "Faktura pro klienta" : "Výdaj - QR platba není k dispozici"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6" id="invoice-print-content">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Faktura</CardTitle>
              <CardDescription>
                {invoice.invoiceNumber && `Číslo: ${invoice.invoiceNumber}`}
                {invoice.variableSymbol && ` • VS: ${invoice.variableSymbol}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From/To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dodavatel</p>
                  <p className="font-medium">Vaše firma</p>
                  {bankAccount && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Účet: {formatAccountNumber(bankAccount.accountNumber, bankAccount.bankCode)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Odběratel</p>
                  <p className="font-medium">{invoice.from}</p>
                </div>
              </div>

              {/* Amounts */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Popis:</span>
                  <span>{invoice.description || "Faktura"}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Celkem k úhradě:</span>
                  <span>{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Splatnost:</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}</span>
                </div>
              </div>

              {/* QR Code */}
              {invoice.type === "income" && qrCodeDataUrl && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-3 text-center">Zaplaťte snadno naskenováním QR kódu</p>
                  <div className="flex justify-center">
                    <img src={qrCodeDataUrl} alt="QR platba" className="w-64 h-64 border rounded-lg" />
                  </div>
                </div>
              )}

              {invoice.type === "income" && isGenerating && (
                <div className="text-center text-muted-foreground py-8">Generuji QR kód...</div>
              )}

              {invoice.type === "income" && !qrCodeDataUrl && !isGenerating && (
                <div className="text-center text-muted-foreground py-4">
                  QR kód není k dispozici. Zkontroluj, zda máš nastavený bankovní účet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Tisknout
            </Button>
            {qrCodeDataUrl && (
              <Button onClick={handleDownloadQR} variant="secondary" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Stáhnout QR
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Zavřít
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
