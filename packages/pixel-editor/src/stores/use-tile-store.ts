import { create } from 'zustand'

type TileStore = {
  opacity: number
  bgColor: string
  userPixelOpacity: number
  setOpacity: (opacity: number) => void
  toggleOpacity: () => void
  setBgColor: (bgColor: string) => void
  toggleBgColor: () => void
  setUserPixelOpacity: (opacity: number) => void
  toggleUserPixelOpacity: () => void
}

export const useTileStore = create<TileStore>(set => ({
  opacity: 1,
  bgColor: 'white',
  userPixelOpacity: 1,

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

  setUserPixelOpacity: (userPixelOpacity: number) => set({ userPixelOpacity }),

  toggleUserPixelOpacity: () =>
    set(state => ({
      userPixelOpacity: state.userPixelOpacity === 1 ? 0.5 : 1,
    })),
}))
