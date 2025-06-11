import { type UseChatHelpers } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { cn } from '@/lib/utils'

export default function Messages({ messages }: { messages: UseChatHelpers['messages'] }) {
    return messages.map((message) => (
        <div key={message.id} className={cn(message.role === 'user' ? 'ml-auto w-fit rounded-lg border bg-sidebar px-3 py-2 text-right' : 'markdown')}>
            <MemoizedMarkdown id={message.id} content={message.content} />
        </div>
    ))
}
