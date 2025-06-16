import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { GitForkIcon, Loader2Icon } from 'lucide-react'
import { Fragment } from 'react'

import { AssistantMessage } from '@/components/messages/assistant'
import { UserMessage } from '@/components/messages/user'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export const Route = createFileRoute('/(app)/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const navigate = useNavigate()
    const branchOff = useMutation(api.branching.copy)
    const { threadId } = useParams({ from: '/(app)/$threadId' })
    const messages = useQuery(api.messages.list, { threadId: threadId as Id<'threads'> })
    const thread = useStore(({ threads }) => threads.find((thread) => thread._id === threadId))
    useDocumentTitle(thread?.name)

    const handleBranchOff = async (currentThreadId: Id<'threads'>, messageId: Id<'messages'>) => {
        const newThreadId = await branchOff({ threadId: currentThreadId, messageId: messageId })
        await navigate({ to: `/${newThreadId}` })
    }

    if (!thread) {
        return 'Loading...'
    }

    return (
        <div className={cn('w-full max-w-full overflow-hidden pt-14 pb-36 sm:pt-8')}>
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:px-14">
                {messages?.map((message) => (
                    <Fragment key={message._id}>
                        <UserMessage message={{ id: message._id, content: message.prompt, role: 'user' }} showExtras />
                        <div className="group/assistant-message">
                            {message.status !== 'pending' && <ServerMessage messageId={message._id} />}
                            {(message.status === 'pending' || message.status === 'streaming') && <Loader2Icon className="size-4 animate-spin" />}
                            {message.status === 'done' && (
                                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover/assistant-message:opacity-100">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                                                onClick={() => handleBranchOff(thread._id, message._id)}
                                            >
                                                <GitForkIcon />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Branch Off</TooltipContent>
                                    </Tooltip>
                                    <span className="text-sm">{`${message.provider}: ${message.label}`}</span>
                                </div>
                            )}
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

function ServerMessage({ messageId }: { messageId: Id<'messages'> }) {
    const message = useQuery(api.messages.body, { messageId })

    if (!message) {
        return null
    }

    return <AssistantMessage message={message} />
}
