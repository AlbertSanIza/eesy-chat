import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { ConvexHttpClient } from 'convex/browser'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { stream } from 'hono/streaming'

import { api } from '../src/convex/_generated/api'
import { Id } from '../src/convex/_generated/dataModel'
import { streamManager } from './stream-manager'

config({ path: '.env' })
config({ path: '.env.local', override: true })

if (!process.env.VITE_CONVEX_URL) {
    throw new Error('VITE_CONVEX_URL is not set in the environment variables.')
}
if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment variables.')
}

const app = new Hono()
const httpClient = new ConvexHttpClient(process.env.VITE_CONVEX_URL)

app.post('/', async (c) => {
    const { apiKey, messageId }: { apiKey: string; messageId: Id<'messages'> } = await c.req.json()
    try {
        const message = await httpClient.query(api.streaming.getMessage, { messageId })
        if (!message) {
            throw new HTTPException(404, { message: 'Message Not Found' })
        }
        if (message.status !== 'pending') {
            throw new HTTPException(400, { message: 'Stream is not pending; did it timeout?' })
        }
        const history = await httpClient.query(api.streaming.getHistory, { threadId: message.threadId })
        const openrouter = createOpenRouter({ apiKey: apiKey || process.env.OPENROUTER_API_KEY })
        let delta = ''
        let count = 0
        const response = streamText({
            system: 'You are a helpful assistant. Respond to the user in Markdown format.',
            model: openrouter.chat(message.model),
            onChunk: async (result) => {
                if (result.chunk.type === 'text-delta') {
                    delta += result.chunk.textDelta
                    count++
                }
                if (count === 7) {
                    httpClient.mutation(api.streaming.addChunk, { messageId, text: delta, final: false })
                    delta = ''
                    count = 0
                }
            },
            onFinish: async () => {
                httpClient.mutation(api.streaming.addChunk, { messageId, text: delta, final: true })
            },
            messages: [...history, { role: 'user', content: message.prompt }]
        })
        response.consumeStream()
        c.header('Content-Type', 'text/plain; charset=utf-8')
        return stream(c, (stream) => stream.pipe(response.textStream))
    } catch {
        throw new HTTPException(404, { message: 'Message Not Found' })
    }
})

app.post('/start', async (c) => {
    const { apiKey, messageId }: { apiKey: string; messageId: Id<'messages'> } = await c.req.json()
    if (!apiKey || !messageId) {
        throw new HTTPException(400, { message: 'API Key and Message ID are required' })
    }
    if (streamManager.exists(messageId)) {
        return c.json({ status: 'Stream already in progress.' }, 200)
    }
    try {
        const message = await httpClient.query(api.streaming.getMessage, { messageId })
        if (!message) {
            throw new HTTPException(404, { message: 'Message not found' })
        }
        if (message.status !== 'pending') {
            throw new HTTPException(400, { message: 'Stream is not pending; did it timeout?' })
        }
        // await httpClient.mutation(api.streaming.setMessageStreamingToStreaming, { messageId })
        const history = await httpClient.query(api.streaming.getHistory, { threadId: message.threadId })
        streamManager.create(history, message, apiKey)
        return c.json({ status: 'Stream started successfully.' }, 200)
    } catch (error) {
        console.error('Failed to start stream:', error)
        throw new HTTPException(404, { message: 'Failed to start stream' })
    }
})

export default app
