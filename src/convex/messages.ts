import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalMutation } from './_generated/server'

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
