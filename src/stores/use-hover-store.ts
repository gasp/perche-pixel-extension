import { create } from 'zustand'
import type { PixelCoord } from '@/types'

interface HoverStore {
  hoveredPixels: PixelCoord[]
  setHoveredPixels: (pixels: PixelCoord[]) => void
  clearHoveredPixels: () => void
}

export const useHoverStore = create<HoverStore>(set => ({
  hoveredPixels: [],
  setHoveredPixels: (pixels: PixelCoord[]) => set({ hoveredPixels: pixels }),
  clearHoveredPixels: () => set({ hoveredPixels: [] }),
}))
