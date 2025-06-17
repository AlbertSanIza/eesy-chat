import { queryOptions, experimental_streamedQuery as streamedQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Loader2Icon } from 'lucide-react'
import { Fragment } from 'react'

import { AssistantMessage } from '@/components/messages/assistant'
import { UserMessage } from '@/components/messages/user'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn, VITE_RAILWAY_API_URL } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export const Route = createFileRoute('/(app)/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: '/(app)/$threadId' })
    const messages = useQuery(api.get.messages, { threadId: threadId as Id<'threads'> })
    const thread = useStore(({ threads }) => threads.find((thread) => thread._id === threadId))
    useDocumentTitle(thread?.name)

    if (!thread) {
        return 'Loading...'
    }

    return (
        <div className={cn('w-full max-w-full overflow-hidden pt-14 pb-36 sm:pt-8')}>
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:px-14">
                {messages?.map((message) => (
                    <Fragment key={message._id}>
                        <UserMessage message={{ id: message._id, content: message.prompt, role: 'user' }} showExtras />
                        <div className="group/assistant-message">
                            {message.status !== 'pending' && <ServerMessage message={message} />}
                            {(message.status === 'pending' || message.status === 'streaming') && <Loader2Icon className="size-4 animate-spin" />}
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

function ServerMessage({ message }: { message: Doc<'messages'> }) {
    const messageBody = useQuery(api.get.messageBody, message.status !== 'done' ? 'skip' : { messageId: message._id })
    const query =
        message.status !== 'done'
            ? queryOptions({
                  queryKey: ['chat', message._id, message.status],
                  queryFn: streamedQuery({
                      queryFn: () => fetch(`${VITE_RAILWAY_API_URL}/connect/${message._id}`).then((response) => response.json())
                  })
              })
            : null

    return (
        <div>
            {JSON.stringify(query)}
            {import.meta.env.VITE_RAILWAY_API_URL}
        </div>
    )

    if (!messageBody) {
        return null
    }

    return <AssistantMessage promptMessage={message} message={messageBody} showExtras />
}
