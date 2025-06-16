import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'

export const useStore = create<{
    user: { fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.threads.list>
    models: FunctionReturnType<typeof api.models.list>
    threadSearch: string
    selectedModel: string
    openRouterApiKey: string | null
    setUser: ({ fullName, imageUrl }: { fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.threads.list>) => void
    setModels: (models: FunctionReturnType<typeof api.models.list>) => void
    setThreadSearch: (search: string) => void
    setSelectedModel: (modelId: string) => void
    setOpenRouterApiKey: (apiKey: string) => void
}>()(
    persist(
        (set) => ({
            user: {},
            threads: [],
            models: [],
            threadSearch: '',
            selectedModel: 'openai/gpt-4.1-nano',
            openRouterApiKey: null,
            setUser: ({ fullName, imageUrl }) => {
                set({ user: { fullName, imageUrl } })
            },
            setThreads: (threads: FunctionReturnType<typeof api.threads.list>) => {
                set({ threads })
            },
            setModels: (models: FunctionReturnType<typeof api.models.list>) => {
                set({ models })
            },
            setThreadSearch: (search: string) => {
                set({ threadSearch: search })
            },
            setSelectedModel: (openRouterId: string) => {
                set({ selectedModel: openRouterId })
            },
            setOpenRouterApiKey: (apiKey: string) => {
                set({ openRouterApiKey: apiKey })
            }
        }),
        { name: 'eesy-chat-store' }
    )
)
