import type { Message } from '@ai-sdk/react'

import { AssistantMessage } from '@/components/messages/assistant'
import { UserMessage } from '@/components/messages/user'

export function Messages({ data }: { data: Message[] }) {
    return data.map((message) =>
        message.role === 'user' ? (
            <UserMessage key={`user-${message.id}`} message={message} />
        ) : (
            <AssistantMessage key={`assistant-${message.id}`} message={message} />
        )
    )
}
