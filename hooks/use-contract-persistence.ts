"use client"

import { useEffect, useCallback } from "react"
import { useContract } from "@/contexts/contract-context"

export function useContractPersistence() {
  const { isDirty, saveContractDraft } = useContract()

  // Auto-save on interval
  useEffect(() => {
    if (!isDirty) return

    const interval = setInterval(() => {
      saveContractDraft()
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [isDirty, saveContractDraft])

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty) {
        saveContractDraft()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty, saveContractDraft])

  // Manual save
  const manualSave = useCallback(() => {
    saveContractDraft()
  }, [saveContractDraft])

  return { manualSave }
}
