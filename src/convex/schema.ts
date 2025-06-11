import { StreamIdValidator } from '@convex-dev/persistent-text-streaming'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    threads: defineTable({
        name: v.string(),
        user: v.string(),
        pinned: v.boolean(),
        updateTime: v.number()
    }).index('by_user', ['user']),
    messages: defineTable({
        threadId: v.id('threads'),
        streamId: StreamIdValidator,
        prompt: v.string()
    }).index('by_stream', ['streamId']),
    streams: defineTable({
        status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error'), v.literal('timeout'))
    }).index('byStatus', ['status']),
    chunks: defineTable({
        streamId: v.id('streams'),
        text: v.string()
    }).index('byStream', ['streamId'])
})
