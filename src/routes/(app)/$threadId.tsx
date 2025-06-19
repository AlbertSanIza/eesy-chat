import type { Message } from '@ai-sdk/react'
import { useQuery as useTSQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Fragment, useEffect } from 'react'

import { ImageMessage } from '@/components/messages/image'
import { SoundMessage } from '@/components/messages/sound'
import { TextMessage } from '@/components/messages/text'
import { UserMessage } from '@/components/messages/user'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { chatQueryOptions, cn } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export const Route = createFileRoute('/(app)/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: '/(app)/$threadId' })
    const messages = useQuery(api.get.messages, { threadId: threadId as Id<'threads'> })
    const thread = useStore(({ threads }) => threads.find((thread) => thread._id === threadId))
    useDocumentTitle(thread?.name)

    useEffect(() => {
        if (messages && messages.length > 0 && (messages[messages.length - 1].status === 'pending' || messages[messages.length - 1].status === 'streaming')) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        }
    }, [messages])

    if (!thread) {
        return 'Loading...'
    }

    return (
        <div className={cn('w-full max-w-full overflow-hidden pt-14 pb-36 sm:pt-8')}>
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:px-14">
                {messages?.map((message) => (
                    <Fragment key={message._id}>
                        <UserMessage message={{ id: message._id, content: message.prompt, role: 'user' }} showOptions />
                        <div className="group/assistant-message">
                            <ServerMessage promptMessage={message} />
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

function ServerMessage({ promptMessage }: { promptMessage: Doc<'messages'> }) {
    const messageBody = useQuery(api.get.messageBody, promptMessage.status === 'done' ? { messageId: promptMessage._id } : 'skip')
    const { data, isLoading, isFetching } = useTSQuery({
        ...chatQueryOptions(promptMessage._id),
        enabled: promptMessage.status === 'streaming' && promptMessage.type === 'text'
    })

    if (promptMessage.type === 'image') {
        return messageBody ? (
            <ImageMessage message={messageBody} threadId={promptMessage.threadId} provider={`${promptMessage.provider}: ${promptMessage.label}`} showOptions />
        ) : (
            <Skeleton className="size-60 rounded-lg border bg-sidebar" />
        )
    }

    if (promptMessage.type === 'sound') {
        return messageBody ? (
            <SoundMessage message={messageBody} threadId={promptMessage?.threadId} provider={`${promptMessage.provider}: ${promptMessage.label}`} />
        ) : (
            <Skeleton className="mb-1.5 h-9 w-full rounded-lg border bg-sidebar" />
        )
    }

    const message: Message =
        isLoading || isFetching || !messageBody ? { id: promptMessage._id, role: 'assistant', content: (data ?? []).join('') } : messageBody

    return (
        <TextMessage
            message={message}
            threadId={promptMessage.threadId}
            showOptions={promptMessage.status === 'done'}
            provider={`${promptMessage.provider}: ${promptMessage.label}`}
        />
    )
}
