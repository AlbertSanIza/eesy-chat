import { v } from 'convex/values'
import { query } from './_generated/server'

export const threads = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        return await ctx.db
            .query('threads')
            .withIndex('by_user_and_update_time', (q) => q.eq('userId', identity.subject))
            .order('desc')
            .collect()
    }
})

export const messages = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        return await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
    }
})

export const models = query({
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
