import { create } from 'zustand'
import type { ReactNode } from 'react'

interface HeaderStore {
  rightSlot: ReactNode
  setRightSlot: (slot: ReactNode) => void
}

export const useHeaderStore = create<HeaderStore>((set) => ({
  rightSlot: null,
  setRightSlot: (slot) => set({ rightSlot: slot }),
}))
