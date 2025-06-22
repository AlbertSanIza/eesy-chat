import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const SCHEMA_TYPE = v.union(v.literal('text'), v.literal('image'), v.literal('sound'))
export const SCHEMA_STATUS = v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error'))
export const SCHEMA_SERVICE = v.union(v.literal('openRouter'), v.literal('openAi'), v.literal('elevenLabs'))
export const SCHEMA_PROVIDER = v.union(v.literal('Google'), v.literal('Anthropic'), v.literal('OpenAI'), v.literal('ElevenLabs'))

export default defineSchema({
    threads: defineTable({
        userId: v.string(),
        type: SCHEMA_TYPE,
        name: v.string(),
        pinned: v.boolean(),
        shared: v.boolean(),
        branched: v.boolean(),
        updateTime: v.number()
    }).index('by_user_and_update_time', ['userId', 'updateTime']),
    messages: defineTable({
        threadId: v.id('threads'),
        type: SCHEMA_TYPE,
        status: SCHEMA_STATUS,
        service: SCHEMA_SERVICE,
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
        service: SCHEMA_SERVICE,
        model: v.string(),
        provider: SCHEMA_PROVIDER,
        label: v.string(),
        enabled: v.boolean()
    }).index('by_provider_and_label', ['provider', 'label']),
    apiKeys: defineTable({
        userId: v.string(),
        service: SCHEMA_SERVICE,
        encryptedKey: v.string()
    }).index('by_user_and_service', ['userId', 'service'])
})
