import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalMutation } from './_generated/server'

export const send = action({
    args: { apiKey: v.optional(v.string()), threadId: v.id('threads'), modelId: v.id('models'), prompt: v.string() },
    handler: async (ctx, { apiKey, threadId, modelId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        await ctx.runMutation(internal.messages.create, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', modelId, threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.update.threadTime, { threadId })
    }
})

export const create = internalMutation({
    args: { apiKey: v.string(), modelId: v.id('models'), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { apiKey, modelId, threadId, prompt }) => {
        const model = (await ctx.runQuery(internal.get.model, { modelId })) as {
            service: 'openRouter' | 'openAi'
            model: string
            provider: string
            label: string
        }
        if (!model) {
            throw new Error('Model Not Found')
        }
        const messageId = await ctx.db.insert('messages', {
            threadId,
            status: 'pending',
            service: model.service,
            model: model.model,
            provider: model.provider,
            label: model.label,
            prompt
        })
        await ctx.scheduler.runAfter(0, internal.streaming.run, { apiKey: apiKey || process.env.OPENROUTER_API_KEY || '', messageId })
        return messageId
    }
})
