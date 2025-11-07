"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useContract } from "@/contexts/contract-context"
import { ContractReview } from "@/components/contract-review"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import type { ContractBlock } from "@/types/contract"

function ReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { blocks: contextBlocks } = useContract()
  const [blocks, setBlocks] = useState<ContractBlock[]>([])
  const [error, setError] = useState<string | null>(null)

  const type = searchParams.get("type") || "work-contract"

  useEffect(() => {
    // This is more reliable and avoids URL encoding issues
    if (contextBlocks && contextBlocks.length > 0) {
      setBlocks(contextBlocks)
      setError(null)
    } else {
      setError("Žádné bloky k zobrazení. Vraťte se na tvorbu smlouvy.")
    }
  }, [contextBlocks])

  if (error) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive bg-destructive/5 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="font-semibold text-destructive mb-2">Chyba při načítání</h2>
                <p className="text-destructive/80 mb-6">{error}</p>
                <Button onClick={() => router.push("/builder?type=" + type)}>Zpět na tvorbu</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return <ContractReview contractType={type} blocks={blocks} />
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítám náhled...</div>}>
      <ReviewContent />
    </Suspense>
  )
}
