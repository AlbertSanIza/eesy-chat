import { openrouter } from '@openrouter/ai-sdk-provider'
import { streamText, type CoreMessage } from 'ai'

// A subscriber is just the controller for their response stream
type Subscriber = ReadableStreamDefaultController<string>

class BroadcastableStream {
    private subscribers: Set<Subscriber> = new Set()
    private history = ''
    private isFinished = false

    constructor(messages: CoreMessage[]) {
        // Start the AI generation immediately when an instance is created
        this.run(messages)
    }

    private async run(messages: CoreMessage[]) {
        try {
            const result = streamText({
                system: 'You are a helpful assistant. Respond to the user in Markdown format.',
                model: openrouter('openai/gpt-4o-mini'),
                messages
            })

            // Consume the stream and broadcast chunks
            for await (const chunk of result.textStream) {
                this.history += chunk
                // Send the new chunk to all current subscribers
                for (const subscriber of this.subscribers) {
                    try {
                        subscriber.enqueue(chunk)
                    } catch {
                        // Remove subscriber if they're disconnected
                        this.subscribers.delete(subscriber)
                    }
                }
            }
        } catch (error) {
            console.error('AI stream failed:', error)
            // Send error to all subscribers
            const errorMessage = 'Sorry, there was an error processing your request.'
            for (const subscriber of this.subscribers) {
                try {
                    subscriber.enqueue(errorMessage)
                } catch {
                    this.subscribers.delete(subscriber)
                }
            }
        } finally {
            this.isFinished = true
            // Close all connections and clean up
            for (const subscriber of this.subscribers) {
                try {
                    subscriber.close()
                } catch {
                    // Ignore errors when closing
                }
            }
            this.subscribers.clear()
        }
    }

    // Called when a new client connects
    subscribe(subscriber: Subscriber) {
        // First, send the entire history to catch them up
        if (this.history) {
            try {
                subscriber.enqueue(this.history)
            } catch (error) {
                console.error('Failed to send history to subscriber:', error)
                return
            }
        }

        // If the stream is already done, close their connection immediately
        if (this.isFinished) {
            try {
                subscriber.close()
            } catch {
                // Ignore errors when closing
            }
            return
        }

        // Otherwise, add them to the list for live updates
        this.subscribers.add(subscriber)
    }

    // Called when a client disconnects
    unsubscribe(subscriber: Subscriber) {
        this.subscribers.delete(subscriber)
    }

    // Check if stream is finished
    get finished() {
        return this.isFinished
    }

    // Get current history
    getHistory() {
        return this.history
    }
}

class StreamManager {
    private streams: Map<string, BroadcastableStream> = new Map()

    // Creates a new stream, stores it, and returns its ID
    create(messages: CoreMessage[]): string {
        const streamId = crypto.randomUUID()
        const stream = new BroadcastableStream(messages)
        this.streams.set(streamId, stream)

        // Clean up finished streams after 30 minutes
        setTimeout(
            () => {
                if (stream.finished) {
                    this.streams.delete(streamId)
                    console.log(`Cleaned up finished stream: ${streamId}`)
                }
            },
            30 * 60 * 1000
        )

        return streamId
    }

    get(streamId: string): BroadcastableStream | undefined {
        return this.streams.get(streamId)
    }

    // Get stats for monitoring
    getStats() {
        return {
            activeStreams: this.streams.size,
            streams: Array.from(this.streams.entries()).map(([id, stream]) => ({
                id,
                finished: stream.finished,
                historyLength: stream.getHistory().length
            }))
        }
    }
}

// Create a single, global instance of the manager
const streamManager = new StreamManager()

// CORS headers helper
const setCorsHeaders = (headers: Headers) => {
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
}

