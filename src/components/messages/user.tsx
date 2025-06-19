import type { Message } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { MessageOptions } from '@/components/messages/options'

export function UserMessage({ message, showOptions }: { message: Message; showOptions?: boolean }) {
    return (
        <div className="group/user-message flex flex-col items-end gap-1.5">
            <div className="ml-auto w-fit rounded-lg border bg-sidebar px-4 py-3 text-[#492C61] dark:bg-[#2C2632] dark:text-[#F2EBFA]">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {showOptions && <MessageOptions className="group-hover/user-message:opacity-100" onCopy={() => navigator.clipboard.writeText(message.content)} />}
        </div>
    )
}
