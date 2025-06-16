import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

export const useStore = create<{
    user: { fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.threads.list>
    models: FunctionReturnType<typeof api.models.list>
    threadSearch: string
    selectedModel?: Doc<'models'>
    openRouterApiKey: string | null
    openAiApiKey: string | null
    setUser: ({ fullName, imageUrl }: { fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.threads.list>) => void
    setModels: (models: FunctionReturnType<typeof api.models.list>) => void
    setThreadSearch: (search: string) => void
    setSelectedModel: (modelId: Doc<'models'>) => void
    setOpenRouterApiKey: (apiKey: string) => void
    setOpenAiApiKey: (apiKey: string) => void
}>()(
    persist(
        (set) => ({
            user: {},
            threads: [],
            models: [],
            threadSearch: '',
            selectedModel: undefined,
            openRouterApiKey: null,
            openAiApiKey: null,
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
            setSelectedModel: (model: Doc<'models'>) => {
                set({ selectedModel: model })
            },
            setOpenRouterApiKey: (apiKey: string) => {
                set({ openRouterApiKey: apiKey })
            },
            setOpenAiApiKey: (apiKey: string) => {
                set({ openAiApiKey: apiKey })
            }
        }),
        { name: 'eesy-chat-store' }
    )
)
