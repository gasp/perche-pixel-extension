import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storageReviver, storageReplacer } from './storage-utils'
import type { PixelColor } from '@/types'

// Infinite theoretical grid stored as a Map
type UserPixelGrid = Map<string, PixelColor>

// Helper to create key for infinite grid
function gridKey(x: number, y: number): string {
  return `${x},${y}`
}

interface UserPixelStore {
  userPixelGrid: UserPixelGrid
  setPixel: (x: number, y: number, color: PixelColor) => void
  deletePixel: (x: number, y: number) => void
  getPixel: (x: number, y: number) => PixelColor | undefined
  clearPixels: () => void
}

export const useUserPixelStore = create<UserPixelStore>()(
  persist(
    (set, get) => ({
      userPixelGrid: new Map<string, PixelColor>(),

      setPixel: (x: number, y: number, color: PixelColor) =>
        set(state => {
          const newGrid = new Map(state.userPixelGrid)
          if (color === null) {
            newGrid.delete(gridKey(x, y))
          } else {
            newGrid.set(gridKey(x, y), color)
          }
          return { userPixelGrid: newGrid }
        }),

      deletePixel: (x: number, y: number) =>
        set(state => {
          const newGrid = new Map(state.userPixelGrid)
          newGrid.delete(gridKey(x, y))
          return { userPixelGrid: newGrid }
        }),

      getPixel: (x: number, y: number) => {
        const grid = get().userPixelGrid
        return grid.get(gridKey(x, y))
      },

      loadPixels: (pixels: Map<string, PixelColor>) =>
        set(state => {
          const newGrid = new Map(state.userPixelGrid)
          pixels.forEach((color, key) => {
            newGrid.set(key, color)
          })
          return { userPixelGrid: newGrid }
        }),
      clearPixels: () => set({ userPixelGrid: new Map<string, PixelColor>() }),
    }),
    {
      name: 'user-pixel-store',
      storage: createJSONStorage(() => localStorage, {
        reviver: storageReviver,
        replacer: storageReplacer,
      }),
      partialize: s => ({ userPixelGrid: s.userPixelGrid }),
    },
  ),
)
