import { useChat } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import type { Id } from '@/convex/_generated/dataModel'
import { cn, getConvexSiteUrl } from '@/lib/utils'

export function Messages({ threadId }: { threadId: Id<'threads'> }) {
    const { messages } = useChat({ id: threadId, api: `${getConvexSiteUrl()}/stream`, initialMessages: [] })

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-12">
            {messages.map((message) => (
                <div key={message.id} className={cn(message.role === 'user' ? 'ml-auto w-fit rounded-lg border bg-sidebar px-3 py-2 text-right' : 'markdown')}>
                    <MemoizedMarkdown id={message.id} content={message.content} />
                </div>
            ))}
        </div>
    )
}
