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
    setInputValue: (threadId: string, value: string) => {
        const instances = get().instances
        set({
            instances: {
                ...instances,
                [threadId]: {
                    input: value,
                    messages: instances[threadId]?.messages || []
                }
            }
        })
    },
    addMessage: (treadId: string, message: UseChatHelpers['messages'][number]) => {
        const instances = get().instances
        const currentInstance = instances[treadId] || { input: '', messages: [] }
        set({
            instances: {
                ...instances,
                [treadId]: {
                    ...currentInstance,
                    messages: [...currentInstance.messages, message]
                }
            }
        })
    }
}))

export interface UseChatProps {
    threadId: string
    url?: string
}

export interface UseChatReturn {
    threadId: Id<'threads'> | string
    input: string
    messages: UseChatHelpers['messages']
    status: UseChatHelpers['status']
    handleInputChange: (value: string) => void
    handleSubmit: ({ threadId, override }: { threadId: string; override?: string }) => void
}

export function useAiChat({ threadId = 'home' }: UseChatProps): UseChatReturn {
    const { instances, setInputValue, addMessage } = useChatStore()

    const currentInstance = instances[threadId] || { input: '', messages: [] }

    const handleInputChange = useCallback((value: string) => setInputValue(threadId, value), [threadId, setInputValue])

    const handleSubmit = useCallback(
        ({ threadId, override }: { threadId: string; override?: string }) => {
            const messageToSend = override || instances[threadId].input
            if (!messageToSend.trim()) {
                return
            }
            addMessage(threadId, {
                id: `user-${Date.now()}`,
                role: 'user',
                content: messageToSend,
                createdAt: new Date(),
                parts: [{ type: 'text', text: messageToSend }]
            })
            setInputValue(threadId, '')
            // TODO: Add logic to send message to AI and handle streaming response
        },
        [addMessage, instances, setInputValue]
    )

    return {
        threadId,
        input: currentInstance.input,
        messages: currentInstance.messages || [],
        status: 'ready',
        handleInputChange,
        handleSubmit
    }
}
