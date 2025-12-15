import { create } from 'zustand'

type TileStore = {
  opacity: number
  bgColor: string
  setOpacity: (opacity: number) => void
  toggleOpacity: () => void
  setBgColor: (bgColor: string) => void
  toggleBgColor: () => void
}

export const useTileStore = create<TileStore>(set => ({
  opacity: 1,
  bgColor: 'white',

  setOpacity: (opacity: number) => set({ opacity }),

  toggleOpacity: () =>
    set(state => ({
      opacity: state.opacity === 1 ? 0.5 : 1,
    })),

  setBgColor: (bgColor: string) => set({ bgColor }),

  toggleBgColor: () =>
    set(state => ({
      bgColor: state.bgColor === 'white' ? 'red' : 'white',
    })),
}))
