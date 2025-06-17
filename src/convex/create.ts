import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction, internalMutation, mutation } from './_generated/server'

export const thread = mutation({
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
        await ctx.scheduler.runAfter(0, internal.create.threadInternal, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.messages.create, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', modelId, threadId, prompt })
        return threadId
    }
})

export const threadBranch = mutation({
    args: { threadId: v.id('threads'), messageId: v.id('messages') },
    handler: async (ctx, { threadId, messageId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        const thread = await ctx.db.get(threadId)
        if (!thread || (!thread.shared && thread.userId !== identity.subject)) {
            return null
        }
        const message = await ctx.db.get(messageId)
        if (!message || message.threadId !== threadId) {
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
        await ctx.scheduler.runAfter(0, internal.branching.copyMessagesInternal, { threadId, newThreadId, messageId })
        return newThreadId
    }
})

export const threadInternal = internalAction({
    args: { apiKey: v.string(), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { apiKey, threadId, prompt }) => {
        const openrouter = createOpenRouter({ apiKey: apiKey || process.env.OPENROUTER_API_KEY })
        const response = await generateText({
            model: openrouter.chat('openai/gpt-4.1-nano'),
            system: 'You are a helpful assistant that generates a small title for a chat thread based on the provided user message. The title should be concise, descriptive and small.',
            messages: [{ role: 'user', content: prompt.trim() }]
        })
        await ctx.scheduler.runAfter(0, internal.update.threadNameInternal, { id: threadId, name: response.text.trim() })
    }
})

export const chunk = internalMutation({
    args: { messageId: v.id('messages'), text: v.string(), final: v.boolean() },
    handler: async (ctx, { messageId, text, final }) => {
        const message = await ctx.db.get(messageId)
        if (!message) {
            throw new Error('Message not found')
        }
        if (message.status === 'pending') {
            await ctx.db.patch(messageId, { status: 'streaming' })
        } else if (message.status !== 'streaming') {
            throw new Error('Stream is not streaming; did it timeout?')
        }
        await ctx.db.insert('chunks', { messageId, text })
        if (final) {
            await ctx.db.patch(messageId, { status: 'done' })
        }
    }
})
