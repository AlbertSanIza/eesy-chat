import type { FunctionReturnType } from 'convex/server'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { api } from '@/convex/_generated/api'

export const useStore = create<{
    user: { fullName?: string; imageUrl?: string }
    threads: FunctionReturnType<typeof api.threads.findAll>
    threadSearch: string
    selectedModel: string
    models: { id: string; label: string }[]
    setUser: ({ fullName, imageUrl }: { fullName?: string; imageUrl?: string }) => void
    setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => void
    setThreadSearch: (search: string) => void
    setSelectedModel: (modelId: string) => void
}>()(
    persist(
        (set) => ({
            user: {},
            threads: [],
            threadSearch: '',
            selectedModel: 'openai/gpt-4.1-nano',
            models: [
                { id: 'openai/gpt-4.1-nano', label: 'OpenAI: GPT-4.1' },
                { id: 'anthropic/claude-3-haiku', label: 'Anthropic: Claude 3 Haiku' },
                { id: 'google/gemini-2.5-flash-preview-05-2024', label: 'Google: Gemini 2.5 Flash' }
            ],
            setUser: ({ fullName, imageUrl }) => {
                set({ user: { fullName, imageUrl } })
            },
            setThreads: (threads: FunctionReturnType<typeof api.threads.findAll>) => {
                set({ threads })
            },
            setThreadSearch: (search: string) => {
                set({ threadSearch: search })
            },
            setSelectedModel: (modelId: string) => {
                set({ selectedModel: modelId })
            }
        }),
        {
            name: 'eesy-chat-store'
        }
    )
)
