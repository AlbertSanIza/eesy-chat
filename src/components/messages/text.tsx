import type { Message } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { MessageOptions } from '@/components/messages/options'
import type { Id } from '@/convex/_generated/dataModel'

export function TextMessage({
    threadId,
    provider,
    message,
    showOptions
}: {
    threadId?: Id<'threads'>
    provider?: string
    message: Message
    showOptions?: boolean
}) {
    return (
        <div className="group/text-message">
            <div className="markdown">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {showOptions && (
                <MessageOptions
                    className="group-hover/text-message:opacity-100"
                    threadId={threadId}
                    provider={provider}
                    messageId={message.id as Id<'messages'>}
                    onCopy={() => navigator.clipboard.writeText(message.content)}
                />
            )}
        </div>
    )
}
