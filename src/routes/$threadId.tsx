import { createFileRoute, Navigate, useParams } from '@tanstack/react-router'

import { Messages } from '@/components/messages'
import type { Id } from '@/convex/_generated/dataModel'
import { useStore } from '@/lib/store'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })
    const thread = useStore(({ threads }) => threads.find((thread) => thread._id === threadId))

    if (!thread) {
        return <Navigate to="/" />
    }

    return (
        <div className="w-full pt-14 pb-33 sm:pt-8">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:px-14">
                <Messages threadId={threadId as Id<'threads'>} />
            </div>
        </div>
    )
}
