import { v } from 'convex/values'

import { internalMutation, mutation } from './_generated/server'

export const copy = mutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        const thread = await ctx.db.get(threadId)
        if (!thread || thread.userId !== identity.subject) {
            return null
        }
        const newThreadId = await ctx.db.insert('threads', {
            name: thread.name,
            userId: identity.subject,
            pinned: false,
            shared: false,
            branched: true,
            updateTime: Date.now()
        })
        return newThreadId
    }
})

export const copyMessagesInternal = internalMutation({
    args: { threadId: v.id('threads'), newThreadId: v.id('threads') },
    handler: async (ctx, { threadId, newThreadId }) => {
        const messages = await ctx.db
            .query('messages')
            .withIndex('by_thread', (q) => q.eq('threadId', threadId))
            .collect()

        for (const message of messages) {
            await ctx.db.insert('messages', {
                threadId: newThreadId,
                status: message.status,
                model: message.model,
                prompt: message.prompt
            })
        }
        return true
    }
})

export const copyChunksInternal = internalMutation({
    args: { messageId: v.id('messages'), newMessageId: v.id('messages') },
    handler: async (ctx, { messageId, newMessageId }) => {
        const chunks = await ctx.db
            .query('chunks')
            .withIndex('by_message', (q) => q.eq('messageId', messageId))
            .collect()

        for (const chunk of chunks) {
            await ctx.db.insert('chunks', {
                messageId: newMessageId,
                text: chunk.text
            })
        }
        return true
    }
})
