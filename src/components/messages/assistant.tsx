import type { Message } from '@ai-sdk/react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { ImageMessage } from '@/components/messages/image-dialog'
import { MessageOptions } from '@/components/messages/options'
import { VoiceMessage } from '@/components/messages/voice-message'
import type { Doc } from '@/convex/_generated/dataModel'

export function AssistantMessage({ promptMessage, message, showExtras }: { promptMessage?: Doc<'messages'>; message: Message; showExtras?: boolean }) {
    if (promptMessage?.type === 'image') {
        return <ImageMessage message={promptMessage} content={message.content} />
    }

    if (promptMessage?.type === 'sound') {
        return <VoiceMessage message={promptMessage} content={message.content} />
    }

    return (
        <div className="group/text-message">
            <div className="markdown">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {showExtras && promptMessage && (
                <MessageOptions
                    className="group-hover/text-message:opacity-100"
                    message={promptMessage}
                    onCopy={() => navigator.clipboard.writeText(message.content)}
                />
            )}
        </div>
    )
}
