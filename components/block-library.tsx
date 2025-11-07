"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
  draggedBlock: string | null
}

export function BlockLibrary({ blocks, onDragStart, draggedBlock }: BlockLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBlocks = blocks.filter(
    (block) =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const requiredBlocks = filteredBlocks.filter((b) => b.category === "required")
  const optionalBlocks = filteredBlocks.filter((b) => b.category === "optional")

  const renderBlockGroup = (title: string, groupBlocks: Block[]) => (
    <div key={title} className="mb-6">
      <h3 className="text-sm font-bold text-muted-foreground mb-3 px-4">
        {title === "required" ? "⭐ POVINNÉ" : "✨ VOLITELNÉ"}
      </h3>
      <div className="space-y-2">
        {groupBlocks.length === 0 ? (
          <p className="text-xs text-muted-foreground px-4">Žádné bloky nenalezeny</p>
        ) : (
          groupBlocks.map((block) => (
            <Card
              key={block.id}
              draggable
              onDragStart={(e) => onDragStart(e, block.id)}
              className={`p-4 cursor-move hover:shadow-md transition-all ${
                draggedBlock === block.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{block.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{block.name}</p>
                  <p className="text-xs text-muted-foreground">{block.description}</p>
                </div>
              </div>
            </Card>
          ))
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
