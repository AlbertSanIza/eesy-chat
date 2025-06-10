import { useChat } from '@ai-sdk/react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import Input from '@/components/input'
import Messages from '@/components/messages'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { getConvexSiteUrl } from '@/lib/utils'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})
function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    const convexmessages = useQuery(api.messages.findAll, { threadId: threadId as Id<'threads'> })
    const { messages, input, status, handleInputChange, handleSubmit, stop } = useChat({ api: `${getConvexSiteUrl()}/stream` })

    return (
        <div className="w-full pt-8 pb-38">
            <Messages messages={messages} status={status} />
            {JSON.stringify(convexmessages, null, 2)}
            <Input input={input} status={status} onInputChange={handleInputChange} onSubmit={handleSubmit} onStop={stop} />
        </div>
    )
}
