import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { idbStorage } from '@/lib/store/idb-storage'

interface Thread {
    id: string
    title: string
    messages: Array<{
        id: string
        role: 'user' | 'assistant'
        content: string
        timestamp: number
    }>
    createdAt: number
    updatedAt: number
}

interface AppState {
    threads: Record<string, Thread>
    addThread: (thread: Thread) => void
    updateThread: (id: string, thread: Partial<Thread>) => void
    deleteThread: (id: string) => void
    getThread: (id: string) => Thread | undefined
}

export const useEesyChatStore = create<AppState>()(
    persist(
        (set, get) => ({
            threads: {},
            addThread: (thread: Thread) =>
                set((state) => ({
                    threads: { ...state.threads, [thread.id]: thread }
                })),
            updateThread: (id: string, updates: Partial<Thread>) =>
                set((state) => ({
                    threads: {
                        ...state.threads,
                        [id]: { ...state.threads[id], ...updates, updatedAt: Date.now() }
                    }
                })),
            deleteThread: (id: string) =>
                set((state) => {
                    const newThreads = { ...state.threads }
                    delete newThreads[id]
                    return { threads: newThreads }
                }),
            getThread: (id: string) => get().threads[id]
        }),
        {
            name: 'app-store',
            storage: createJSONStorage(() => idbStorage)
        }
    )
)
