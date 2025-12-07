"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calculator } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { InvoiceItem } from "@/lib/cash-flow"

interface InvoiceItemsEditorProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
  onTotalChange: (total: number) => void
}

export function InvoiceItemsEditor({ items, onChange, onTotalChange }: InvoiceItemsEditorProps) {
  const addItem = (type: "service" | "material" | "travel") => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      type,
      description: "",
      quantity: 1,
      unit: type === "service" ? "hod" : type === "material" ? "ks" : "km",
      unitPrice: 0,
      total: 0,
    }
    const newItems = [...items, newItem]
    onChange(newItems)
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // Auto-calculate total when quantity or unitPrice changes
        if (field === "quantity" || field === "unitPrice") {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    })
    onChange(newItems)

    // Calculate and update total
    const total = newItems.reduce((sum, item) => sum + item.total, 0)
    onTotalChange(total)
  }

  const removeItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id)
    onChange(newItems)

    // Calculate and update total
    const total = newItems.reduce((sum, item) => sum + item.total, 0)
    onTotalChange(total)
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "service":
        return "Služba"
      case "material":
        return "Materiál"
      case "travel":
        return "Cestovné"
      default:
        return type
    }
  }

  const total = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Položky faktury
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => addItem("service")}>
              <Plus className="w-4 h-4 mr-1" />
              Služba
            </Button>
            <Button size="sm" variant="outline" onClick={() => addItem("material")}>
              <Plus className="w-4 h-4 mr-1" />
              Materiál
            </Button>
            <Button size="sm" variant="outline" onClick={() => addItem("travel")}>
              <Plus className="w-4 h-4 mr-1" />
              Cestovné
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Žádné položky. Přidejte položky pomocí tlačítek výše.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {getItemTypeLabel(item.type)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Popis</Label>
                      <Input
                        placeholder="např. Konzultace, Materiál XY, Cesta Praha-Brno"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Množství</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div>
                      <Label>Jednotka</Label>
                      <Input
                        placeholder="hod, ks, km..."
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Cena za jednotku (Kč)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div>
                      <Label>Celkem (Kč)</Label>
                      <Input
                        type="number"
                        value={item.total}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Celková částka:</span>
                <span className="text-2xl font-bold">
                  {total.toLocaleString("cs-CZ")} Kč
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
