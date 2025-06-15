import { v } from 'convex/values'

import { internalMutation } from './_generated/server'

export const add = internalMutation({
    args: { messageId: v.id('messages'), text: v.string(), final: v.boolean() },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId)
        if (!message) {
            throw new Error('Message not found')
        }
        if (message.status === 'pending') {
            await ctx.db.patch(args.messageId, { status: 'streaming' })
        } else if (message.status !== 'streaming') {
            throw new Error('Stream is not streaming; did it timeout?')
        }
        await ctx.db.insert('chunks', { messageId: args.messageId, text: args.text })
        if (args.final) {
            await ctx.db.patch(args.messageId, { status: 'done' })
        }
    }
})
