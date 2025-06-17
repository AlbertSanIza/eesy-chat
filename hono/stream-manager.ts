import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Message } from 'ai'
import { streamText } from 'ai'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../src/convex/_generated/api'
import { Doc, Id } from '../src/convex/_generated/dataModel'

if (!process.env.VITE_CONVEX_URL) {
    throw new Error('VITE_CONVEX_URL is not set in the environment variables.')
}

const httpClient = new ConvexHttpClient(process.env.VITE_CONVEX_URL)

type Subscriber = {
    write: (chunk: string) => Promise<void>
    close: () => void
}

class BroadcastStream {
    private subscribers = new Set<Subscriber>()
    private messageId: Id<'messages'>
    private chunks: string[] = []

    constructor(history: Message[], message: Doc<'messages'>, apiKey: string) {
        this.messageId = message._id
        this.run(history, message, apiKey)
    }

    private async run(history: Message[], message: Doc<'messages'>, apiKey: string) {
        const openrouter = createOpenRouter({ apiKey })
        let delta = ''
        let count = 0
        try {
            const result = streamText({
                system: 'You are a helpful assistant. Respond to the user in Markdown format.',
                model: openrouter.chat(message.model),
                messages: history,
                onChunk: async (result) => {
                    if (result.chunk.type === 'text-delta') {
                        const textChunk = result.chunk.textDelta
                        delta += textChunk
                        count++
                        this.chunks.push(textChunk)
                        this.subscribers.forEach(async (subscriber) => {
                            await subscriber.write(textChunk)
                        })
                    }
                    if (count >= 7) {
                        await httpClient.mutation(api.streaming.addChunk, { messageId: message._id, text: delta, final: false })
                        delta = ''
                        count = 0
                    }
                },
                onFinish: async () => {
                    await httpClient.mutation(api.streaming.addChunk, { messageId: message._id, text: delta, final: true })
                    this.closeAllSubscribers()
                    streamManager.deleteWithDelay(this.messageId)
                }
            })
            result.consumeStream()
        } catch (error) {
            console.error('AI stream failed:', error)
            this.closeAllSubscribers()
            streamManager.deleteWithDelay(this.messageId)
        }
    }

    subscribe(subscriber: Subscriber) {
        this.subscribers.add(subscriber)
    }

    unsubscribe(subscriber: Subscriber) {
        this.subscribers.delete(subscriber)
    }

    getHistory(): string {
        return this.chunks.join('')
    }

    private closeAllSubscribers() {
        this.subscribers.forEach((subscriber) => subscriber.close())
        this.subscribers.clear()
    }
}

class StreamManager {
    private streams = new Map<Id<'messages'>, BroadcastStream>()

    exists(messageId: Id<'messages'>): boolean {
        console.log('Checking existence of stream for message ID:', messageId)
        return this.streams.has(messageId)
    }
    async create(history: Message[], message: Doc<'messages'>, apiKey: string) {
        if (this.exists(message._id)) {
            return
        }
        const stream = new BroadcastStream(history, message, apiKey)
        console.log('Created stream for message ID:', message._id)
        this.streams.set(message._id, stream)
        await httpClient.mutation(api.streaming.setMessageStreamingToStreaming, { messageId: message._id })
    }
    get(messageId: Id<'messages'>): BroadcastStream | undefined {
        console.log('Retrieving stream for message ID:', messageId)
        return this.streams.get(messageId)
    }
    delete(messageId: Id<'messages'>) {
        console.log('Deleting stream for message ID:', messageId)
        this.streams.delete(messageId)
    }

    deleteWithDelay(messageId: Id<'messages'>) {
        console.log('Scheduling deletion of stream for message ID:', messageId, 'in 10 seconds')
        setTimeout(() => {
            this.delete(messageId)
        }, 10000) // 10 seconds delay
    }
}

export const streamManager = new StreamManager()
