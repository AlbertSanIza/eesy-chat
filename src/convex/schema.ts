import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const TYPE = v.union(v.literal('text'), v.literal('image'), v.literal('sound'))
const STATUS = v.union(v.literal('pending'), v.literal('streaming'), v.literal('done'), v.literal('error'))
const SERVICE = v.union(v.literal('openRouter'), v.literal('openAi'), v.literal('elevenLabs'))
const PROVIDER = v.union(v.literal('Google'), v.literal('Anthropic'), v.literal('OpenAI'), v.literal('ElevenLabs'))

export default defineSchema({
    threads: defineTable({
        userId: v.string(),
        type: TYPE,
        name: v.string(),
        pinned: v.boolean(),
        shared: v.boolean(),
        branched: v.boolean(),
        updateTime: v.number()
    }).index('by_user_and_update_time', ['userId', 'updateTime']),
    messages: defineTable({
        threadId: v.id('threads'),
        type: TYPE,
        status: STATUS,
        service: SERVICE,
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
        service: SERVICE,
        model: v.string(),
        provider: PROVIDER,
        label: v.string(),
        enabled: v.boolean(),
        withKey: v.boolean()
    }).index('by_provider_and_label', ['provider', 'label']),
    apiKeys: defineTable({
        userId: v.string(),
        service: SERVICE,
        encryptedKey: v.string()
    }).index('by_user_and_service', ['userId', 'service'])
})
