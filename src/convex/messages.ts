import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { Message, smoothStream, streamText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalAction, internalMutation, internalQuery, query } from './_generated/server'

const openrouter = createOpenRouter()

export const findAll = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        return await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
    }
})

export const findOne = internalQuery({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }) => await ctx.db.get(messageId)
})

export const body = internalQuery({
    args: { messageId: v.id('messages') },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId)
        if (!message) {
            throw new Error('Message Not Found')
        }
        let text = ''
        if (message.status !== 'pending') {
            const chunks = await ctx.db
                .query('chunks')
                .withIndex('by_message', (q) => q.eq('messageId', args.messageId))
                .collect()
            text = chunks.map((chunk) => chunk.text).join('')
        }
        return { text, status: message.status }
    }
})

export const history = internalQuery({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }): Promise<Message[]> => {
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
        const joined = await Promise.all(
            messages.map(async (message) => ({ message, response: await ctx.runQuery(internal.messages.body, { messageId: message._id }) }))
        )
        return joined.flatMap((item) => {
            const user: Message = { id: item.message._id, role: 'user', content: item.message.prompt }
            const assistant: Message = { id: item.message._id, role: 'assistant', content: item.response.text }
            if (!assistant.content) {
                return [user]
            }
            return [user, assistant]
        })
    }
})

export const send = action({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const message = ctx.runMutation(internal.messages.create, { threadId, model: 'openai/gpt-4.1-nano', prompt })
        await ctx.scheduler.runAfter(0, internal.threads.updateTime, { threadId })
        console.log('message', message)
    }
})

export const create = internalMutation({
    args: { threadId: v.id('threads'), model: v.string(), prompt: v.string() },
    handler: async (ctx, { threadId, model, prompt }) => await ctx.db.insert('messages', { threadId, status: 'pending', model, prompt })
})

export const run = internalAction({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }) => {
        const message = await ctx.runQuery(internal.messages.findOne, { messageId })
        if (!message) {
            throw new Error('Message Not Found')
        }
        if (message.status !== 'pending') {
            throw new Error('Stream Already Completed')
        }
        const { textStream } = streamText({
            system: 'You are a helpful assistant. Respond to the user in Markdown format.',
            model: openrouter.chat('openai/gpt-4.1-nano'),
            messages: [{ role: 'user', content: message.prompt }],
            experimental_transform: smoothStream({ chunking: 'line' })
        })
        let delta = ''
        let count = 0
        for await (const textPart of textStream) {
            delta += textPart
            count++
            if (count === 2) {
                await ctx.runMutation(internal.chunks.add, { messageId, text: delta, final: false })
                delta = ''
                count = 0
            }
        }
        await ctx.runMutation(internal.chunks.add, { messageId, text: delta, final: true })
    }
})

export const removeAll = internalMutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
        await Promise.all(messages.map((message) => ctx.db.delete(message._id)))
        await Promise.all(messages.map((message) => ctx.runMutation(internal.chunks.removeAll, { messageId: message._id })))
    }
})
