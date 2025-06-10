import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { Message, streamText } from 'ai'

import { httpAction } from './_generated/server'

const openrouter = createOpenRouter()

export const stream = httpAction(async (ctx, request) => {
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
