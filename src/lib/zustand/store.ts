import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

export const useStore = create<{
    user: { isSignedIn: boolean; fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.get.threads>
    models: FunctionReturnType<typeof api.get.models>
    model?: Doc<'models'>
    key: {
        openRouter: string
        openAi: string
        elevenLabs: string
    }
    threadSearch: string
    setUser: ({ isSignedIn, fullName, imageUrl }: { isSignedIn: boolean; fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.get.threads>) => void
    setModels: (models: FunctionReturnType<typeof api.get.models>) => void
    setModel: (modelId: Doc<'models'>) => void
    setKey: (key: { openRouter?: string; openAi?: string; elevenLabs?: string }) => void
    setThreadSearch: (search: string) => void
}>()(
    persist(
        (set) => ({
            user: { isSignedIn: false },
            threads: [],
            models: [],
            model: undefined,
            key: {
                openRouter: '',
                openAi: '',
                elevenLabs: ''
            },
            threadSearch: '',
            setUser: ({ isSignedIn, fullName, imageUrl }) => {
                set({ user: { isSignedIn, fullName, imageUrl } })
            },
            setThreads: (threads: FunctionReturnType<typeof api.get.threads>) => {
                set({ threads })
            },
            setModels: (models: FunctionReturnType<typeof api.get.models>) => {
                set({ models })
            },
            setModel: (model: Doc<'models'>) => {
                set({ model })
            },
            setKey: (key: { openRouter?: string; openAi?: string; elevenLabs?: string }) => {
                set((state) => ({ key: { ...state.key, ...key } }))
            },
            setThreadSearch: (search: string) => {
                set({ threadSearch: search })
            }
        }),
        { name: 'eesy-chat-store' }
    )
)
