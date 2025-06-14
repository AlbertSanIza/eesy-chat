import { MemoizedMarkdown } from '@/components/memoized-markdown'
import type { Id } from '@/convex/_generated/dataModel'
import { useAiChat } from '@/hooks/use-ai-chat'
import { cn } from '@/lib/utils'

export function Messages({ threadId }: { threadId: Id<'threads'> }) {
    const { messages } = useAiChat({ id: threadId })

    return messages.map((message) => (
        <div
            key={message.id}
            className={cn(
                message.role === 'user' ? 'ml-auto w-fit rounded-lg border bg-sidebar px-4 py-3 text-right text-[#492C61] dark:bg-[#2C2632]' : 'markdown'
            )}
        >
            <MemoizedMarkdown id={message.id} content={message.content} />
        </div>
    ))
}
