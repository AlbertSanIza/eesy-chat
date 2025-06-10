import { v } from 'convex/values'

import { internalMutation, mutation, query } from './_generated/server'
import { streamingComponent } from './streaming'

export const findAll = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) =>
        await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
})

export const create = mutation({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const streamId = await streamingComponent.createStream(ctx)
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
        await Promise.all(messages.map((message) => ctx.db.delete(message._id)))
    }
})
