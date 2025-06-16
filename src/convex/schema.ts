import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    threads: defineTable({
        name: v.string(),
        userId: v.string(),
        pinned: v.boolean(),
        shared: v.boolean(),
        updateTime: v.number()
    }).index('by_user_and_update_time', ['userId', 'updateTime']),
    messages: defineTable({
        threadId: v.id('threads'),
        status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error'), v.literal('timeout')),
        model: v.string(),
        prompt: v.string()
    }).index('by_thread', ['threadId']),
    chunks: defineTable({
        messageId: v.id('messages'),
        text: v.string()
    }).index('by_message', ['messageId']),
    models: defineTable({
        openRouterId: v.string(),
        provider: v.string(),
        label: v.string(),
        enabled: v.boolean()
    })
        .index('by_provider_and_label', ['provider', 'label'])
        .index('by_openRouterId', ['openRouterId'])
})
