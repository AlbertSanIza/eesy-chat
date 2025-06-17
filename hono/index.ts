import { ConvexHttpClient } from 'convex/browser'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

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

// app.get('/connect/:messageId', (c) => {
//     const messageId = c.req.param('messageId') as Id<'messages'>

//     return stream(c, async (stream) => {
//         // 1. Immediately fetch history from Convex to catch the client up
//         const message = await convex.query(api.streaming.getMessage, { messageId })
//         if (message?.content) {
//             await stream.write(message.content)
//         }

//         // 2. If the stream is already finished, close the connection
//         if (message?.status !== 'pending') {
//             await stream.close()
//             return
//         }

//         // 3. If it's still live, subscribe to real-time updates
//         const liveStream = streamManager.get(messageId)
//         if (liveStream) {
//             const writer = stream.writable.getWriter()
//             liveStream.subscribe(writer)

//             // Handle client disconnect
//             stream.onAbort(() => {
//                 console.log(`Client disconnected from ${messageId}`)
//                 liveStream.unsubscribe(writer)
//                 writer.releaseLock()
//             })
//         } else {
//             // This can happen if the stream finished between the DB check and now
//             await stream.close()
//         }
//     })
// })

export default app
