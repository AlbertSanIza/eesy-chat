import { type UseChatHelpers } from '@ai-sdk/react'
import { LoaderCircleIcon } from 'lucide-react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { cn } from '@/lib/utils'

export default function Messages({ messages, status }: { messages: UseChatHelpers['messages']; status: UseChatHelpers['status'] }) {
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-12">
            {messages.map((message) => (
                <div key={message.id} className={cn(message.role === 'user' ? 'ml-auto w-fit rounded-lg border bg-sidebar px-3 py-2 text-right' : 'markdown')}>
                    <MemoizedMarkdown id={message.id} content={message.content} />
                </div>
            ))}
            {(status === 'submitted' || status === 'streaming') && <LoaderCircleIcon className="size-4 animate-spin opacity-20" />}
        </div>
    )
}
