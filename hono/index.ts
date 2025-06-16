import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { smoothStream, streamText } from 'ai'
import { ConvexHttpClient } from 'convex/browser'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { stream } from 'hono/streaming'

// import { api } from '../src/convex/_generated/api'

config({ path: '.env' })
config({ path: '.env.local', override: true })

if (!process.env.VITE_CONVEX_URL) {
    throw new Error('CONVEX_URL is not set in the environment variables.')
}

const app = new Hono()
const httpClient = new ConvexHttpClient(process.env.VITE_CONVEX_URL)

app.post('/', async (c) => {
    // const messages = await httpClient.query(api.models.findOne, { modelId })

    console.log('🚀 ~ app.post ~ messages:', messages)

    const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
    const result = streamText({
        model: openrouter.chat('openai/gpt-4.1-nano'),
        onChunk: (chunk) => {
            console.log(chunk)
        },
        prompt: 'Invent a new holiday and describe its traditions.',
        experimental_transform: smoothStream({ chunking: 'line' })
    })
    result.consumeStream()
    c.header('Content-Type', 'text/plain; charset=utf-8')
    return stream(c, (stream) => stream.pipe(result.textStream))
})

export default app
