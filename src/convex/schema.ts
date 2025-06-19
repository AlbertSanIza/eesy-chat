import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    threads: defineTable({
        userId: v.string(),
        type: v.optional(v.union(v.literal('text'), v.literal('image'), v.literal('sound'))),
        name: v.string(),
        pinned: v.boolean(),
        shared: v.boolean(),
        branched: v.boolean(),
        updateTime: v.number()
    }).index('by_user_and_update_time', ['userId', 'updateTime']),
    messages: defineTable({
        threadId: v.id('threads'),
        type: v.union(v.literal('text'), v.literal('image'), v.literal('sound')),
        status: v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error')),
        service: v.union(v.literal('openRouter'), v.literal('openAi'), v.literal('elevenLabs')),
        model: v.string(),
        provider: v.string(),
        label: v.string(),
        prompt: v.string(),
        storageId: v.optional(v.id('_storage'))
    }).index('by_thread', ['threadId']),
    chunks: defineTable({
        messageId: v.id('messages'),
        text: v.string()
    })
        .index('by_message', ['messageId'])
        .searchIndex('search_text', { searchField: 'text', filterFields: ['messageId'] }),
    models: defineTable({
        service: v.union(v.literal('openRouter'), v.literal('openAi'), v.literal('elevenLabs')),
        model: v.string(),
        provider: v.union(v.literal('Google'), v.literal('Anthropic'), v.literal('OpenAI'), v.literal('ElevenLabs')),
        label: v.string(),
        enabled: v.boolean(),
        withKey: v.boolean()
    }).index('by_provider_and_label', ['provider', 'label'])
})
