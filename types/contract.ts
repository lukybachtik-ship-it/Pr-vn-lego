export interface ContractBlock {
  id: string
  templateId: string
  name: string
  icon: string
  data: Record<string, string>
  isComplete: boolean
}

export interface ContractData {
  type: string
  blocks: ContractBlock[]
  createdAt: Date
  updatedAt: Date
}
