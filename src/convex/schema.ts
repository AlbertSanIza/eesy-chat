import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    threads: defineTable({
        name: v.string(),
        user: v.string(),
        pinned: v.boolean(),
        shared: v.boolean(),
        updateTime: v.number()
    }).index('by_user', ['user']),
    messages: defineTable({
        threadId: v.id('threads'),
        status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error'), v.literal('timeout')),
        model: v.string(),
        prompt: v.string()
    }).index('by_thread', ['threadId']),
    chunks: defineTable({
        messageId: v.id('messages'),
        text: v.string()
    }).index('by_message', ['messageId'])
})
