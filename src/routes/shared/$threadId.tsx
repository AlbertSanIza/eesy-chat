import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { Messages } from '@/components/messages'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Loader2Icon } from 'lucide-react'

export const Route = createFileRoute('/shared/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    if (!threadId) {
        throw new Error('Thread ID is required')
    }

    const thread = useQuery(api.shared.thread, { threadId: threadId as Id<'threads'> })

    if (!thread) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <Loader2Icon className="h-6 w-6 animate-spin text-gray-500" />
            </div>
        )
    }

    return thread.name ? (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
            <div className="fixed rounded-lg border bg-sidebar/50 px-4 py-3 text-2xl font-semibold backdrop-blur-sm">{thread.name}</div>
            <Messages data={thread.messages} />
        </div>
    ) : (
        <div className="fixed inset-0 flex items-center justify-center">
            <Loader2Icon className="h-6 w-6 animate-spin text-gray-500" />
        </div>
    )
}
