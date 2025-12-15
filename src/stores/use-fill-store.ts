import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storageReviver, storageReplacer } from './storage-utils'

export const FillMode = {
  COLOR: 'color',
  TEXTURE: 'texture',
} as const

export type FillMode = (typeof FillMode)[keyof typeof FillMode]

interface FillStore {
  selectedColorId: number
  setSelectedColorId: (colorId: number) => void
  selectedTextureId: number
  setSelectedTextureId: (textureId: number) => void
  fillMode: FillMode
  setFillMode: (fillMode: FillMode) => void
}

export const useFillStore = create<FillStore>()(
  persist(
    set => ({
      selectedColorId: 1, // Default to Black (color id 1)
      setSelectedColorId: (colorId: number) => {
        set({ fillMode: FillMode.COLOR })
        set({ selectedColorId: colorId })
      },
      selectedTextureId: 0, // Default to first texture
      setSelectedTextureId: (textureId: number) => {
        set({ fillMode: FillMode.TEXTURE })
        set({ selectedTextureId: textureId })
      },
      fillMode: FillMode.COLOR,
      setFillMode: (fillMode: FillMode) => set({ fillMode }),
    }),
    {
      name: 'fill-store',
      storage: createJSONStorage(() => localStorage, {
        reviver: storageReviver,
        replacer: storageReplacer,
      }),
      partialize: s => ({
        selectedColorId: s.selectedColorId,
        selectedTextureId: s.selectedTextureId,
        fillMode: s.fillMode,
      }),
    },
  ),
)
