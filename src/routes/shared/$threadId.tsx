import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Loader2Icon } from 'lucide-react'

import { Messages } from '@/components/messages'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useDocumentTitle } from '@/hooks/use-document-title'

export const Route = createFileRoute('/shared/$threadId')({
    component: RouteComponent
})

function RouteComponent() {
    const { threadId } = useParams({ from: Route.fullPath })

    const thread = useQuery(api.messages.shared, { threadId: threadId as Id<'threads'> })
    useDocumentTitle(thread?.name ? `Shared: ${thread.name}` : undefined)

    if (!thread) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <Loader2Icon className="size-6 animate-spin" />
            </div>
        )
    }

    return thread.name ? (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
            <div className="sticky top-6 z-50 w-fit rounded-lg border bg-sidebar/50 px-4 py-3 text-2xl font-semibold tracking-tight backdrop-blur-sm">
                {thread.name}
            </div>
            <Messages data={thread.messages} />
        </div>
    ) : (
        <div className="fixed inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg">Sorry, this thread is not shared or does not exist.</p>
            <Button variant="default" asChild>
                <Link to="/">Lets Chat!</Link>
            </Button>
        </div>
    )
}
