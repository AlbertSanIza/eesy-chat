import { v } from 'convex/values'

import { query } from './_generated/server'

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

export const findOne = query({
    args: { id: v.id('models') },
    handler: async (ctx, { id }) => await ctx.db.get(id)
})
