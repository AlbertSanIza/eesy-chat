import { useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useStore } from '@/lib/store'

export function ThreadsCache() {
    const { threads } = useStore()

    return threads.slice(0, 2).map((thread) => <ThreadCache key={thread._id} id={thread._id} />)
}

function ThreadCache({ id }: { id: Id<'threads'> }) {
    useQuery(api.threads.findOne, { id })
    return null
}
