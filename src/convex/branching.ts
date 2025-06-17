import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'

export const copyMessagesInternal = internalMutation({
    args: { threadId: v.id('threads'), newThreadId: v.id('threads'), messageId: v.id('messages') },
    handler: async (ctx, { threadId, newThreadId, messageId }) => {
        const messages = await ctx.db
            .query('messages')
            .withIndex('by_thread', (q) => q.eq('threadId', threadId))
            .collect()
        const targetMessageIndex = messages.findIndex((message) => message._id === messageId)
        const messagesToCopy = targetMessageIndex === -1 ? messages : messages.slice(0, targetMessageIndex + 1)
        for (const message of messagesToCopy) {
            const newMessageId = await ctx.db.insert('messages', {
                threadId: newThreadId,
                status: message.status,
                service: message.service,
                model: message.model,
                provider: message.provider,
                label: message.label,
                prompt: message.prompt
            })
            await ctx.scheduler.runAfter(0, internal.branching.copyChunksInternal, { messageId: message._id, newMessageId })
        }
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
            await ctx.db.insert('chunks', { messageId: newMessageId, text: chunk.text })
        }
    }
})
