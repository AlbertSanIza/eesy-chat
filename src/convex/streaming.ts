import { PersistentTextStreaming, type StreamId, StreamIdValidator } from '@convex-dev/persistent-text-streaming'

import { components } from './_generated/api'
import { query } from './_generated/server'

export const persistentTextStreamingComponent = new PersistentTextStreaming(components.persistentTextStreaming)

export const getStreamBody = query({
    args: { streamId: StreamIdValidator },
    handler: async (ctx, { streamId }) => await persistentTextStreamingComponent.getStreamBody(ctx, streamId as StreamId)
})
