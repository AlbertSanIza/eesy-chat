import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { getConvexSiteUrl } from '@/lib/utils'
import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { useStream } from '@convex-dev/persistent-text-streaming/react'
import { useEffect, useMemo } from 'react'
import Markdown from 'react-markdown'

export function ServerMessage({
    message,
    isDriven,
    stopStreaming,
    scrollToBottom
}: {
    message: Doc<'messages'>
    isDriven: boolean
    stopStreaming: () => void
    scrollToBottom: () => void
}) {
    const { text, status } = useStream(api.streaming.getStreamBody, new URL(`${getConvexSiteUrl()}/stream-convex`), isDriven, message.streamId as StreamId)

    const isCurrentlyStreaming = useMemo(() => {
        if (!isDriven) return false
        return status === 'pending' || status === 'streaming'
    }, [isDriven, status])

    useEffect(() => {
        if (!isDriven) return
        if (isCurrentlyStreaming) return
        stopStreaming()
    }, [isDriven, isCurrentlyStreaming, stopStreaming])

    useEffect(() => {
        if (!text) return
        scrollToBottom()
    }, [text, scrollToBottom])

    return (
        <div className="md-answer">
            <Markdown>{text || 'Thinking...'}</Markdown>
            {status === 'error' && <div className="mt-2 text-red-500">Error loading response</div>}
        </div>
    )
}
