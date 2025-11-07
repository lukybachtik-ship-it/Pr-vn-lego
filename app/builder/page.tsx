"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { LegoBuilder } from "@/components/lego-builder"

function BuilderContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "work-contract"

  return <LegoBuilder contractType={type} />
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div>Načítám...</div>}>
      <BuilderContent />
    </Suspense>
  )
}
