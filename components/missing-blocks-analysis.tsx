"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Info, Plus } from "lucide-react"
import type { ContractAnalysisResult } from "@/lib/contract-analysis"
import { useState } from "react"

interface MissingBlocksAnalysisProps {
  analysis: ContractAnalysisResult
  onAddBlock?: (blockId: string) => void
}

export function MissingBlocksAnalysis({ analysis, onAddBlock }: MissingBlocksAnalysisProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("critical")

  const criticalBlocks = analysis.missingBlocks.filter((b) => b.severity === "critical")
  const recommendedBlocks = analysis.missingBlocks.filter((b) => b.severity === "recommended")
  const optionalBlocks = analysis.missingBlocks.filter((b) => b.severity === "optional")

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Velmi dobré"
    if (score >= 60) return "Dobré"
    if (score >= 40) return "Dostačující"
    return "Vyžaduje doplnění"
  }

  return (
    <div className="space-y-4">
      {/* Completeness Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analýza smlouvy</span>
            <Badge variant={analysis.completenessScore >= 80 ? "default" : "secondary"} className="text-lg px-4 py-1">
              {analysis.completenessScore}%
            </Badge>
          </CardTitle>
          <CardDescription className={getScoreColor(analysis.completenessScore)}>
            <CheckCircle className="w-4 h-4 inline mr-1" />
            {getScoreLabel(analysis.completenessScore)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {analysis.warnings.map((warning, idx) => (
                <p key={idx}>• {warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Missing Blocks */}
      {criticalBlocks.length > 0 && (
        <Card className="border-destructive">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedCategory(expandedCategory === "critical" ? null : "critical")}
          >
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Chybí povinné bloky ({criticalBlocks.length})
            </CardTitle>
            <CardDescription>Tyto bloky jsou nezbytné pro platnost smlouvy</CardDescription>
          </CardHeader>
          {expandedCategory === "critical" && (
            <CardContent className="space-y-3">
              {criticalBlocks.map((block) => (
                <div key={block.blockId} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <span className="text-2xl">{block.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{block.name}</p>
                    <p className="text-sm text-muted-foreground">{block.reason}</p>
                  </div>
                  {onAddBlock && (
                    <Button size="sm" variant="destructive" onClick={() => onAddBlock(block.blockId)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Přidat
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Recommended Missing Blocks */}
      {recommendedBlocks.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedCategory(expandedCategory === "recommended" ? null : "recommended")}
          >
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600" />
              Doporučené bloky ({recommendedBlocks.length})
            </CardTitle>
            <CardDescription>Tyto bloky výrazně zvyšují bezpečnost smlouvy</CardDescription>
          </CardHeader>
          {expandedCategory === "recommended" && (
            <CardContent className="space-y-3">
              {recommendedBlocks.map((block) => (
                <div key={block.blockId} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <span className="text-2xl">{block.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{block.name}</p>
                    <p className="text-sm text-muted-foreground">{block.reason}</p>
                  </div>
                  {onAddBlock && (
                    <Button size="sm" variant="outline" onClick={() => onAddBlock(block.blockId)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Přidat
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Optional Missing Blocks */}
      {optionalBlocks.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedCategory(expandedCategory === "optional" ? null : "optional")}
          >
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-5 h-5 text-muted-foreground" />
              Volitelné bloky ({optionalBlocks.length})
            </CardTitle>
            <CardDescription>Tyto bloky mohou být užitečné v některých situacích</CardDescription>
          </CardHeader>
          {expandedCategory === "optional" && (
            <CardContent className="space-y-3">
              {optionalBlocks.map((block) => (
                <div key={block.blockId} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <span className="text-2xl">{block.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{block.name}</p>
                    <p className="text-sm text-muted-foreground">{block.reason}</p>
                  </div>
                  {onAddBlock && (
                    <Button size="sm" variant="ghost" onClick={() => onAddBlock(block.blockId)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Přidat
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* All Good Message */}
      {analysis.missingBlocks.length === 0 && analysis.warnings.length === 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Výborně! Vaše smlouva obsahuje všechny doporučené bloky a je připravena k použití.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
