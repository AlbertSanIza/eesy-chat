import type { Message } from '@ai-sdk/react'

import { ImageMessage } from '@/components/messages/image'
import { SoundMessage } from '@/components/messages/sound'
import { TextMessage } from './text'

export function AssistantMessage({ message, showOptions }: { message: Message; showOptions?: boolean }) {
    if (message.experimental_attachments?.[0]?.contentType === 'image/png') {
        return <ImageMessage message={message} showOptions={showOptions} />
    }

    if (message.experimental_attachments?.[0]?.contentType === 'audio/mp3') {
        return <SoundMessage message={message} showOptions={showOptions} />
    }

    return <TextMessage message={message} showOptions={showOptions} />
}
