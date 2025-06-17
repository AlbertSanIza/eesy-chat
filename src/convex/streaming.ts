import { Message } from 'ai'
import { v } from 'convex/values'

import { Id } from './_generated/dataModel'
import { mutation, query, QueryCtx } from './_generated/server'

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

export async function getMessageBody(ctx: QueryCtx, messageId: Id<'messages'>): Promise<Message> {
    const chunks = await ctx.db
        .query('chunks')
        .withIndex('by_message', (q) => q.eq('messageId', messageId))
        .collect()
    return { id: messageId, role: 'assistant', content: chunks.map((chunk) => chunk.text).join('') }
}
