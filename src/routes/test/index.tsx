import { getConvexSiteUrl } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/')({
    component: RouteComponent
})

function RouteComponent() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({ api: `${getConvexSiteUrl()}/stream` })
    return (
        <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
            {messages.map((message) => (
                <div key={message.id} className="whitespace-pre-wrap">
                    {message.role === 'user' ? 'User: ' : 'AI: '}
                    {message.parts.map((part, i) => {
                        switch (part.type) {
                            case 'text':
                                return <div key={`${message.id}-${i}`}>{part.text}</div>
                        }
                    })}
                </div>
            ))}
            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-30 mb-8 w-full max-w-md rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    )
}
