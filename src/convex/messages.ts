import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Message } from 'ai'
import { smoothStream, streamText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalAction, internalMutation, query } from './_generated/server'

export const shared = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }): Promise<{ name: string | null; messages: Message[] }> => {
        const thread = await ctx.db.get(threadId)
        if (!thread || !thread.shared) {
            return { name: null, messages: [] }
        }
        return { name: thread.name, messages: await ctx.runQuery(internal.get.messagesHistory, { threadId }) }
    }
})

export const send = action({
    args: { apiKey: v.optional(v.string()), threadId: v.id('threads'), modelId: v.id('models'), prompt: v.string() },
    handler: async (ctx, { apiKey, threadId, modelId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        await ctx.runMutation(internal.messages.create, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', modelId, threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.update.threadTime, { threadId })
    }
})

export const create = internalMutation({
    args: { apiKey: v.string(), modelId: v.id('models'), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { apiKey, modelId, threadId, prompt }) => {
        const model = (await ctx.runQuery(internal.get.model, { modelId })) as {
            service: 'openRouter' | 'openAi'
            model: string
            provider: string
            label: string
        }
        if (!model) {
            throw new Error('Model Not Found')
        }
        const messageId = await ctx.db.insert('messages', {
            threadId,
            status: 'pending',
            service: model.service,
            model: model.model,
            provider: model.provider,
            label: model.label,
            prompt
        })
        await ctx.scheduler.runAfter(0, internal.streaming.run, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', messageId })
        return messageId
    }
})

export const run = internalAction({
    args: { apiKey: v.optional(v.string()), messageId: v.id('messages') },
    handler: async (ctx, { apiKey, messageId }) => {
        const message = await ctx.runQuery(internal.get.message, { messageId })
        if (!message) {
            throw new Error('Message Not Found')
        }
        if (message.status !== 'pending') {
            throw new Error('Stream Already Completed')
        }
        const history = await ctx.runQuery(internal.get.messagesHistory, { threadId: message.threadId })
        const openrouter = createOpenRouter({ apiKey: apiKey || process.env.OPENROUTER_API_KEY })
        const { textStream } = streamText({
            system: 'You are a helpful assistant. Respond to the user in Markdown format.',
            model: openrouter.chat(message.model),
            messages: [...history, { role: 'user', content: message.prompt }],
            experimental_transform: smoothStream({ chunking: 'line' })
        })
        let delta = ''
        let count = 0
        for await (const textPart of textStream) {
            delta += textPart
            count++
            if (count === 1) {
                await ctx.runMutation(internal.create.chunk, { messageId, text: delta, final: false })
                delta = ''
                count = 0
            }
        }
        await ctx.runMutation(internal.create.chunk, { messageId, text: delta, final: true })
    }
})
