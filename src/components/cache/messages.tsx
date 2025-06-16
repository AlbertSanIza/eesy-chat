import { useQuery } from 'convex/react'
import { Fragment } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useStore } from '@/lib/store'

export function MessagesCache() {
    const { threads } = useStore()

    return threads.slice(0, 20).map((thread) => (
        <Fragment key={thread._id}>
            <UserMessageCache id={thread._id} />
        </Fragment>
    ))
}

function UserMessageCache({ id }: { id: Id<'threads'> }) {
    const messages = useQuery(api.messages.findAll, { threadId: id })

    return messages?.map((message) => (
        <Fragment key={message._id}>
            <AssistantMessageCache key={message._id} id={message._id} />
        </Fragment>
    ))
}

function AssistantMessageCache({ id }: { id: Id<'messages'> }) {
    useQuery(api.messages.body, { messageId: id })

    return null
}
