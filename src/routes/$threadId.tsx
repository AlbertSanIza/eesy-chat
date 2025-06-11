import { useChat } from '@ai-sdk/react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Input } from '@/components/input'
import { Messages } from '@/components/messages'
import type { Id } from '@/convex/_generated/dataModel'
import { getConvexSiteUrl } from '@/lib/utils'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})
function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    const { experimental_resume } = useChat({ id: threadId, api: `${getConvexSiteUrl()}/stream`, initialMessages: [] })

    useEffect(() => {
        experimental_resume()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="w-full pt-8 pb-38">
            <Messages threadId={threadId as Id<'threads'>} />
            <Input threadId={threadId as Id<'threads'>} />
        </div>
    )
}
