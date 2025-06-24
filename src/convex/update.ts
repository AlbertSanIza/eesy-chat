import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalAction, internalMutation, mutation } from './_generated/server'
import { SCHEMA_SERVICE, SCHEMA_TYPE } from './schema'

export const threadName = action({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return
        }
        await ctx.scheduler.runAfter(0, internal.update.threadNameInternal, { id, name })
    }
})

export const threadNameWithAi = internalAction({
    args: { userId: v.string(), threadId: v.id('threads'), type: SCHEMA_TYPE, prompt: v.string() },
    handler: async (ctx, { userId, threadId, type, prompt }) => {
        const openrouter = createOpenRouter({ apiKey: await ctx.runQuery(internal.get.apiKey, { userId, service: 'openRouter' }) })
        const systemPrompt =
            'You are a helpful assistant that generates a small title for a chat thread based on the provided user message. The title should be concise, descriptive and small.'
        switch (type) {
            case 'text':
                break
            case 'image':
                break
            case 'sound':
                break
        }
        const response = await generateText({
            model: openrouter.chat('openai/gpt-4.1-nano'),
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt.trim() }]
        })
        await ctx.scheduler.runAfter(0, internal.update.threadNameInternal, { id: threadId, name: response.text.trim() })
    }
})

export const threadNameInternal = internalMutation({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => await ctx.db.patch(id, { name: name.trim() || 'Untitled Thread' })
})

export const threadPinToggle = mutation({
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
        await ctx.db.patch(id, { pinned: !thread?.pinned })
    }
})

export const threadSharedToggle = mutation({
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
        await ctx.db.patch(id, { shared: !thread?.shared })
    }
})

export const threadTime = internalMutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => await ctx.db.patch(threadId, { updateTime: Date.now() })
})

export const messageStatus = internalMutation({
    args: { messageId: v.id('messages'), status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error')) },
    handler: async (ctx, { messageId, status }) => await ctx.db.patch(messageId, { status })
})

export const messageStorageId = internalMutation({
    args: { messageId: v.id('messages'), storageId: v.id('_storage') },
    handler: async (ctx, { messageId, storageId }) => await ctx.db.patch(messageId, { storageId })
})

export const apiKey = mutation({
    args: { service: SCHEMA_SERVICE, key: v.string() },
    handler: async (ctx, { service, key }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('User must be authenticated')
        }
        const existingKey = await ctx.db
            .query('apiKeys')
            .withIndex('by_user_and_service', (q) => q.eq('userId', identity.subject).eq('service', service))
            .unique()
        if (existingKey) {
            await ctx.db.patch(existingKey._id, { key })
        } else {
            await ctx.db.insert('apiKeys', { userId: identity.subject, service, key })
        }
    }
})
