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

export const openRouterId = internalQuery({
    args: { modelId: v.id('models') },
    handler: async (ctx, { modelId }) => {
        const model = await ctx.db.get(modelId)
        if (model?.openRouterId) {
            return model.openRouterId
        }
        return 'openai/gpt-4.1-nano'
    }
})
