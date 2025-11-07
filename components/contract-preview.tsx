"use client"
import type { ContractBlock } from "@/types/contract"

interface ContractPreviewProps {
  blocks: ContractBlock[]
}

export function ContractPreview({ blocks }: ContractPreviewProps) {
  return (
    <div className="w-80 bg-card rounded-lg border border-border overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4">Náhled smlouvy</h2>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold text-center text-lg mb-4">SMLOUVA O DÍLO</h3>
          </div>

          {blocks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Přidej kostky, aby se objevily v náhledu</p>
          ) : (
            <>
              {blocks.map((block) => {
                if (!block.isComplete) return null

                return (
                  <div key={block.id} className="border-b border-border pb-3">
                    {block.templateId === "parties" && (
                      <div>
                        <p className="font-semibold mb-2">Smluvní strany:</p>
                        <p className="text-xs ml-2">1. {block.data.party1Name || "Neznámá strana"}</p>
                        <p className="text-xs ml-2">2. {block.data.party2Name || "Neznámá strana"}</p>
                      </div>
                    )}
                    {block.templateId === "scope" && (
                      <div>
                        <p className="font-semibold mb-2">Předmět díla:</p>
                        <p className="text-xs ml-2">{block.data.scopeDescription}</p>
                      </div>
                    )}
                    {block.templateId === "payment" && (
                      <div>
                        <p className="font-semibold mb-2">Cena a splatnost:</p>
                        <p className="text-xs ml-2">{block.data.amount} Kč</p>
                        <p className="text-xs ml-2">{block.data.paymentTerms}</p>
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs mb-3">Podpisy stran:</p>
                <div className="flex justify-between gap-2">
                  <div className="text-xs flex-1">
                    <p className="border-b border-foreground mb-2 h-6"></p>
                    <p>Podpis 1.</p>
                  </div>
                  <div className="text-xs flex-1">
                    <p className="border-b border-foreground mb-2 h-6"></p>
                    <p>Podpis 2.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
