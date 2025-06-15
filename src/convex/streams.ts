// import { createOpenRouter } from '@openrouter/ai-sdk-provider'
// import { smoothStream, streamText } from 'ai'
// import { v } from 'convex/values'

// import { internal } from './_generated/api'
// import { internalAction, internalMutation, internalQuery } from './_generated/server'

// const openrouter = createOpenRouter()

// export const findOne = internalQuery({
//     args: { streamId: v.id('streams') },
//     handler: async (ctx, { streamId }) => await ctx.db.get(streamId)
// })

// export const text = internalQuery({
//     args: { streamId: v.id('streams') },
//     handler: async (ctx, args) => {
//         const stream = await ctx.db.get(args.streamId)
//         if (!stream) {
//             throw new Error('Stream Not Found')
//         }
//         let text = ''
//         if (stream.status !== 'pending') {
//             const chunks = await ctx.db
//                 .query('chunks')
//                 .withIndex('byStream', (q) => q.eq('streamId', args.streamId))
//                 .collect()
//             text = chunks.map((chunk) => chunk.text).join('')
//         }
//         return { text, status: stream.status }
//     }
// })

// export const run = internalAction({
//     args: { streamId: v.id('streams') },
//     handler: async (ctx, { streamId }) => {
//         const stream = await ctx.runQuery(internal.streams.findOne, { streamId })
//         console.log('🚀 ~ handler: ~ stream:', stream)
//         if (!stream) {
//             throw new Error('Stream Not Found')
//         }
//         if (stream.status !== 'pending') {
//             throw new Error('Stream Already Completed')
//         }
//         const result = streamText({
//             system: 'You are a helpful assistant. Respond to the user in Markdown format.',
//             model: openrouter.chat('openai/gpt-4.1-nano'),
//             messages: [{ role: 'user', content: stream.text }],
//             experimental_transform: smoothStream({ chunking: 'word' })
//         })
//         // result.consumeStream()
//         // const response = await result.toTextStreamResponse()
//     }
// })

// export const removeAll = internalMutation({
//     args: { ids: v.array(v.id('streams')) },
//     handler: async (ctx, { ids }) => {
//         await Promise.all(ids.map((id) => ctx.db.delete(id)))
//     }
// })
