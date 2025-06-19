import type { Message } from '@ai-sdk/react'

import { AssistantMessage } from '@/components/messages/assistant'
import { UserMessage } from '@/components/messages/user'

export function Messages({ data, showOptions }: { data: Message[]; showOptions?: boolean }) {
    return data.map((message) =>
        message.role === 'user' ? (
            <UserMessage key={`user-${message.id}`} message={message} showOptions={showOptions} />
        ) : (
            <AssistantMessage key={`assistant-${message.id}`} message={message} showOptions={showOptions} />
        )
    )
}
