import type { Message } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { internalQuery, query } from './_generated/server'

export const threads = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        return await ctx.db
            .query('threads')
            .withIndex('by_user_and_update_time', (q) => q.eq('userId', identity.subject))
            .order('desc')
            .collect()
    }
})

export const sharedThread = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }): Promise<{ name: string | null; messages: Message[] }> => {
        const thread = await ctx.db.get(threadId)
        if (!thread || !thread.shared) {
            return { name: null, messages: [] }
        }
        return { name: thread.name, messages: await ctx.runQuery(internal.get.messagesHistory, { threadId }) }
    }
})

export const messages = query({
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

export const messagesHistory = internalQuery({
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

export const message = internalQuery({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }) => await ctx.db.get(messageId)
})

export const messageBody = query({
    args: { messageId: v.id('messages') },
    handler: async (ctx, { messageId }): Promise<Message | null> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        return await getMessageBody(ctx, messageId)
    }
})

export const models = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query('models')
            .withIndex('by_provider_and_label')
            .filter((q) => q.eq(q.field('enabled'), true))
            .order('asc')
            .collect()
    }
})

export const model = internalQuery({
    args: { modelId: v.id('models') },
    handler: async (ctx, { modelId }) => {
        const model = await ctx.db.get(modelId)
        if (!model) {
            return {
                _id: 'kh7cy4mfjaqrdvz6byjf4fhy897hw5mj',
                enabled: true,
                label: 'GPT-4.1 Nano',
                model: 'openai/gpt-4.1-nano',
                provider: 'OpenAI',
                service: 'openRouter',
                withKey: false,
                _creationTime: Date.now()
            }
        }
        return model
    }
})

export async function getMessageBody(ctx: QueryCtx, messageId: Id<'messages'>): Promise<Message> {
    const message = await ctx.db.get(messageId)
    if (!message) {
        throw new Error('Message Not Found')
    }
    if (message.type === 'image') {
        return {
            id: messageId,
            role: 'assistant',
            content: message.storageId ? (await ctx.storage.getUrl(message.storageId)) || 'Image generation in progress...' : 'Image generation in progress...'
        }
    }
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
