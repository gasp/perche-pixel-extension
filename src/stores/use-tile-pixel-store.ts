import { create } from 'zustand'
import type { PixelColor } from '@/types'

// Infinite theoretical grid stored as a Map
type TilePixelGrid = Map<string, PixelColor>

interface PixelStore {
  tilePixelGrid: TilePixelGrid
  loadPixels: (pixels: TilePixelGrid) => void
}

export const useTilePixelStore = create<PixelStore>()(set => ({
  tilePixelGrid: new Map<string, PixelColor>(),

  loadPixels: (pixels: TilePixelGrid) =>
    set(state => {
      const newGrid = new Map(state.tilePixelGrid)
      pixels.forEach((color, key) => {
        newGrid.set(key, color)
      })
      return { tilePixelGrid: newGrid }
    }),
}))
