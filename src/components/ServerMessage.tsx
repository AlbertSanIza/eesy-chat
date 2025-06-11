import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import { useEffect, useMemo } from 'react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { getConvexSiteUrl } from '@/lib/utils'

export function ServerMessage({ message, isDriven, stopStreaming }: { message: Doc<'messages'>; isDriven: boolean; stopStreaming: () => void }) {
    const { text, status } = useStream(api.streaming.getStreamBody, new URL(`${getConvexSiteUrl()}/stream-convex`), isDriven, message.streamId as StreamId)

    const isCurrentlyStreaming = useMemo(() => {
        if (!isDriven) {
            return false
        }
        return status === 'pending' || status === 'streaming'
    }, [isDriven, status])

    useEffect(() => {
        if (!isDriven) {
            return
        }
        if (isCurrentlyStreaming) {
            return
        }
        stopStreaming()
    }, [isDriven, isCurrentlyStreaming, stopStreaming])

    return <MemoizedMarkdown id={message._id} content={text} />
}
