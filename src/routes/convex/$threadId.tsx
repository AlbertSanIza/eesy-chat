import { createFileRoute, useParams } from '@tanstack/react-router'

import ChatWindow from '@/components/ChatWindow'

export const Route = createFileRoute('/convex/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    return <ChatWindow threadId={threadId} />
}
