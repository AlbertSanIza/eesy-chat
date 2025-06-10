import { useChat } from '@ai-sdk/react'
import { createFileRoute } from '@tanstack/react-router'

import Input from '@/components/input'
import Messages from '@/components/messages'
import { getConvexSiteUrl } from '@/lib/utils'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { messages, input, status, handleInputChange, handleSubmit, stop } = useChat({ api: `${getConvexSiteUrl()}/stream` })

    return (
        <div className="w-full pt-8 pb-38">
            <Input input={input} status={status} onInputChange={handleInputChange} onSubmit={handleSubmit} onStop={stop} />
            <Messages messages={messages} status={status} />
        </div>
    )
}
