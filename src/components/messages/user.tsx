import type { Message } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'

export function UserMessage({ message }: { message: Message }) {
    return (
        <div className="ml-auto w-fit rounded-lg border bg-sidebar px-4 py-3 text-right text-[#492C61] dark:bg-[#2C2632] dark:text-[#F2EBFA]">
            <MemoizedMarkdown id={message.id} content={message.content} />
        </div>
    )
}
