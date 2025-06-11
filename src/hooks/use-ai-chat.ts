import type { UseChatHelpers } from '@ai-sdk/react'
import { useCallback } from 'react'
import { create } from 'zustand'

import type { Id } from '@/convex/_generated/dataModel'
// import { getConvexSiteUrl } from '@/lib/utils'

// const URL = `${getConvexSiteUrl()}/stream`

const useChatStore = create<{
    instances: Record<
        string,
        {
            input: string
            messages: UseChatHelpers['messages']
        }
    >
    setInputValue: (id: string, value: string) => void
    addMessage: (id: string, message: UseChatHelpers['messages'][number]) => void
}>((set, get) => ({
    instances: {},
    setInputValue: (id: string, value: string) => {
        const instances = get().instances
        set({
            instances: {
                ...instances,
                [id]: {
                    input: value,
                    messages: instances[id]?.messages || []
                }
            }
        })
    },
    addMessage: (id: string, message: UseChatHelpers['messages'][number]) => {
        const instances = get().instances
        const currentInstance = instances[id] || { input: '', messages: [] }
        set({
            instances: {
                ...instances,
                [id]: {
                    ...currentInstance,
                    messages: [...currentInstance.messages, message]
                }
            }
        })
    }
}))

export interface UseChatReturn {
    id: Id<'threads'> | string
    input: string
    messages: UseChatHelpers['messages']
    status: UseChatHelpers['status']
    handleInputChange: ({ id, value }: { id: string; value: string }) => void
    handleSubmit: ({ id, override }: { id: string; override?: string }) => void
}

export function useAiChat({ id = 'home' }: { id: string }): UseChatReturn {
    const { instances, setInputValue, addMessage } = useChatStore()

    const currentInstance = instances[id] || { input: '', messages: [] }

    const handleInputChange = useCallback(({ id, value }: { id: string; value: string }) => setInputValue(id, value), [setInputValue])

    const handleSubmit = useCallback(
        ({ id, override }: { id: string; override?: string }) => {
            const messageToSend = override || instances[id].input
            if (!messageToSend.trim()) {
                return
            }
            addMessage(id, {
                id: `user-${Date.now()}`,
                role: 'user',
                content: messageToSend,
                createdAt: new Date(),
                parts: [{ type: 'text', text: messageToSend }]
            })
            setInputValue(id, '')
            // TODO: Add logic to send message to AI and handle streaming response
        },
        [addMessage, instances, setInputValue]
    )

    return {
        id,
        input: currentInstance.input,
        messages: currentInstance.messages || [],
        status: 'ready',
        handleInputChange,
        handleSubmit
    }
}
