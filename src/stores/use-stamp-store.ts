import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storageReviver, storageReplacer } from './storage-utils'

interface StampStore {
  selectedStampId: number
  setSelectedStampId: (stampId: number) => void
}

export const useStampStore = create<StampStore>()(
  persist(
    set => ({
      selectedStampId: 0, // Default to first stamp
      setSelectedStampId: (stampId: number) =>
        set({ selectedStampId: stampId }),
    }),
    {
      name: 'stamp-store',
      storage: createJSONStorage(() => localStorage, {
        reviver: storageReviver,
        replacer: storageReplacer,
      }),
      partialize: s => ({
        selectedStampId: s.selectedStampId,
      }),
    },
  ),
)
