import { useQuery as useTSQuery } from '@tanstack/react-query'
import { useQuery } from 'convex/react'
import { Fragment } from 'react'

import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { chatQueryOptions } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export function MessagesCache() {
    const { threads } = useStore()

    return threads.slice(0, 20).map((thread) => (
        <Fragment key={thread._id}>
            <UserMessageCache id={thread._id} />
        </Fragment>
    ))
}

function UserMessageCache({ id }: { id: Id<'threads'> }) {
    const messages = useQuery(api.get.messages, { threadId: id })

    return messages?.map((message) => <AssistantMessageCache key={message._id} message={message} />)
}

function AssistantMessageCache({ message }: { message: Doc<'messages'> }) {
    useQuery(api.get.messageBody, { messageId: message._id })
    useTSQuery({ ...chatQueryOptions(message), enabled: message.status === 'streaming' })

    return null
}
