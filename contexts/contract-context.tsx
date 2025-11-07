"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { ContractBlock } from "@/types/contract"

interface ContractContextType {
  // Contract state
  contractType: string
  blocks: ContractBlock[]

  // Block operations
  addBlock: (templateId: string, blockData: any) => void
  removeBlock: (blockId: string) => void
  updateBlock: (blockId: string, data: Record<string, string>) => void
  clearBlocks: () => void

  // Contract operations
  setContractType: (type: string) => void
  saveContractDraft: () => void
  loadContractDraft: () => void

  // UI state
  isDirty: boolean
  resetDirty: () => void
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contractType, setContractType] = useState<string>("work-contract")
  const [blocks, setBlocks] = useState<ContractBlock[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem("contract-draft")
      if (savedDraft) {
        try {
          const { type, blocks: savedBlocks } = JSON.parse(savedDraft)
          setContractType(type)
          setBlocks(savedBlocks)
        } catch (error) {
          console.error("Failed to load draft:", error)
        }
      }
    }
    setIsHydrated(true)
  }, [])

  const addBlock = useCallback((templateId: string, blockData: any) => {
    const newBlock: ContractBlock = {
      id: `${templateId}-${Date.now()}`,
      templateId,
      name: blockData.name,
      icon: blockData.icon,
      data: {},
      isComplete: false,
    }
    setBlocks((prev) => [...prev, newBlock])
    setIsDirty(true)
  }, [])

  const removeBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    setIsDirty(true)
  }, [])

  const updateBlock = useCallback((blockId: string, data: Record<string, string>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, data, isComplete: Object.keys(data).length > 0 } : b)),
    )
    setIsDirty(true)
  }, [])

  const clearBlocks = useCallback(() => {
    setBlocks([])
    setIsDirty(false)
  }, [])

  useEffect(() => {
    setBlocks([])
  }, [contractType])

  const saveContractDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      const draft = {
        type: contractType,
        blocks,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem("contract-draft", JSON.stringify(draft))
      setIsDirty(false)
    }
  }, [contractType, blocks])

  const loadContractDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem("contract-draft")
      if (savedDraft) {
        try {
          const { type, blocks: savedBlocks } = JSON.parse(savedDraft)
          setContractType(type)
          setBlocks(savedBlocks)
        } catch (error) {
          console.error("Failed to load draft:", error)
        }
      }
    }
  }, [])

  const resetDirty = useCallback(() => {
    setIsDirty(false)
  }, [])

  const value: ContractContextType = {
    contractType,
    blocks,
    addBlock,
    removeBlock,
    updateBlock,
    clearBlocks,
    setContractType,
    saveContractDraft,
    loadContractDraft,
    isDirty,
    resetDirty,
  }

  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Načítám...</div>
  }

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>
}

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error("useContract must be used within ContractProvider")
  }
  return context
}
