import { create } from 'zustand'

export const useChat = create<{ drivenIds: Set<string>; updateDrivenIds: (id: string) => void }>((set, get) => ({
    drivenIds: new Set(),
    updateDrivenIds: (id: string) => {
        const newDrivenIds = new Set(get().drivenIds)
        newDrivenIds.add(id)
        set({ drivenIds: newDrivenIds })
    }
}))

export const useChatStore = create<{ drivenIds: Set<string>; updateDrivenIds: (id: string) => void }>((set, get) => ({
    drivenIds: new Set(),
    updateDrivenIds: (id: string) => {
        const newDrivenIds = new Set(get().drivenIds)
        newDrivenIds.add(id)
        set({ drivenIds: newDrivenIds })
    }
}))
