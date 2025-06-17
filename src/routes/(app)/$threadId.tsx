import { queryOptions, experimental_streamedQuery as streamedQuery, useQuery as useTSQuery } from '@tanstack/react-query'
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

const chatQueryOptions = (message: Doc<'messages'>) =>
    queryOptions({
        queryKey: ['chat', message._id],
        queryFn: streamedQuery({
            queryFn: async function* () {
                const response = await fetch(`${VITE_RAILWAY_API_URL}/connect/${message._id}`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()
                if (!reader) {
                    throw new Error('No response body')
                }
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }
                    yield decoder.decode(value, { stream: true })
                }
                return ''
            }
        }),
        staleTime: Infinity
    })

function ServerMessage({ message }: { message: Doc<'messages'> }) {
    const messageBody = useQuery(api.get.messageBody, message.status === 'done' ? { messageId: message._id } : 'skip')
    const { data, isLoading, isFetching } = useTSQuery({ ...chatQueryOptions(message), enabled: message.status === 'streaming' })

    if (!data && !messageBody) {
        return null
    }

    return (
        <AssistantMessage
            promptMessage={message}
            message={
                message.status === 'streaming' && (isLoading || isFetching)
                    ? {
                          id: message._id,
                          role: 'assistant',
                          content: (data ?? []).join('')
                      }
                    : { id: message._id, role: 'assistant', content: messageBody?.content || '' }
            }
            showExtras
        />
    )
}
