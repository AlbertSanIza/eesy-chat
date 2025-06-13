import { v } from 'convex/values'

import { internalMutation } from './_generated/server'

export const removeAll = internalMutation({
    args: { ids: v.array(v.id('streams')) },
    handler: async (ctx, { ids }) => {
        await Promise.all(ids.map((id) => ctx.db.delete(id)))
    }
})
