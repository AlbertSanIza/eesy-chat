import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalMutation, mutation } from './_generated/server'

export const threadName = action({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return
        }
        await ctx.scheduler.runAfter(0, internal.update.threadNameInternal, { id, name })
    }
})

export const threadNameInternal = internalMutation({
    args: { id: v.id('threads'), name: v.string() },
    handler: async (ctx, { id, name }) => await ctx.db.patch(id, { name: name.trim() || 'Untitled Thread' })
})

export const threadPinToggle = mutation({
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
        await ctx.db.patch(id, { pinned: !thread?.pinned })
    }
})

export const threadSharedToggle = mutation({
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
        await ctx.db.patch(id, { shared: !thread?.shared })
    }
})

export const threadTime = internalMutation({
    args: { threadId: v.id('threads') },
    handler: async (ctx, { threadId }) => await ctx.db.patch(threadId, { updateTime: Date.now() })
})

export const messageStorageId = internalMutation({
    args: { id: v.id('messages'), storageId: v.id('_storage') },
    handler: async (ctx, { id, storageId }) => {
        await ctx.db.patch(id, { storageId })
    }
})
