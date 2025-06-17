import { v } from 'convex/values'

import { internalMutation } from './_generated/server'

export const copyChunksInternal = internalMutation({
    args: { messageId: v.id('messages'), newMessageId: v.id('messages') },
    handler: async (ctx, { messageId, newMessageId }) => {
        const chunks = await ctx.db
            .query('chunks')
            .withIndex('by_message', (q) => q.eq('messageId', messageId))
            .collect()
        for (const chunk of chunks) {
            await ctx.db.insert('chunks', { messageId: newMessageId, text: chunk.text })
        }
    }
})
