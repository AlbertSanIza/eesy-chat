import type { UseChatHelpers } from '@ai-sdk/react'
import { useCallback } from 'react'
import { create } from 'zustand'

import type { Id } from '@/convex/_generated/dataModel'

const useChatStore = create<{
    instances: Record<
        string,
        {
            input: string
        }
    >
    setInputValue: (id: string, value: string) => void
}>((set, get) => ({
    instances: {},
    setInputValue: (id: string, value: string) => {
        const instances = get().instances
        set({
            instances: {
                ...instances,
                [id]: { input: value }
            }
        })
    }
}))

export interface UseChatProps {
    id: string
    url?: string
}

export interface UseChatReturn {
    id: Id<'threads'> | string
    url: string
    input: string
    status: UseChatHelpers['status']
    handleInputChange: (value: string) => void
    handleSubmit: (override: string) => void
}

export function useAiChat({ id = 'home', url = '' }: UseChatProps): UseChatReturn {
    const { instances, setInputValue } = useChatStore()

    const currentInstance = instances[id] || { input: '' }

    const handleInputChange = useCallback((value: string) => setInputValue(id, value), [id, setInputValue])

    const handleSubmit = useCallback(
        (override: string) => {
            const messageToSend = override || currentInstance.input

            if (!messageToSend.trim()) {
                return
            }

            setInputValue(id, '')
        },
        [currentInstance.input, id, setInputValue]
    )

    return { id, url, input: currentInstance.input, status: 'ready', handleInputChange, handleSubmit }
}
