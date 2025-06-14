import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalMutation, mutation, query } from './_generated/server'

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

export const send = mutation({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        await ctx.scheduler.runAfter(0, internal.messages.sendInternal, { threadId, prompt })
    }
})

export const sendInternal = internalMutation({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const streamId = await ctx.db.insert('streams', { status: 'pending' })
        await ctx.db.insert('messages', { threadId, streamId, prompt })
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
