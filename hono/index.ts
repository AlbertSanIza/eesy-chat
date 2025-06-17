import { ConvexHttpClient } from 'convex/browser'
import { config } from 'dotenv'
import { Hono } from 'hono'
// import { cors } from 'hono/cors'
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
if (!process.env.DOMAIN_URL) {
    throw new Error('DOMAIN_URL is not set in the environment variables.')
}

const app = new Hono()
const httpClient = new ConvexHttpClient(process.env.VITE_CONVEX_URL)

// Configure CORS to allow requests from your frontend
// app.use(
//     '*',
//     cors({
//         origin: (origin) => {
//             // Allow requests from localhost development servers
//             if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:') || origin.includes(process.env.DOMAIN_URL!)) {
//                 return origin || '*'
//             }
//             return null
//         },
//         allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//         allowHeaders: ['Content-Type', 'Authorization'],
//         credentials: true
//     })
// )

app.get('/ping', async (c) => {
    return c.text('pong')
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
            return c.json({ status: 'Message not found' }, 404)
        }
        if (message.status !== 'pending') {
            return c.json({ status: 'Stream is `not pending; did it timeout?' }, 400)
        }
        await httpClient.mutation(api.streaming.setMessageStreamingToStreaming, { messageId })
        const history = await httpClient.query(api.streaming.getHistory, { threadId: message.threadId })
        streamManager.create(history, message, apiKey)
        return c.json({ status: 'Stream started successfully.' }, 200)
    } catch {
        return c.json({ status: 'Failed to start stream.' }, 500)
    }
})

app.get('/connect/:messageId', (c) => {
    const messageId = c.req.param('messageId') as Id<'messages'>

    return stream(c, async (stream) => {
        const liveStream = streamManager.get(messageId)
        if (!liveStream) {
            await stream.write('data: {"error": "Stream not found"}\n\n')
            return
        }
        const history = liveStream.getHistory()
        if (history) {
            await stream.write(history)
        }

        // Create a writer that writes to the Hono stream
        const writer = {
            write: async (chunk: string) => {
                await stream.write(chunk)
            },
            close: () => {
                // Stream will be closed automatically by Hono
            }
        }

        // Subscribe to the live stream
        liveStream.subscribe(writer)

        // Handle client disconnect
        c.req.raw.signal.addEventListener('abort', () => {
            liveStream.unsubscribe(writer)
        })
    })
})

export default app
