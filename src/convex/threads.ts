import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import { action, internalAction, internalMutation, mutation, query } from './_generated/server'

const openrouter = createOpenRouter()

export const findAll = query({
    args: {},
    handler: async (ctx) =>
        await ctx.db
            .query('threads')
            .filter((q) => q.eq(q.field('user'), 'albert'))
            .order('desc')
            .collect()
})

export const findOne = query({
    args: { id: v.id('threads') },
    handler: async (ctx, { id }) => await ctx.db.get(id)
})

export const create = mutation({
    args: { prompt: v.string() },
    handler: async (ctx, { prompt }) => {
        const threadId = await ctx.db.insert('threads', { name: 'New Thread', user: 'albert', pinned: false, updateTime: Date.now() })
        await ctx.scheduler.runAfter(0, internal.threads.createInternal, { threadId, prompt })
        await ctx.scheduler.runAfter(0, api.messages.create, { threadId, prompt })
        return threadId
    }
})

export const createInternal = internalAction({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
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
        await ctx.scheduler.runAfter(0, internal.threads.renameInternal, { id, name })
    }
})

export const renameInternal = internalMutation({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => {
        await ctx.db.patch(id, { name: name.trim() || 'Untitled Thread' })
    }
})

export const togglePin = mutation({
    args: { id: v.id('threads') },
    handler: async (ctx, { id }) => {
        const memory = await ctx.db.get(id)
        await ctx.db.patch(id, { pinned: !memory?.pinned })
    }
})

export const remove = mutation({
    args: { id: v.id('threads') },
    handler: async (ctx, { id }) => {
        await ctx.scheduler.runAfter(0, internal.messages.removeAll, { threadId: id })
        await ctx.db.delete(id)
    }
})