const server = Bun.serve({
    port: process.env.PORT || 3001,
    async fetch(req) {
        const url = new URL(req.url)
        const headers = new Headers()
        setCorsHeaders(headers)

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers })
        }

        // Health check endpoint
        if (url.pathname === '/' && req.method === 'GET') {
            return new Response('Chat Stream Server is running!', {
                status: 200,
                headers: { ...headers, 'Content-Type': 'text/plain' }
            })
        }

        // Stats endpoint for monitoring
        if (url.pathname === '/stats' && req.method === 'GET') {
            return new Response(JSON.stringify(streamManager.getStats(), null, 2), {
                status: 200,
                headers: { ...headers, 'Content-Type': 'application/json' }
            })
        }

        // Endpoint to START a new stream
        if (url.pathname === '/start-stream' && req.method === 'POST') {
            try {
                const body = await req.json()
                const { messages } = body

                if (!messages || !Array.isArray(messages)) {
                    return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
                        status: 400,
                        headers: { ...headers, 'Content-Type': 'application/json' }
                    })
                }

                // Validate messages format
                for (const message of messages) {
                    if (!message.role || !message.content) {
                        return new Response(JSON.stringify({ error: "Each message must have 'role' and 'content' properties." }), {
                            status: 400,
                            headers: { ...headers, 'Content-Type': 'application/json' }
                        })
                    }
                }

                // This creates the stream and starts the AI generation in the background
                const streamId = streamManager.create(messages)
                console.log(`Created new stream: ${streamId}`)

                return new Response(JSON.stringify({ streamId }), {
                    status: 200,
                    headers: { ...headers, 'Content-Type': 'application/json' }
                })
            } catch (error) {
                console.error('Error starting stream:', error)
                return new Response(JSON.stringify({ error: 'Failed to parse request body.' }), {
                    status: 400,
                    headers: { ...headers, 'Content-Type': 'application/json' }
                })
            }
        }

        // Endpoint for clients to CONNECT and receive SSE
        if (url.pathname.startsWith('/connect-stream/') && req.method === 'GET') {
            const streamId = url.pathname.split('/connect-stream/')[1]

            if (!streamId) {
                return new Response('Stream ID is required.', {
                    status: 400,
                    headers: { ...headers, 'Content-Type': 'text/plain' }
                })
            }

            const broadcastableStream = streamManager.get(streamId)

            if (!broadcastableStream) {
                return new Response('Stream not found or has ended.', {
                    status: 404,
                    headers: { ...headers, 'Content-Type': 'text/plain' }
                })
            }

            console.log(`Client connecting to stream: ${streamId}`)

            // Set SSE headers
            const sseHeaders = new Headers(headers)
            sseHeaders.set('Content-Type', 'text/event-stream')
            sseHeaders.set('Cache-Control', 'no-cache')
            sseHeaders.set('Connection', 'keep-alive')

            // Create a readable stream for SSE
            const stream = new ReadableStream({
                start(controller) {
                    // Subscribe this client's response controller to the broadcaster
                    broadcastableStream.subscribe(controller)
                },
                cancel() {
                    // When the client disconnects, unsubscribe them
                    console.log(`Client disconnected from stream ${streamId}`)
                }
            })

            // Transform the stream to SSE format
            const sseStream = stream.pipeThrough(
                new TransformStream({
                    transform(chunk, controller) {
                        // Format as SSE data
                        controller.enqueue(`data: ${chunk}\n\n`)
                    }
                })
            )

            return new Response(sseStream, {
                status: 200,
                headers: sseHeaders
            })
        }

        // 404 for unknown routes
        return new Response('Not Found', {
            status: 404,
            headers: { ...headers, 'Content-Type': 'text/plain' }
        })
    }
})

console.log(`Chat Stream Server running on http://localhost:${server.port}`)
console.log(`Available endpoints:`)
console.log(`  GET  /           - Health check`)
console.log(`  GET  /stats      - Server statistics`)
console.log(`  POST /start-stream - Start a new AI stream`)
console.log(`  GET  /connect-stream/:id - Connect to an existing stream`)
