"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, AlertCircle } from "lucide-react"
import type { ContractBlock } from "@/types/contract"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContractExporterProps {
  blocks: ContractBlock[]
  contractText: string
  contractType: string
  onExport?: (format: "docx" | "pdf") => void
}

export function ContractExporter({ blocks, contractText, contractType }: ContractExporterProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const getContractTitle = () => {
    switch (contractType) {
      case "rental-contract":
        return "NÁJEMNÍ SMLOUVA"
      case "purchase-contract":
        return "KUPNÍ SMLOUVA"
      case "trade-contract":
        return "OBCHODNÍ PODMÍNKY"
      case "other-contract":
        return "SMLOUVA"
      case "work-contract":
        return "SMLOUVA O DÍLO"
      default:
        return "SMLOUVA O DÍLO"
    }
  }

  const getContractFileName = () => {
    switch (contractType) {
      case "rental-contract":
        return "najemni-smlouva"
      case "purchase-contract":
        return "kupni-smlouva"
      case "trade-contract":
        return "obchodni-podminky"
      case "other-contract":
        return "smlouva"
      case "work-contract":
        return "smlouva-o-dilo"
      default:
        return "smlouva"
    }
  }

  const handleExportDocx = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      const { Document, Packer, Paragraph, TextRun, convertInchesToTwip } = await import("docx")

      const paragraphs = contractText.split("\n").map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return new Paragraph({ text: " " })

        // Check if it's a section header
        if (trimmed.match(/^[A-ZČŠŽ\d\-\s]+:$/) && trimmed.length < 100) {
          return new Paragraph({
            children: [new TextRun({ text: trimmed, bold: true })],
            spacing: { before: 200, after: 200 },
          })
        }

        return new Paragraph({
          children: [new TextRun({ text: trimmed })],
          spacing: { line: 360, after: 100 },
        })
      })

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [new TextRun({ text: getContractTitle(), bold: true, size: 28 })],
                spacing: { after: 400 },
              }),
              ...paragraphs,
            ],
          },
        ],
      })

      const buffer = await Packer.toBlob(doc)
      const url = URL.createObjectURL(buffer)
      const link = document.createElement("a")
      link.href = url
      link.download = `${getContractFileName()}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log("[v0] DOCX exported successfully")
    } catch (error) {
      console.error("[v0] DOCX export error:", error)
      setExportError("Chyba při exportu Word. Zkuste prosím později.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportTxt = () => {
    try {
      const element = document.createElement("a")
      const file = new Blob([contractText], { type: "text/plain;charset=utf-8" })
      element.href = URL.createObjectURL(file)
      element.download = `${getContractFileName()}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      URL.revokeObjectURL(element.href)
      console.log("[v0] TXT exported successfully")
    } catch (error) {
      console.error("[v0] TXT export error:", error)
      setExportError("Chyba při exportu textu.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Export smlouvy</CardTitle>
        <CardDescription>Stáhni si svou smlouvu v různých formátech</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {exportError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{exportError}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleExportDocx} className="w-full" size="lg" disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          {isExporting ? "Exportuji..." : "Stáhnout jako Word"}
        </Button>

        <Button onClick={handleExportTxt} variant="secondary" className="w-full" size="lg" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          Stáhnout jako Text
        </Button>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            Obsah smlouvy ({blocks.filter((b) => b.isComplete).length} sekcí)
          </p>
          <div className="space-y-2">
            {blocks.map(
              (block) =>
                block.isComplete && (
                  <div key={block.id} className="flex items-center gap-2 text-xs">
                    <span className="text-lg">{block.icon}</span>
                    <span className="text-foreground">{block.name}</span>
                  </div>
                ),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
