import type { Message } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'

export function AssistantMessage({ message }: { message: Message }) {
    return (
        <div className="markdown">
            <MemoizedMarkdown id={message.id} content={message.content} />
        </div>
    )
}
