import { v } from 'convex/values'

import type { StreamId } from '@convex-dev/persistent-text-streaming'
import { internalMutation, internalQuery, mutation, query } from './_generated/server'
import { persistentTextStreamingComponent } from './streaming'

export const findAll = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) =>
        await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
})

export const create = mutation({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const streamId = await persistentTextStreamingComponent.createStream(ctx)
        const messageId = await ctx.db.insert('messages', { threadId, streamId, prompt })
        return messageId
    }
})

export const removeAll = internalMutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => {
        const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('threadId'), threadId))
            .collect()
        await Promise.all(messages.map((message) => ctx.db.delete(message._id)))
    }
})

export const getHistory = internalQuery({
    args: {},
    handler: async (ctx) => {
        // Grab all the user messages
        const allMessages = await ctx.db.query('messages').collect()

        // Lets join the user messages with the assistant messages
        const joinedResponses = await Promise.all(
            allMessages.map(async (userMessage) => {
                return {
                    userMessage,
                    responseMessage: await persistentTextStreamingComponent.getStreamBody(ctx, userMessage.streamId as StreamId)
                }
            })
        )

        return joinedResponses.flatMap((joined) => {
            const user = {
                role: 'user' as const,
                content: joined.userMessage.prompt
            }

            const assistant = {
                role: 'assistant' as const,
                content: joined.responseMessage.text
            }

            // If the assistant message is empty, its probably because we have not
            // started streaming yet so lets not include it in the history
            if (!assistant.content) return [user]

            return [user, assistant]
        })
    }
})
