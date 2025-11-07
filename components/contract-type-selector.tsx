"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ContractType {
  id: string
  name: string
  description: string
  icon: string
  popular?: boolean
}

const CONTRACT_TYPES: ContractType[] = [
  {
    id: "work-contract",
    name: "Smlouva o dílo",
    description: "Pro svobodné projekty a jednorázové zakázky",
    icon: "📋",
    popular: true,
  },
  {
    id: "rental-contract",
    name: "Nájemní smlouva",
    description: "Pro pronájem nemovitostí a majetku",
    icon: "🏠",
  },
  {
    id: "trade-contract",
    name: "Obchodní podmínky",
    description: "Pro prodej zboží a služeb",
    icon: "💼",
  },
  {
    id: "other-contract",
    name: "Vlastní smlouva",
    description: "Vytvoř si smlouvu podle svých potřeb",
    icon: "⚖️",
  },
]

interface ContractTypeSelectorProps {
  onSelect: (type: string) => void
}

export function ContractTypeSelector({ onSelect }: ContractTypeSelectorProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-pretty">Co dnes tvoříš?</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Vyber si typ smlouvy, kterou chceš vytvořit, a my ti ji postavíme krok za krokem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {CONTRACT_TYPES.map((type) => (
          <Card
            key={type.id}
            className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary/50"
            onClick={() => onSelect(type.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <span className="text-4xl">{type.icon}</span>
                {type.popular && (
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Nejčastější
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{type.name}</CardTitle>
              <CardDescription className="text-base">{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Začít</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground mb-4">Nevíš, kterou smlouvu potřebuješ?</p>
        <Button variant="outline">Spustit průvodce</Button>
      </div>
    </div>
  )
}
