import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { type Message, smoothStream, streamText } from 'ai'

import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

const openrouter = createOpenRouter()

export const stream = httpAction(async (ctx, request) => {
    const { openRouterId, messages }: { openRouterId: string; messages: Message[] } = await request.json()
    const validatedOpenRouterId = await ctx.runQuery(internal.models.openRouterId, { openRouterId })
    const result = streamText({
        system: 'You are a helpful assistant. Respond to the user in Markdown format.',
        model: openrouter.chat(validatedOpenRouterId),
        messages,
        // onChunk: (chunk) => {},
        experimental_transform: smoothStream({ chunking: 'word' })
    })
    result.consumeStream()
    const response = result.toTextStreamResponse()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Vary', 'Origin')
    return response
})
