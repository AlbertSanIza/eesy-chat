import type { Message } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction, mutation, query } from './_generated/server'
import { getMessageBody } from './get'

export const run = internalAction({
    args: { userId: v.string(), messageId: v.id('messages') },
    handler: async (ctx, { userId, messageId }) => {
        const apiKey = await ctx.runQuery(internal.get.apiKey, { userId, service: 'openRouter' })
        if (!apiKey) {
            throw new Error('No OpenRouter API key found for user')
        }
        await fetch(`${process.env.VITE_RAILWAY_API_URL}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: apiKey, messageId })
        })
    }
})

export const getMessage = query({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }) => await ctx.db.get(messageId)
})

export const setMessageStreamingToStreaming = mutation({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }) => await ctx.db.patch(messageId, { status: 'streaming' })
})

export const getHistory = query({
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

export const addChunk = mutation({
    args: { messageId: v.id('messages'), text: v.string(), final: v.boolean() },
    handler: async (ctx, { messageId, text, final }) => {
        ctx.db.insert('chunks', { messageId, text })
        if (final) {
            ctx.db.patch(messageId, { status: 'done' })
        }
    }
})
