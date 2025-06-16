import { useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useStore } from '@/lib/store'

export function MessagesCache() {
    const { threads } = useStore()

    return threads.slice(0, 20).map((thread) => <MessageCache key={thread._id} id={thread._id} />)
}

function MessageCache({ id }: { id: Id<'threads'> }) {
    useQuery(api.messages.findAll, { threadId: id })
    return null
}
