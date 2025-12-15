import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storageReviver, storageReplacer } from './storage-utils'

interface BrushSizeStore {
  selectedSize: number
  setSelectedSize: (size: number) => void
}

export const useBrushSizeStore = create<BrushSizeStore>()(
  persist(
    set => ({
      selectedSize: 2, // Default to smallest brush
      setSelectedSize: (size: number) => set({ selectedSize: size }),
    }),
    {
      name: 'brush-size-store',
      storage: createJSONStorage(() => localStorage, {
        reviver: storageReviver,
        replacer: storageReplacer,
      }),
      partialize: s => ({ selectedSize: s.selectedSize }),
    },
  ),
)
