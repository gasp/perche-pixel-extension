import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storageReviver, storageReplacer } from './storage-utils'

export type PaletteId =
  | 'tool'
  | 'color'
  | 'texture'
  | 'brush-size'
  | 'tile'
  | 'stamp'

type PaletteState = {
  position: { x: number; y: number }
  zIndex: number
  isCollapsed: boolean
}

type PaletteStore = {
  palettes: Record<PaletteId, PaletteState>
  highestZIndex: number
  setPosition: (id: PaletteId, position: { x: number; y: number }) => void
  bringToFront: (id: PaletteId) => void
  toggleCollapsed: (id: PaletteId) => void
}

const BASE_Z_INDEX = 10

const defaultPalettes: Record<PaletteId, PaletteState> = {
  tool: {
    position: { x: 20, y: 20 },
    zIndex: BASE_Z_INDEX + 5,
    isCollapsed: false,
  },
  color: {
    position: { x: 60, y: 20 },
    zIndex: BASE_Z_INDEX + 4,
    isCollapsed: false,
  },
  texture: {
    position: { x: 60, y: 100 },
    zIndex: BASE_Z_INDEX + 3,
    isCollapsed: false,
  },
  'brush-size': {
    position: { x: 20, y: 120 },
    zIndex: BASE_Z_INDEX + 2,
    isCollapsed: false,
  },
  tile: {
    position: { x: 60, y: 180 },
    zIndex: BASE_Z_INDEX + 1,
    isCollapsed: false,
  },
  stamp: {
    position: { x: 60, y: 220 },
    zIndex: BASE_Z_INDEX,
    isCollapsed: false,
  },
}

export const usePaletteStore = create<PaletteStore>()(
  persist(
    set => ({
      palettes: defaultPalettes,
      highestZIndex: BASE_Z_INDEX + 4,

      setPosition: (id: PaletteId, position: { x: number; y: number }) =>
        set(state => ({
          palettes: {
            ...state.palettes,
            [id]: {
              ...state.palettes[id],
              position,
            },
          },
        })),

      bringToFront: (id: PaletteId) =>
        set(state => {
          const newHighestZIndex = state.highestZIndex + 1
          return {
            highestZIndex: newHighestZIndex,
            palettes: {
              ...state.palettes,
              [id]: {
                ...state.palettes[id],
                zIndex: newHighestZIndex,
              },
            },
          }
        }),

      toggleCollapsed: (id: PaletteId) =>
        set(state => ({
          palettes: {
            ...state.palettes,
            [id]: {
              ...state.palettes[id],
              isCollapsed: !state.palettes[id].isCollapsed,
            },
          },
        })),
    }),
    {
      name: 'palette-store',
      storage: createJSONStorage(() => localStorage, {
        reviver: storageReviver,
        replacer: storageReplacer,
      }),
      partialize: s => ({
        palettes: s.palettes,
        highestZIndex: s.highestZIndex,
      }),
    },
  ),
)
