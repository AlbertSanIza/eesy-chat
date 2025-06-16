import { v } from 'convex/values'

import { internalQuery, query } from './_generated/server'

export const findAll = query({
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
    args: { openRouterId: v.string() },
    handler: async (ctx, { openRouterId }): Promise<{ openRouterId: string; label: string }> => {
        const model = await ctx.db
            .query('models')
            .withIndex('by_openRouterId', (q) => q.eq('openRouterId', openRouterId))
            .first()
        if (model) {
            return { openRouterId: model.openRouterId, label: model.label }
        }
        return { openRouterId: 'openai/gpt-4.1-nano', label: 'GPT-4.1 Nano' }
    }
})
