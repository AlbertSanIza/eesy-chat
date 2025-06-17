import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalMutation, mutation } from './_generated/server'

export const thread = mutation({
    args: { id: v.id('threads') },
    handler: async (ctx, { id }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return
        }
        const thread = await ctx.db.get(id)
        if (!thread || thread.userId !== identity.subject) {
            return
        }
        await ctx.scheduler.runAfter(0, internal.remove.messagesByThreadId, { threadId: id })
        await ctx.db.delete(id)
    }
})

export const messagesByThreadId = internalMutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
        await Promise.all(messages.map((message) => ctx.db.delete(message._id)))
        await Promise.all(messages.map((message) => ctx.runMutation(internal.remove.chunksByMessageId, { messageId: message._id })))
    }
})

export const chunksByMessageId = internalMutation({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }) => {
        const chunks = await ctx.db
            .query('chunks')
            .withIndex('by_message', (q) => q.eq('messageId', messageId))
            .collect()
        await Promise.all(chunks.map((chunk) => ctx.db.delete(chunk._id)))
    }
})
