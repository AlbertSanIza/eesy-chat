import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import { internalMutation, internalQuery, mutation, query } from './_generated/server'

export const findAll = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) =>
        await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
})

export const send = mutation({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const streamId = await ctx.db.insert('streams', { status: 'pending' })
        const messageId = await ctx.db.insert('messages', { threadId, streamId, prompt })
        return messageId
    }
})

export const removeAll = internalMutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
        await ctx.scheduler.runAfter(0, internal.streams.removeAll, { ids: messages.map((message) => message.streamId) })
        await Promise.all(messages.map((message) => ctx.db.delete(message._id)))
    }
})
