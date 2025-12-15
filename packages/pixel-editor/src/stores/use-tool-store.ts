import { create } from 'zustand'
import { ToolType } from '../tools/tools'

interface ToolStore {
  selectedTool: ToolType
  setSelectedTool: (tool: ToolType) => void
}

export const useToolStore = create<ToolStore>(set => ({
  selectedTool: ToolType.PENCIL,
  setSelectedTool: (tool: ToolType) => set({ selectedTool: tool }),
}))
