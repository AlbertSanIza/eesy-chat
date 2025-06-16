import { v } from 'convex/values'

import { internalQuery, query } from './_generated/server'

export const list = query({
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

export const data = internalQuery({
    args: { apiKey: v.optional(v.string()), openRouterId: v.string() },
    handler: async (ctx, { apiKey, openRouterId }) => {
        const model = await ctx.db
            .query('models')
            .withIndex('by_openRouterId', (q) => q.eq('openRouterId', openRouterId))
            .first()
        if (!model || !model.enabled || (!apiKey && model.withKey === true)) {
            return { openRouterId: 'openai/gpt-4.1-nano', provider: 'OpenAI', label: 'GPT-4.1 Nano' }
        }
        return { openRouterId: model.openRouterId, provider: model.provider, label: model.label }
    }
})
