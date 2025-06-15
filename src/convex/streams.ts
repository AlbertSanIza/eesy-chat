import { v } from 'convex/values'

import { internalMutation, internalQuery } from './_generated/server'

export const text = internalQuery({
    args: { streamId: v.id('streams') },
    handler: async (ctx, args) => {
        const stream = await ctx.db.get(args.streamId)
        if (!stream) {
            throw new Error('Stream Not Found')
        }
        let text = ''
        if (stream.status !== 'pending') {
            const chunks = await ctx.db
                .query('chunks')
                .withIndex('byStream', (q) => q.eq('streamId', args.streamId))
                .collect()
            text = chunks.map((chunk) => chunk.text).join('')
        }
        return { text, status: stream.status }
    }
})

export const removeAll = internalMutation({
    args: { ids: v.array(v.id('streams')) },
    handler: async (ctx, { ids }) => {
        await Promise.all(ids.map((id) => ctx.db.delete(id)))
    }
})
