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

type Subscriber = WritableStreamDefaultWriter<string>

class BroadcastStream {
    private subscribers = new Set<Subscriber>()
    private messageId: Id<'messages'>

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
                        for (const subscriber of this.subscribers) {
                            subscriber.write(textChunk)
                        }
                    }
                    if (count >= 7) {
                        this.convex.mutation(api.streaming.addChunk, {
                            messageId: this.messageId,
                            text: delta,
                            final: false
                        })
                        delta = ''
                        count = 0
                    }
                },
                onFinish: async () => {
                    // Persist the final chunk and mark as complete
                    this.convex.mutation(api.streaming.addChunk, {
                        messageId: this.messageId,
                        text: delta,
                        final: true
                    })
                    // Clean up
                    this.closeAllSubscribers()
                    streamManager.delete(this.messageId)
                }
            })
            await result.consumeStream()
        } catch (error) {
            console.error('AI stream failed:', error)
            this.closeAllSubscribers()
            streamManager.delete(this.messageId)
        }
    }

    subscribe(subscriber: Subscriber) {
        this.subscribers.add(subscriber)
    }

    unsubscribe(subscriber: Subscriber) {
        this.subscribers.delete(subscriber)
    }

    private closeAllSubscribers() {
        for (const subscriber of this.subscribers) {
            subscriber.close()
        }
        this.subscribers.clear()
    }
}

class StreamManager {
    private streams = new Map<Id<'messages'>, BroadcastStream>()

    exists(messageId: Id<'messages'>): boolean {
        return this.streams.has(messageId)
    }
    create(history: Message[], message: Doc<'messages'>, apiKey: string) {
        if (this.exists(message._id)) {
            return
        }
        const stream = new BroadcastStream(history, message, apiKey)
        this.streams.set(message._id, stream)
    }
    get(messageId: Id<'messages'>): BroadcastStream | undefined {
        return this.streams.get(messageId)
    }
    delete(messageId: Id<'messages'>) {
        this.streams.delete(messageId)
    }
}

export const streamManager = new StreamManager()
