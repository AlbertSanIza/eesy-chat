import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Fragment } from 'react'

import { useSidebar } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { open, isMobile } = useSidebar()
    const { threadId } = useParams({ from: Route.fullPath })
    const thread = useStore(({ threads }) => threads.find((thread) => thread._id === threadId))
    const messages = useQuery(api.messages.findAll, { threadId: threadId as Id<'threads'> })

    if (!thread) {
        return 'Loading...'
    }

    return (
        <div className={cn('w-full pt-14 pb-33 sm:pt-8', open && !isMobile && 'max-w-[calc(100vw-var(--sidebar-width))]')}>
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 sm:px-14">
                {messages?.map((message) => (
                    <Fragment key={message._id}>
                        <div className="ml-auto w-fit rounded-lg border bg-sidebar px-4 py-3 text-right text-[#492C61] dark:bg-[#2C2632] dark:text-[#F2EBFA]">
                            {message.prompt}
                        </div>
                        <div className="markdown">{message.streamId}</div>
                    </Fragment>
                ))}
            </div>
        </div>
    )
}
