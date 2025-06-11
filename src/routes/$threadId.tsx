import { useChat } from '@ai-sdk/react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { LoaderCircleIcon } from 'lucide-react'
import { Fragment, useState } from 'react'

import Input from '@/components/input'
import Messages from '@/components/messages'
import { ServerMessage } from '@/components/ServerMessage'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { getConvexSiteUrl } from '@/lib/utils'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})
function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })
    const messages = useQuery(api.messages.findAll, { threadId: threadId as Id<'threads'> })
    const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set())
    const sendMessage = useMutation(api.messages.sendMessage)
    const { messages: aiMessages, input, status, handleInputChange, handleSubmit, stop } = useChat({ api: `${getConvexSiteUrl()}/stream` })

    return (
        <div className="w-full pt-8 pb-38">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-12">
                {messages?.map((message) => (
                    <Fragment key={message._id}>
                        <div className="ml-auto w-fit rounded-lg border bg-sidebar px-3 py-2 text-right">{message.prompt}</div>
                        <ServerMessage message={message} isDriven={drivenIds.has(message._id)} stopStreaming={() => {}} />
                    </Fragment>
                ))}
                {(status === 'submitted' || status === 'streaming') && <LoaderCircleIcon className="size-4 animate-spin opacity-20" />}
            </div>
            <Messages messages={aiMessages} />
            <Input
                input={input}
                status={status}
                onInputChange={handleInputChange}
                onSubmit={async () => {
                    const chatId = await sendMessage({ prompt: input, threadId: threadId as Id<'threads'> })
                    setDrivenIds((prev) => {
                        prev.add(chatId)
                        return prev
                    })
                }}
                onStop={stop}
            />
        </div>
    )
}
