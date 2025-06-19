import type { Message } from '@ai-sdk/react'
import { Loader2Icon } from 'lucide-react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { ImageMessage } from '@/components/messages/image'
import { MessageOptions } from '@/components/messages/options'
import { VoiceMessage } from '@/components/messages/voice-message'
import type { Doc, Id } from '@/convex/_generated/dataModel'

export function AssistantMessage({ promptMessage, message, showExtras }: { promptMessage?: Doc<'messages'>; message: Message; showExtras?: boolean }) {
    if (promptMessage?.type === 'image' || message.experimental_attachments?.[0]?.contentType === 'image/png') {
        return <ImageMessage threadId={promptMessage?.threadId} modelProviderAndLabel={''} message={message} />
    }

    if (promptMessage?.type === 'sound' || message.experimental_attachments?.[0]?.contentType === 'audio/mp3') {
        return <VoiceMessage threadId={promptMessage?.threadId} modelProviderAndLabel={''} message={message} content={message.content} />
    }

    return (
        <div className="group/text-message">
            <div className="markdown">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {(promptMessage?.status === 'pending' || promptMessage?.status === 'streaming') && <Loader2Icon className="size-4 animate-spin" />}
            {showExtras && promptMessage && (
                <MessageOptions
                    className="group-hover/text-message:opacity-100"
                    modelProviderAndLabel={''}
                    threadId={promptMessage.threadId}
                    messageId={message.id as Id<'messages'>}
                    onCopy={() => navigator.clipboard.writeText(message.content)}
                />
            )}
        </div>
    )
}
