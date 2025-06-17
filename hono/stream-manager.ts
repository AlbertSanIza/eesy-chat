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

    getReadableStream(): ReadableStream<string> {
        // Create a new ReadableStream for each client to avoid locking issues
        return new ReadableStream<string>({
            start: (controller) => {
                // Send existing history immediately
                const history = this.getHistory()
                if (history) {
                    controller.enqueue(history)
                }

                // Create a subscriber that will write to this specific controller
                const subscriber: Subscriber = {
                    write: async (chunk: string) => {
                        try {
                            controller.enqueue(chunk)
                        } catch {
                            // Controller might be closed, ignore error
                            console.log('Controller closed, removing subscriber')
                            this.unsubscribe(subscriber)
                        }
                    },
                    close: () => {
                        try {
                            controller.close()
                        } catch {
                            // Controller might already be closed
                        }
                        this.unsubscribe(subscriber)
                    }
                }

                // Subscribe this controller to receive updates
                this.subscribe(subscriber)
            },
            cancel: () => {
                // Clean up when stream is cancelled
            }
        })
    }

    cleanup() {
        this.closeAllSubscribers()
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
        return this.streams.has(messageId)
    }
    async create(history: Message[], message: Doc<'messages'>, apiKey: string) {
        if (this.exists(message._id)) {
            return
        }
        const stream = new BroadcastStream(history, message, apiKey)
        this.streams.set(message._id, stream)
        await httpClient.mutation(api.streaming.setMessageStreamingToStreaming, { messageId: message._id })
    }
    get(messageId: Id<'messages'>): BroadcastStream | undefined {
        return this.streams.get(messageId)
    }
    delete(messageId: Id<'messages'>) {
        this.streams.delete(messageId)
    }
    deleteWithDelay(messageId: Id<'messages'>) {
        setTimeout(() => {
            this.delete(messageId)
        }, 2000)
    }
}

export const streamManager = new StreamManager()
