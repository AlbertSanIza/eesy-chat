// export const run = internalAction({
//     args: { apiKey: v.optional(v.string()), messageId: v.id('messages') },
//     handler: async (ctx, { apiKey, messageId }) => {
//         const message = await ctx.runQuery(internal.get.message, { messageId })
//         if (!message) {
//             throw new Error('Message Not Found')
//         }
//         if (message.status !== 'pending') {
//             throw new Error('Stream Already Completed')
//         }
//         const history = await ctx.runQuery(internal.get.messagesHistory, { threadId: message.threadId })
//         const openrouter = createOpenRouter({ apiKey: apiKey || process.env.OPENROUTER_API_KEY })
//         const { textStream } = streamText({
//             system: 'You are a helpful assistant. Respond to the user in Markdown format.',
//             model: openrouter.chat(message.model),
//             messages: [...history, { role: 'user', content: message.prompt }],
//             experimental_transform: smoothStream({ chunking: 'line' })
//         })
//         let delta = ''
//         let count = 0
//         for await (const textPart of textStream) {
//             delta += textPart
//             count++
//             if (count === 1) {
//                 await ctx.runMutation(internal.create.chunk, { messageId, text: delta, final: false })
//                 delta = ''
//                 count = 0
//             }
//         }
//         await ctx.runMutation(internal.create.chunk, { messageId, text: delta, final: true })
//     }
// })
