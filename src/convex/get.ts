import type { Message } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { internalQuery, query } from './_generated/server'
import { SCHEMA_SERVICE } from './schema'

export const threads = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not Authenticated')
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
    handler: async (ctx, { messageId }): Promise<Message> => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return { id: messageId, role: 'assistant', content: '' }
        }
        return await getMessageBody(ctx, messageId)
    }
})

export const models = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        const allModels = await ctx.db
            .query('models')
            .withIndex('by_provider_and_label')
            .filter((q) => q.eq(q.field('enabled'), true))
            .order('asc')
            .collect()
        const apiKeys = await ctx.db
            .query('apiKeys')
            .withIndex('by_user_and_service', (q) => q.eq('userId', identity.subject))
            .collect()
        const availableServices = new Set(apiKeys.map((key) => key.service))
        return allModels.filter((model) => availableServices.has(model.service))
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

export const storageUrl = query({
    args: { storageId: v.id('_storage') },
    handler: async (ctx, { storageId }) => await ctx.storage.getUrl(storageId)
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
            content: 'Generated Image',
            experimental_attachments: [{ contentType: 'image/png', url: message.storageId ? (await ctx.storage.getUrl(message.storageId)) || '' : '' }]
        }
    }
    if (message.type === 'sound') {
        return {
            id: messageId,
            role: 'assistant',
            content: 'Generated Sound',
            experimental_attachments: [{ contentType: 'audio/mp3', url: message.storageId ? (await ctx.storage.getUrl(message.storageId)) || '' : '' }]
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

export const searchChunks = query({
    args: { query: v.string() },
    handler: async (ctx, { query: searchQuery }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Not Authenticated')
        }
        const threads = await ctx.db
            .query('threads')
            .withIndex('by_user_and_update_time', (q) => q.eq('userId', identity.subject))
            .collect()
        const threadIdToTitle = Object.fromEntries(threads.map((t) => [t._id, t.name]))
        const threadIds = threads.map((t) => t._id)
        if (!threadIds.length) {
            return []
        }
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.or(...threadIds.map((id) => q.eq(q.field('threadId'), id))))
            .collect()
        const messageIdToThreadId = Object.fromEntries(messages.map((m) => [m._id, m.threadId]))
        const messageIds = Object.keys(messageIdToThreadId)
        if (!messageIds.length) {
            return []
        }
        const results = await ctx.db
            .query('chunks')
            .withSearchIndex('search_text', (q) => q.search('text', searchQuery))
            .filter((q) => q.or(...messageIds.map((id) => q.eq(q.field('messageId'), id))))
            .take(20)
        return results.map((chunk) => ({
            ...chunk,
            threadId: messageIdToThreadId[chunk.messageId],
            threadTitle: threadIdToTitle[messageIdToThreadId[chunk.messageId]]
        }))
    }
})

export const apiKeys = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return { openRouter: false, openAi: false, elevenLabs: false }
        }
        const keys = await ctx.db
            .query('apiKeys')
            .withIndex('by_user_and_service', (q) => q.eq('userId', identity.subject))
            .collect()
        return {
            openRouter: keys.some((k) => k.service === 'openRouter'),
            openAi: keys.some((k) => k.service === 'openAi'),
            elevenLabs: keys.some((k) => k.service === 'elevenLabs')
        }
    }
})

export const apiKey = internalQuery({
    args: { userId: v.string(), service: SCHEMA_SERVICE },
    handler: async (ctx, { userId, service }) => {
        const row = await ctx.db
            .query('apiKeys')
            .withIndex('by_user_and_service', (q) => q.eq('userId', userId).eq('service', service))
            .unique()
        if (!row) {
            throw new Error('API Key Not Found')
        }
        return row.key
    }
})
