import { createFileRoute, useParams } from '@tanstack/react-router'

import { Messages } from '@/components/messages'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})
function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    return (
        <div className="w-full pt-14 pb-33 sm:pt-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:px-14">
                <Messages threadId={threadId as Id<'threads'>} />
            </div>
        </div>
    )
}
