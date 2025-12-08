"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Download } from "lucide-react"
import { useEffect, useState } from "react"
import type { Invoice } from "@/lib/cash-flow"
import { formatCurrency } from "@/lib/cash-flow"
import { getDefaultBankAccount, formatAccountNumber } from "@/lib/bank-accounts"
import { generateQRCode, generateInvoiceNumber } from "@/lib/qr-payment"
import type { BankAccount } from "@/lib/bank-accounts"
import pdfMake from "pdfmake/build/pdfmake"
import * as pdfFonts from "pdfmake/build/vfs_fonts"

// Initialize pdfMake with fonts
if (typeof window !== "undefined") {
  ;(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || {}
}

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

  const handleDownloadPDF = async () => {
    try {
      // Prepare table body
      const tableBody: any[] = []

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          const typeLabel = item.type === "service" ? "Služba" : item.type === "material" ? "Materiál" : "Cestovné"
          tableBody.push([
            `${item.description} (${typeLabel})`,
            `${item.quantity} ${item.unit}`,
            formatCurrency(item.unitPrice),
            { text: formatCurrency(item.total), bold: true }
          ])
        })
      } else {
        tableBody.push([
          { text: invoice.description || "Faktura", colSpan: 3 },
          {},
          {},
          formatCurrency(invoice.amount)
        ])
      }

      // Build document definition
      const docDefinition: any = {
        content: [
          { text: "FAKTURA", style: "header", alignment: "center" },
          { text: " ", margin: [0, 10] },

          // Invoice details
          invoice.invoiceNumber ? { text: `Číslo faktury: ${invoice.invoiceNumber}`, style: "detail" } : {},
          invoice.variableSymbol ? { text: `Variabilní symbol: ${invoice.variableSymbol}`, style: "detail" } : {},
          { text: `Datum vystavení: ${new Date().toLocaleDateString("cs-CZ")}`, style: "detail" },
          { text: " ", margin: [0, 10] },

          // Supplier and Customer
          {
            columns: [
              {
                width: "*",
                stack: [
                  { text: "Dodavatel", style: "subheader" },
                  { text: "Vaše firma" },
                  bankAccount ? { text: `Účet: ${formatAccountNumber(bankAccount.accountNumber, bankAccount.bankCode)}`, fontSize: 9 } : {},
                  bankAccount?.iban ? { text: `IBAN: ${bankAccount.iban}`, fontSize: 9 } : {}
                ]
              },
              {
                width: "*",
                stack: [
                  { text: "Odběratel", style: "subheader" },
                  { text: invoice.from }
                ]
              }
            ]
          },
          { text: " ", margin: [0, 15] },

          // Items table
          {
            table: {
              headerRows: 1,
              widths: invoice.items && invoice.items.length > 0 ? ["*", "auto", "auto", "auto"] : ["*", "auto"],
              body: [
                invoice.items && invoice.items.length > 0
                  ? [
                      { text: "Popis", style: "tableHeader" },
                      { text: "Množství", style: "tableHeader", alignment: "center" },
                      { text: "Cena/jedn.", style: "tableHeader", alignment: "right" },
                      { text: "Částka", style: "tableHeader", alignment: "right" }
                    ]
                  : [
                      { text: "Popis", style: "tableHeader" },
                      { text: "Částka", style: "tableHeader", alignment: "right" }
                    ],
                ...tableBody
              ]
            },
            layout: "lightHorizontalLines"
          },
          { text: " ", margin: [0, 10] },

          // Total
          {
            columns: [
              { text: "Celkem k úhradě:", style: "total", width: "*" },
              { text: formatCurrency(invoice.amount), style: "totalAmount", width: "auto", alignment: "right" }
            ]
          },
          { text: `Datum splatnosti: ${new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}`, style: "detail", margin: [0, 5] },

          // QR Code
          qrCodeDataUrl && invoice.type === "income" ? { text: " ", margin: [0, 15] } : {},
          qrCodeDataUrl && invoice.type === "income" ? { text: "Zaplaťte snadno naskenováním QR kódu:", alignment: "center" } : {},
          qrCodeDataUrl && invoice.type === "income" ? { image: qrCodeDataUrl, width: 150, alignment: "center", margin: [0, 10] } : {}
        ],
        styles: {
          header: {
            fontSize: 20,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 11,
            bold: true,
            margin: [0, 0, 0, 5]
          },
          detail: {
            fontSize: 10,
            margin: [0, 2]
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            fillColor: "#f0f0f0"
          },
          total: {
            fontSize: 14,
            bold: true
          },
          totalAmount: {
            fontSize: 16,
            bold: true
          }
        },
        defaultStyle: {
          font: "Roboto"
        }
      }

      pdfMake.createPdf(docDefinition).download(`faktura-${invoice.invoiceNumber || invoice.id}.pdf`)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Nepodařilo se vygenerovat PDF")
    }
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
            padding: 40px;
          }
          .print\\:page-break-after {
            page-break-after: avoid;
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

          <div className="space-y-6 print:page-break-after" id="invoice-print-content">
          {/* Invoice Header */}
          <div className="bg-white p-6 rounded-lg border print:border-none">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">FAKTURA</h1>
              <div className="text-sm text-gray-600">
                {invoice.invoiceNumber && <div>Číslo faktury: {invoice.invoiceNumber}</div>}
                {invoice.variableSymbol && <div>Variabilní symbol: {invoice.variableSymbol}</div>}
                <div>Datum vystavení: {new Date().toLocaleDateString("cs-CZ")}</div>
              </div>
            </div>

              {/* From/To */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Dodavatel</p>
                  <p className="font-medium">Vaše firma</p>
                  {bankAccount && (
                    <>
                      <p className="text-sm mt-2">
                        Číslo účtu: {formatAccountNumber(bankAccount.accountNumber, bankAccount.bankCode)}
                      </p>
                      {bankAccount.iban && <p className="text-sm">IBAN: {bankAccount.iban}</p>}
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Odběratel</p>
                  <p className="font-medium">{invoice.from}</p>
                </div>
              </div>

              {/* Contract Reference */}
              {invoice.contractId && (
                <div className="mb-6 p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600">Faktura vystavena na základě smlouvy</p>
                  <p className="text-sm font-medium">ID: {invoice.contractId}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-semibold">Popis</th>
                      {invoice.items && invoice.items.length > 0 && (
                        <>
                          <th className="text-center py-2 text-sm font-semibold">Množství</th>
                          <th className="text-right py-2 text-sm font-semibold">Cena/jedn.</th>
                        </>
                      )}
                      <th className="text-right py-2 text-sm font-semibold">Částka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 text-sm">
                            {item.description}
                            <span className="text-xs text-gray-500 ml-2">
                              ({item.type === "service" ? "Služba" : item.type === "material" ? "Materiál" : "Cestovné"})
                            </span>
                          </td>
                          <td className="text-center py-3 text-sm">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="text-right py-3 text-sm">{formatCurrency(item.unitPrice)}</td>
                          <td className="text-right py-3 text-sm font-semibold">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 text-sm">{invoice.description || "Faktura"}</td>
                        <td className="text-right py-3 text-sm">{formatCurrency(invoice.amount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Celkem k úhradě:</span>
                  <span className="text-2xl font-bold">{formatCurrency(invoice.amount)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Datum splatnosti: {new Date(invoice.dueDate).toLocaleDateString("cs-CZ")}
                </div>
              </div>

              {/* QR Code */}
              {invoice.type === "income" && qrCodeDataUrl && (
                <div className="border-t pt-6">
                  <p className="text-sm text-gray-600 mb-3 text-center font-medium">Zaplaťte snadno naskenováním QR kódu</p>
                  <div className="flex justify-center">
                    <img src={qrCodeDataUrl} alt="QR platba" className="w-48 h-48 border rounded" />
                  </div>
                </div>
              )}

              {invoice.type === "income" && isGenerating && (
                <div className="text-center text-gray-500 py-8">Generuji QR kód...</div>
              )}

              {invoice.type === "income" && !qrCodeDataUrl && !isGenerating && (
                <div className="text-center text-gray-500 py-4 text-sm">
                  QR kód není k dispozici. Zkontroluj, zda máš nastavený bankovní účet.
                </div>
              )}
            </div>

          {/* Actions */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={handleDownloadPDF} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Stáhnout PDF
            </Button>
            {qrCodeDataUrl && (
              <Button onClick={handleDownloadQR} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                QR kód
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
