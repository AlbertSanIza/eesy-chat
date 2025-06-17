import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalAction, internalMutation, mutation } from './_generated/server'

export const create = mutation({
    args: { modelId: v.id('models'), apiKey: v.optional(v.string()), prompt: v.string() },
    handler: async (ctx, { modelId, apiKey, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const threadId = await ctx.db.insert('threads', {
            name: 'New Thread',
            userId: identity.subject,
            pinned: false,
            shared: false,
            branched: false,
            updateTime: Date.now()
        })
        await ctx.scheduler.runAfter(0, internal.threads.createInternal, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.messages.create, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', modelId, threadId, prompt })
        return threadId
    }
})

export const createInternal = internalAction({
    args: { apiKey: v.string(), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { apiKey, threadId, prompt }) => {
        const openrouter = createOpenRouter({ apiKey: apiKey || process.env.OPENROUTER_API_KEY })
        const response = await generateText({
            model: openrouter.chat('openai/gpt-4.1-nano'),
            system: 'You are a helpful assistant that generates a small title for a chat thread based on the provided user message. The title should be concise, descriptive and small.',
            messages: [{ role: 'user', content: prompt.trim() }]
        })
        await ctx.scheduler.runAfter(0, internal.threads.renameInternal, { id: threadId, name: response.text.trim() })
    }
})

export const rename = action({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return
        }
        await ctx.scheduler.runAfter(0, internal.threads.renameInternal, { id, name })
    }
})

export const renameInternal = internalMutation({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => await ctx.db.patch(id, { name: name.trim() || 'Untitled Thread' })
})

export const togglePin = mutation({
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

export const toggleShared = mutation({
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
