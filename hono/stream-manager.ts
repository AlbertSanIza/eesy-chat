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
    private keepAliveInterval: NodeJS.Timeout | null = null

    constructor(history: Message[], message: Doc<'messages'>, apiKey: string) {
        this.messageId = message._id
        this.startKeepAlive()
        this.run(history, message, apiKey)
    }

    getReadableStream(): ReadableStream<string> {
        return new ReadableStream<string>({
            start: (controller) => {
                const history = this.getHistory()
                if (history) {
                    controller.enqueue(history)
                }
                const subscriber: Subscriber = {
                    write: async (chunk: string) => {
                        try {
                            controller.enqueue(chunk)
                        } catch {
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
                this.subscribe(subscriber)
            }
        })
    }

    cleanup() {
        this.stopKeepAlive()
        this.closeAllSubscribers()
    }

    private startKeepAlive() {
        this.keepAliveInterval = setInterval(() => {
            this.subscribers.forEach((subscriber) => subscriber.write(''))
        }, 1000)
    }

    private stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval)
            this.keepAliveInterval = null
        }
    }

    private async run(history: Message[], message: Doc<'messages'>, apiKey: string) {
        const openrouter = createOpenRouter({ apiKey })
        try {
            const result = streamText({
                system: 'You are a helpful assistant. Respond to the user in Markdown format.',
                model: openrouter.chat(message.model),
                messages: history
            })
            let delta = ''
            let count = 0
            for await (const textPart of result.textStream) {
                delta += textPart
                count++
                this.chunks.push(textPart)
                this.subscribers.forEach((subscriber) => subscriber.write(textPart))
                if (count >= 40) {
                    httpClient.mutation(api.streaming.addChunk, { messageId: message._id, text: delta, final: false })
                    delta = ''
                    count = 0
                }
            }
            httpClient.mutation(api.streaming.addChunk, { messageId: message._id, text: delta, final: true })
            this.stopKeepAlive()
            this.closeAllSubscribers()
            streamManager.deleteWithDelay(this.messageId)
        } catch (error) {
            console.error('AI stream failed:', error)
            this.stopKeepAlive()
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
