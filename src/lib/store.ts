import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useApiKeyStore = create<{
    apiKey: string
    setApiKey: (key: string) => void
    clearApiKey: () => void
}>()(
    persist(
        (set) => ({
            apiKey: '',
            setApiKey: (key: string) => set({ apiKey: key }),
            clearApiKey: () => set({ apiKey: '' })
        }),
        {
            name: 'api-key-storage'
        }
    )
)
