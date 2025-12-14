"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, GripVertical } from "lucide-react"

interface Block {
  id: string
  name: string
  category: "required" | "optional"
  icon: string
  description: string
}

interface BlockLibraryProps {
  blocks: Block[]
  onDragStart: (e: React.DragEvent, blockId: string) => void
  onBlockClick?: (blockId: string) => void
  draggedBlock: string | null
  addedBlocks?: string[]
}

export function BlockLibrary({ blocks, onDragStart, onBlockClick, draggedBlock, addedBlocks = [] }: BlockLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBlocks = blocks.filter(
    (block) =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const requiredBlocks = filteredBlocks.filter((b) => b.category === "required")
  const optionalBlocks = filteredBlocks.filter((b) => b.category === "optional")

  const handleBlockClick = (blockId: string) => {
    if (onBlockClick) {
      onBlockClick(blockId)
    }
  }

  const isBlockAdded = (blockId: string) => {
    return addedBlocks.some((id) => id.startsWith(blockId))
  }

  const renderBlockGroup = (title: string, groupBlocks: Block[]) => (
    <div key={title} className="mb-6">
      <h3 className="text-sm font-bold text-muted-foreground mb-3 px-4">
        {title === "required" ? "⭐ POVINNÉ" : "✨ VOLITELNÉ"}
      </h3>
      <div className="space-y-2">
        {groupBlocks.length === 0 ? (
          <p className="text-xs text-muted-foreground px-4">Žádné bloky nenalezeny</p>
        ) : (
          groupBlocks.map((block) => {
            const added = isBlockAdded(block.id)
            return (
              <Card
                key={block.id}
                draggable
                onDragStart={(e) => onDragStart(e, block.id)}
                onClick={() => handleBlockClick(block.id)}
                className={`p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group ${
                  draggedBlock === block.id ? "opacity-50" : ""
                } ${added ? "border-green-500 bg-green-50/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{block.icon}</span>
                    <GripVertical className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{block.name}</p>
                      {added && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Přidáno
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{block.description}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <div className="w-64 border-r border-border bg-card rounded-lg p-4 overflow-y-auto flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">Knihovna kostek</h2>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Hledat bloky..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderBlockGroup("required", requiredBlocks)}
        {renderBlockGroup("optional", optionalBlocks)}
      </div>
    </div>
  )
}
