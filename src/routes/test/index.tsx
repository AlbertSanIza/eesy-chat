import Messages from '@/components/messages'
import { getConvexSiteUrl } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/')({
    component: RouteComponent
})

function RouteComponent() {
    const { messages, input, handleInputChange, handleSubmit } = useChat({ api: `${getConvexSiteUrl()}/stream` })
    return (
        <div className="w-full pt-8 pb-38">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-12">
                <Messages messages={messages} />
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    className="fixed bottom-0 mb-8 w-full max-w-md rounded border border-zinc-300 p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
            </form>
        </div>
    )
}
