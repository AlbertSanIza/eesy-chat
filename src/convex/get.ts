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
