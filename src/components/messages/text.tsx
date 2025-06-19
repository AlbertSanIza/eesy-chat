import type { Message } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { MessageOptions } from '@/components/messages/options'

export function TextMessage({ message, showOptions }: { message: Message; showOptions?: boolean }) {
    return (
        <div className="group/text-message">
            <div className="markdown">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {showOptions && <MessageOptions className="group-hover/text-message:opacity-100" onCopy={() => navigator.clipboard.writeText(message.content)} />}
        </div>
    )
}
