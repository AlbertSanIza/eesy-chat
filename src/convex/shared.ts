import { Message } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { query } from './_generated/server'

export const thread = query({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }): Promise<{ name: string | null; messages: Message[] }> => {
        const thread = await ctx.db.get(threadId)
        if (!thread || !thread.shared) {
            return { name: null, messages: [] }
        }
        return { name: thread.name, messages: await ctx.runQuery(internal.messages.history, { threadId }) }
    }
})
