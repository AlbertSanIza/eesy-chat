import { createFileRoute, useParams } from '@tanstack/react-router'

import { Messages } from '@/components/messages'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})
function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    return (
        <div className="w-full pt-8 pb-38">
            <Messages threadId={threadId as Id<'threads'>} />
        </div>
    )
}
