import { v } from 'convex/values'

import { internal } from './_generated/api'
import { mutation } from './_generated/server'

export const thread = mutation({
    args: { id: v.id('threads') },
    handler: async (ctx, { id }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return
        }
        const thread = await ctx.db.get(id)
        if (!thread || thread.userId !== identity.subject) {
            return
        }
        await ctx.scheduler.runAfter(0, internal.messages.removeAll, { threadId: id })
        await ctx.db.delete(id)
    }
})
