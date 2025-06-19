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
    threadSearch: string
    openRouterApiKey: string | null
    openAiApiKey: string | null
    elevenLabsApiKey: string | null
    setUser: ({ isSignedIn, fullName, imageUrl }: { isSignedIn: boolean; fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.get.threads>) => void
    setModels: (models: FunctionReturnType<typeof api.get.models>) => void
    setModel: (modelId: Doc<'models'>) => void
    setThreadSearch: (search: string) => void
    setOpenRouterApiKey: (apiKey: string) => void
    setOpenAiApiKey: (apiKey: string) => void
    setElevenLabsApiKey: (apiKey: string) => void
}>()(
    persist(
        (set) => ({
            user: { isSignedIn: false },
            threads: [],
            models: [],
            model: undefined,
            threadSearch: '',
            openRouterApiKey: null,
            openAiApiKey: null,
            elevenLabsApiKey: null,
            setUser: ({ isSignedIn, fullName, imageUrl }) => {
                set({ user: { isSignedIn, fullName, imageUrl } })
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
            setModel: (model: Doc<'models'>) => {
                set({ model })
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
