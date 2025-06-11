import { useChat } from '@ai-sdk/react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { LoaderCircleIcon } from 'lucide-react'
import { Fragment, type ChangeEvent } from 'react'

import Input from '@/components/input'
import { ServerMessage } from '@/components/ServerMessage'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useChatStore } from '@/lib/store'
import { getConvexSiteUrl } from '@/lib/utils'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})
function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })
    const createMessage = useMutation(api.messages.create)
    const { updateDrivenIds } = useChatStore()
    const messages = useQuery(api.messages.findAll, { threadId: threadId as Id<'threads'> })
    const { input, status, handleInputChange } = useChat({ api: `${getConvexSiteUrl()}/stream` })

    return (
        <div className="w-full pt-8 pb-38">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-12">
                {messages?.map((message) => (
                    <Fragment key={message._id}>
                        <div className="ml-auto w-fit rounded-lg border bg-sidebar px-3 py-2">{message.prompt}</div>
                        <div className="markdown">
                            <ServerMessage message={message} isDriven={true} stopStreaming={() => {}} />
                        </div>
                    </Fragment>
                ))}
                {(status === 'submitted' || status === 'streaming') && <LoaderCircleIcon className="size-4 animate-spin opacity-20" />}
            </div>
            <Input
                input={input}
                status={status}
                onInputChange={handleInputChange}
                onSubmit={async () => {
                    const chatId = await createMessage({ prompt: input, threadId: threadId as Id<'threads'> })
                    handleInputChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)
                    updateDrivenIds(chatId)
                }}
            />
        </div>
    )
}
