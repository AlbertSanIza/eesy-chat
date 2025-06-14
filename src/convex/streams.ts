import { v } from 'convex/values'

import { internalMutation, query } from './_generated/server'

export const getStreamText = query({
    args: { streamId: v.id('streams') },
    handler: async (ctx, args) => {
        const stream = await ctx.db.get(args.streamId)
        if (!stream) {
            throw new Error('Stream not found')
        }
        let text = ''
        if (stream.status !== 'pending') {
            const chunks = await ctx.db
                .query('chunks')
                .withIndex('byStream', (q) => q.eq('streamId', args.streamId))
                .collect()
            text = chunks.map((chunk) => chunk.text).join('')
        }
        return {
            text,
            status: stream.status
        }
    }
})

// export const run = internalAction({
//     args: { streamId },
//     handler: async (ctx, { threadId, prompt }) => {
//         const response = await generateText({
//             model: openrouter.chat('openai/gpt-4.1-nano'),
//             system: 'You are a helpful assistant that generates a small title for a chat thread based on the provided user message. The title should be concise, descriptive and small.',
//             messages: [{ role: 'user', content: prompt.trim() }]
//         })
//         await ctx.scheduler.runAfter(0, internal.threads.renameInternal, { id: threadId, name: response.text.trim() })
//     }
// })

export const removeAll = internalMutation({
    args: { ids: v.array(v.id('streams')) },
    handler: async (ctx, { ids }) => {
        await Promise.all(ids.map((id) => ctx.db.delete(id)))
    }
})
