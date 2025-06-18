import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

export const useStore = create<{
    user: { fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.get.threads>
    models: FunctionReturnType<typeof api.get.models>
    threadSearch: string
    selectedModel?: Doc<'models'>
    openRouterApiKey: string | null
    openAiApiKey: string | null
    elevenLabsApiKey: string | null
    setUser: ({ fullName, imageUrl }: { fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.get.threads>) => void
    setModels: (models: FunctionReturnType<typeof api.get.models>) => void
    setThreadSearch: (search: string) => void
    setSelectedModel: (modelId: Doc<'models'>) => void
    setOpenRouterApiKey: (apiKey: string) => void
    setOpenAiApiKey: (apiKey: string) => void
    setElevenLabsApiKey: (apiKey: string) => void
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
            elevenLabsApiKey: null,
            setUser: ({ fullName, imageUrl }) => {
                set({ user: { fullName, imageUrl } })
            },
            setThreads: (threads: FunctionReturnType<typeof api.get.threads>) => {
                set({ threads })
            },
            setModels: (models: FunctionReturnType<typeof api.get.models>) => {
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
            },
            setElevenLabsApiKey: (apiKey: string) => {
                set({ elevenLabsApiKey: apiKey })
            }
        }),
        { name: 'eesy-chat-store' }
    )
)
