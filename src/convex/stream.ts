import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { type Message, streamText } from 'ai'

import { internal } from './_generated/api'
import { httpAction } from './_generated/server'
import { persistentTextStreamingComponent } from './streaming'

const openrouter = createOpenRouter()

export const stream = httpAction(async (_, request) => {
    const { messages }: { messages: Message[] } = await request.json()
    const result = streamText({
        system: 'You are a helpful assistant. Respond to the user in Markdown format.',
        model: openrouter.chat('openai/gpt-4.1-nano'),
        messages
    })
    const response = result.toDataStreamResponse()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Vary', 'Origin')
    return response
})

export const streamConvex = httpAction(async (ctx, request) => {
    const body = (await request.json()) as { streamId: string }
    const response = await persistentTextStreamingComponent.stream(ctx, request, body.streamId as StreamId, async (ctx, _request, _streamId, append) => {
        const history = await ctx.runQuery(internal.messages.getHistory)
        const { textStream } = streamText({
            system: 'You are a helpful assistant. Respond to the user in Markdown format.',
            model: openrouter.chat('openai/gpt-4.1-nano'),
            messages: history
        })
        for await (const textPart of textStream) {
            append(textPart)
        }
    })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Vary', 'Origin')
    return response
})
