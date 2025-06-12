import type { UseChatHelpers } from '@ai-sdk/react'
import { useCallback } from 'react'
import { create } from 'zustand'

import type { Id } from '@/convex/_generated/dataModel'
import { getConvexSiteUrl } from '@/lib/utils'

const URL = `${getConvexSiteUrl()}/stream`

const useChatStore = create<{
    instances: Record<
        string,
        {
            input: string
            messages: UseChatHelpers['messages']
            status: UseChatHelpers['status']
        }
    >
    setInputValue: (id: string, value: string) => void
    addMessage: (id: string, message: UseChatHelpers['messages'][number]) => void
    setStatus: (id: string, status: UseChatHelpers['status']) => void
    updateLastMessage: (id: string, content: string) => void
}>((set, get) => ({
    instances: {},
    setInputValue: (id: string, value: string) => {
        const instances = get().instances
        set({
            instances: {
                ...instances,
                [id]: {
                    input: value,
                    messages: instances[id]?.messages || [],
                    status: instances[id]?.status || 'ready'
                }
            }
        })
    },
    addMessage: (id: string, message: UseChatHelpers['messages'][number]) => {
        const instances = get().instances
        const currentInstance = instances[id] || { input: '', messages: [], status: 'ready' }
        set({
            instances: {
                ...instances,
                [id]: {
                    ...currentInstance,
                    messages: [...currentInstance.messages, message]
                }
            }
        })
    },
    setStatus: (id: string, status: UseChatHelpers['status']) => {
        const instances = get().instances
        const currentInstance = instances[id] || { input: '', messages: [], status: 'ready' }
        set({
            instances: {
                ...instances,
                [id]: {
                    ...currentInstance,
                    status
                }
            }
        })
    },
    updateLastMessage: (id: string, content: string) => {
        const instances = get().instances
        const currentInstance = instances[id] || { input: '', messages: [], status: 'ready' }
        const messages = [...currentInstance.messages]
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.role === 'assistant') {
                messages[messages.length - 1] = {
                    ...lastMessage,
                    content,
                    parts: [{ type: 'text', text: content }]
                }
            }
        }
        set({
            instances: {
                ...instances,
                [id]: {
                    ...currentInstance,
                    messages
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
    handleSubmit: ({ id, override }: { id: string; override?: string }) => Promise<void>
}

export function useAiChat({ id = 'home' }: { id: string }): UseChatReturn {
    const { instances, setInputValue, addMessage, setStatus, updateLastMessage } = useChatStore()

    const currentInstance = instances[id] || { input: '', messages: [], status: 'ready' }

    const handleInputChange = useCallback(({ id, value }: { id: string; value: string }) => setInputValue(id, value), [setInputValue])

    const handleSubmit = useCallback(
        async ({ id, override }: { id: string; override?: string }) => {
            const messageToSend = override || instances[id].input
            if (!messageToSend.trim()) {
                return
            }
            setStatus(id, 'submitted')
            addMessage(id, {
                id: `user-${Date.now()}`,
                role: 'user',
                content: messageToSend,
                createdAt: new Date(),
                parts: [{ type: 'text', text: messageToSend }]
            })
            setInputValue(id, '')

            const assistantMessageId = `assistant-${Date.now()}`
            addMessage(id, {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                createdAt: new Date(),
                parts: [{ type: 'text', text: '' }]
            })

            try {
                const allMessages = instances[id]?.messages.map((msg) => ({ role: msg.role, content: msg.content })) || []
                allMessages.push({ role: 'user', content: messageToSend })

                const response = await fetch(URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: allMessages })
                })
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error('No reader available')
                }
                const decoder = new TextDecoder()
                let accumulatedContent = ''

                setStatus(id, 'streaming')
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }

                    const chunk = decoder.decode(value, { stream: true })

                    accumulatedContent += chunk
                    updateLastMessage(id, accumulatedContent)
                }

                setStatus(id, 'ready')
            } catch (error) {
                console.error('Streaming error:', error)
                updateLastMessage(id, 'Sorry, there was an error processing your request.')
                setStatus(id, 'ready')
            }
        },
        [addMessage, instances, setInputValue, setStatus, updateLastMessage]
    )

    return {
        id,
        input: currentInstance.input,
        messages: currentInstance.messages || [],
        status: currentInstance.status || 'ready',
        handleInputChange,
        handleSubmit
    }
}
