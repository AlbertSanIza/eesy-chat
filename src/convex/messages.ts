import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { Message } from 'ai'
import { smoothStream, streamText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { action, internalAction, internalMutation, internalQuery, query } from './_generated/server'

export const list = query({
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

export const body = query({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }): Promise<Message | null> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        return await getMessageBody(ctx, messageId)
    }
})

export const history = internalQuery({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }): Promise<Message[]> => {
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
        const joined = await Promise.all(messages.map(async (message) => ({ message, response: await getMessageBody(ctx, message._id) })))
        return joined.flatMap((item) => {
            const user: Message = { id: item.message._id, role: 'user', content: item.message.prompt }
            const assistant: Message = item.response
            if (!assistant.content) {
                return [user]
            }
            return [user, assistant]
        })
    }
})

export const send = action({
    args: { apiKey: v.optional(v.string()), threadId: v.id('threads'), openRouterId: v.string(), prompt: v.string() },
    handler: async (ctx, { apiKey, threadId, openRouterId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const messageId = await ctx.runMutation(internal.messages.create, { threadId, openRouterId, prompt })
        await ctx.scheduler.runAfter(0, internal.threads.updateTime, { threadId })
        await ctx.scheduler.runAfter(0, internal.messages.run, { apiKey, messageId })
    }
})

export const create = internalMutation({
    args: { threadId: v.id('threads'), openRouterId: v.string(), prompt: v.string() },
    handler: async (ctx, { threadId, openRouterId, prompt }) => {
        const model: { openRouterId: string; provider: string; label: string } = await ctx.runQuery(internal.models.data, { openRouterId })
        return await ctx.db.insert('messages', {
            threadId,
            status: 'pending',
            openRouterId: model.openRouterId,
            provider: model.provider,
            label: model.label,
            prompt
        })
    }
})

export const run = internalAction({
    args: { apiKey: v.optional(v.string()), messageId: v.id('messages') },
    handler: async (ctx, { apiKey, messageId }) => {
        const message = await ctx.runQuery(internal.messages.findOne, { messageId })
        if (!message) {
            throw new Error('Message Not Found')
        }
        if (message.status !== 'pending') {
            throw new Error('Stream Already Completed')
        }
        const history = await ctx.runQuery(internal.messages.history, { threadId: message.threadId })
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
        await Promise.all(messages.map((message) => ctx.runMutation(internal.chunks.removeByMessageId, { messageId: message._id })))
    }
})

export const shared = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }): Promise<{ name: string | null; messages: Message[] }> => {
        const thread = await ctx.db.get(threadId)
        if (!thread || !thread.shared) {
            return { name: null, messages: [] }
        }
        return { name: thread.name, messages: await ctx.runQuery(internal.messages.history, { threadId }) }
    }
})

export async function getMessageBody(ctx: QueryCtx, messageId: Id<'messages'>): Promise<Message> {
    const chunks = await ctx.db
        .query('chunks')
        .withIndex('by_message', (q) => q.eq('messageId', messageId))
        .collect()
    return {
        id: messageId,
        role: 'assistant',
        content: chunks.map((chunk) => chunk.text).join('')
    }
}
