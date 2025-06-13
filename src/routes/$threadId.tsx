import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { Messages } from '@/components/messages'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })
    const thread = useQuery(api.threads.findOne, { id: threadId as Id<'threads'> })

    return (
        <div className="w-full pt-14 pb-33 sm:pt-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:px-14">
                {JSON.stringify(thread)}
                <Messages threadId={threadId as Id<'threads'>} />
            </div>
        </div>
    )
}
