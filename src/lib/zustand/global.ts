import { create } from 'zustand'

export const useGlobal = create<{
    searchCommandDialogOpen: boolean
    setSearchCommandDialogOpen: (open: boolean) => void
}>((set) => ({
    searchCommandDialogOpen: false,
    setSearchCommandDialogOpen: (open) => set({ searchCommandDialogOpen: open })
}))
