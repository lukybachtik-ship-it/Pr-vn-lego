"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileCheck, Download } from "lucide-react"
import { createHandoverProtocol, saveHandoverProtocol, getProtocolsForContract } from "@/lib/handover-protocol"
import type { ContractBlock } from "@/types/contract"
import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } from "docx"
import { saveAs } from "file-saver"

interface HandoverProtocolGeneratorProps {
  contractId: string
  contractName: string
  contractType: string
  blocks: ContractBlock[]
}

export function HandoverProtocolGenerator({
  contractId,
  contractName,
  contractType,
  blocks,
}: HandoverProtocolGeneratorProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().split("T")[0])
  const [withReservations, setWithReservations] = useState("false")
  const [reservationsDescription, setReservationsDescription] = useState("")
  const [existingProtocols, setExistingProtocols] = useState(getProtocolsForContract(contractId))

  const handleGenerate = () => {
    const protocol = createHandoverProtocol(
      contractId,
      contractName,
      contractType,
      blocks,
      handoverDate,
      withReservations === "true",
      reservationsDescription,
    )

    saveHandoverProtocol(protocol)
    setExistingProtocols(getProtocolsForContract(contractId))

    // Generate DOCX
    generateProtocolDocument(protocol)

    // Reset form
    setShowDialog(false)
    setWithReservations("false")
    setReservationsDescription("")
    setHandoverDate(new Date().toISOString().split("T")[0])
  }

  const generateProtocolDocument = async (protocol: any) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "PŘEDÁVACÍ PROTOKOL",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Subtitle
            new Paragraph({
              children: [new TextRun({ text: `k ${protocol.contractName}`, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),

            // Parties
            new Paragraph({
              children: [new TextRun({ text: "Smluvní strany:", bold: true })],
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: `Dodavatel: ${protocol.party1Name}`,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Objednatel: ${protocol.party2Name}`,
              spacing: { after: 400 },
            }),

            // Subject
            new Paragraph({
              children: [new TextRun({ text: "Předmět díla:", bold: true })],
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: protocol.scopeDescription,
              spacing: { after: 400 },
            }),

            // Handover date
            new Paragraph({
              children: [new TextRun({ text: "Dílo bylo předáno dne:", bold: true })],
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: new Date(protocol.handoverDate).toLocaleDateString("cs-CZ"),
              spacing: { after: 400 },
            }),

            // Reservations
            new Paragraph({
              children: [new TextRun({ text: "Stav díla:", bold: true })],
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: protocol.withReservations ? "S výhradami" : "Bez výhrad",
              spacing: { after: 200 },
            }),

            ...(protocol.withReservations && protocol.reservationsDescription
              ? [
                  new Paragraph({
                    children: [new TextRun({ text: "Popis výhrad:", bold: true })],
                    spacing: { before: 200, after: 200 },
                  }),
                  new Paragraph({
                    text: protocol.reservationsDescription,
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            // Signatures
            new Paragraph({
              text: "",
              spacing: { before: 800 },
            }),
            new Paragraph({
              text: "___________________________                    ___________________________",
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Podpis dodavatele                                      Podpis objednatele`,
            }),
            new Paragraph({
              text: `${protocol.party1Name}                                      ${protocol.party2Name}`,
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `Predavaci_protokol_${new Date(protocol.handoverDate).toISOString().split("T")[0]}.docx`)
  }

  const handleDownloadExisting = (protocol: any) => {
    generateProtocolDocument(protocol)
  }

  return (
    <Card className="border-blue-500 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <FileCheck className="w-5 h-5" />
          Předávací protokol
        </CardTitle>
        <CardDescription className="text-blue-600">
          Vytvořte předávací protokol pro dokončené dílo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => setShowDialog(true)} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
          <FileCheck className="w-4 h-4 mr-2" />
          Vygenerovat předávací protokol
        </Button>

        {existingProtocols.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Existující protokoly:</p>
            {existingProtocols.map((protocol) => (
              <div
                key={protocol.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white"
              >
                <div>
                  <p className="text-sm font-medium">
                    {new Date(protocol.handoverDate).toLocaleDateString("cs-CZ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {protocol.withReservations ? "S výhradami" : "Bez výhrad"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadExisting(protocol)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Stáhnout
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vytvořit předávací protokol</DialogTitle>
            <DialogDescription>
              Vyplňte údaje o předání díla. Protokol bude automaticky vygenerován a stažen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="handover-date">Datum předání</Label>
              <Input
                id="handover-date"
                type="date"
                value={handoverDate}
                onChange={(e) => setHandoverDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Stav díla</Label>
              <RadioGroup value={withReservations} onValueChange={setWithReservations}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="no-reservations" />
                  <Label htmlFor="no-reservations" className="font-normal cursor-pointer">
                    Bez výhrad - dílo je v pořádku
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="with-reservations" />
                  <Label htmlFor="with-reservations" className="font-normal cursor-pointer">
                    S výhradami - jsou závady k odstranění
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {withReservations === "true" && (
              <div className="space-y-2">
                <Label htmlFor="reservations">Popis výhrad</Label>
                <Textarea
                  id="reservations"
                  placeholder="Popište závady nebo výhrady k dílu..."
                  value={reservationsDescription}
                  onChange={(e) => setReservationsDescription(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Specifikujte konkrétní závady, které je potřeba odstranit nebo opravit.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border p-4 bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Náhled údajů:</h4>
              <ul className="text-sm space-y-1">
                <li>• Dodavatel: {blocks.find((b) => b.templateId === "parties")?.data.party1Name || "Neuvedeno"}</li>
                <li>• Objednatel: {blocks.find((b) => b.templateId === "parties")?.data.party2Name || "Neuvedeno"}</li>
                <li>
                  • Předmět:{" "}
                  {blocks.find((b) => b.templateId === "scope")?.data.scopeDescription?.substring(0, 60) || "Neuvedeno"}
                  ...
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700">
              <FileCheck className="w-4 h-4 mr-2" />
              Vygenerovat a stáhnout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
