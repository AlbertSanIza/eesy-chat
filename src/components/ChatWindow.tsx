import { useMutation, useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import React, { useCallback, useRef, useState } from 'react'
import MessageItem from './MessageItem'
import { ServerMessage } from './ServerMessage'

export default function ChatWindow({ threadId }: { threadId: string }) {
    const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set())
    const [isStreaming, setIsStreaming] = useState(false)
    const messages = useQuery(api.messages.findAll, { threadId: threadId as Id<'threads'> })
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const clearAllMessages = useMutation(api.messages.clearMessages)

    const focusInput = useCallback(() => {
        inputRef.current?.focus()
    }, [])

    const scrollToBottom = useCallback(
        (behavior: ScrollBehavior = 'smooth') => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior })
            }
        },
        [messagesEndRef]
    )

    const sendMessage = useMutation(api.messages.sendMessage)

    if (!messages) return null

    return (
        <div className="flex h-full flex-1 flex-col bg-white">
            <div ref={messageContainerRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                <div className="mx-auto w-full max-w-5xl space-y-6">
                    {messages.length === 0 && <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>}
                    {messages.map((message) => (
                        <React.Fragment key={message._id}>
                            <MessageItem message={message} isUser={true}>
                                {message.prompt}
                            </MessageItem>
                            <MessageItem message={message} isUser={false}>
                                <ServerMessage
                                    message={message}
                                    isDriven={drivenIds.has(message._id)}
                                    stopStreaming={() => {
                                        setIsStreaming(false)
                                        focusInput()
                                    }}
                                    scrollToBottom={scrollToBottom}
                                />
                            </MessageItem>
                        </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6 md:px-8 lg:px-12">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        if (!inputValue.trim()) return

                        setInputValue('')

                        const chatId = await sendMessage({
                            prompt: inputValue,
                            threadId: threadId as Id<'threads'>
                        })

                        setDrivenIds((prev) => {
                            prev.add(chatId)
                            return prev
                        })

                        setIsStreaming(true)
                    }}
                    className="mx-auto w-full max-w-5xl"
                >
                    <div className="flex items-center gap-3">
                        <input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isStreaming}
                            className="flex-1 rounded-lg border border-gray-300 p-4 text-base text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isStreaming}
                            className="rounded-lg bg-blue-600 px-8 py-4 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200"
                        >
                            Send
                        </button>
                        <button
                            type="button"
                            disabled={messages.length < 2 || isStreaming}
                            onClick={() => {
                                clearAllMessages()
                                setInputValue('')
                                setIsStreaming(false)
                                focusInput()
                            }}
                            className="rounded-lg bg-red-600 px-8 py-4 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-400 disabled:text-gray-200"
                        >
                            Clear Chat
                        </button>
                    </div>
                    {isStreaming && <div className="mt-2 text-xs text-gray-500">AI is responding...</div>}
                </form>
            </div>
        </div>
    )
}
