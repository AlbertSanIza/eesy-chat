import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { experimental_generateImage as generateImage, generateText } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalAction, internalMutation, mutation } from './_generated/server'

// export const experimentalMessage = mutation({
//     args: {
//         threadId: v.optional(v.id('threads')),
//         modelId: v.id('models'),
//         type: v.union(v.literal('text'), v.literal('image'), v.literal('sound')),
//         prompt: v.string()
//     },
//     handler: async (ctx, { threadId, modelId, type, prompt }) => {
//         const identity = await ctx.auth.getUserIdentity()
//         if (identity === null) {
//             return null
//         }
//         let finalThreadId = threadId
//         if (!finalThreadId) {
//             finalThreadId = await ctx.db.insert('threads', {
//                 userId: identity.subject,
//                 type: 'text',
//                 name: 'New Thread',
//                 pinned: false,
//                 shared: false,
//                 branched: false,
//                 updateTime: Date.now()
//             })
//             await ctx.scheduler.runAfter(0, internal.create.threadInternal, { apiKey: process.env.OPENROUTER_API_KEY || '', threadId: finalThreadId, prompt })
//         }
//         await ctx.scheduler.runAfter(0, internal.create.messageInternal, {
//             apiKey: process.env.OPENROUTER_API_KEY || '',
//             modelId,
//             threadId: finalThreadId,
//             prompt
//         })
//         return finalThreadId
//     }
// })

export const thread = mutation({
    args: { modelId: v.id('models'), prompt: v.string() },
    handler: async (ctx, { modelId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const threadId = await ctx.db.insert('threads', {
            userId: identity.subject,
            type: 'text',
            name: 'New Thread',
            pinned: false,
            shared: false,
            branched: false,
            updateTime: Date.now()
        })
        await ctx.scheduler.runAfter(0, internal.update.threadNameWithAi, { userId: identity.subject, threadId, type: 'text', prompt })
        await ctx.scheduler.runAfter(0, internal.create.messageInternal, { userId: identity.subject, modelId, threadId, prompt })
        return threadId
    }
})

export const imageThread = mutation({
    args: { prompt: v.string() },
    handler: async (ctx, { prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const threadId = await ctx.db.insert('threads', {
            userId: identity.subject,
            type: 'image',
            name: 'New Thread',
            pinned: false,
            shared: false,
            branched: false,
            updateTime: Date.now()
        })
        await ctx.scheduler.runAfter(0, internal.update.threadNameWithAi, { userId: identity.subject, threadId, type: 'image', prompt })
        await ctx.scheduler.runAfter(0, internal.create.imageMessageInternal, { userId: identity.subject, threadId, prompt })
        return threadId
    }
})

export const voiceThread = mutation({
    args: { prompt: v.string() },
    handler: async (ctx, { prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        const threadId = await ctx.db.insert('threads', {
            userId: identity.subject,
            type: 'sound',
            name: 'New Thread',
            pinned: false,
            shared: false,
            branched: false,
            updateTime: Date.now()
        })
        await ctx.scheduler.runAfter(0, internal.update.threadNameWithAi, { userId: identity.subject, threadId, type: 'sound', prompt })
        await ctx.scheduler.runAfter(0, internal.create.voiceMessageInternal, { userId: identity.subject, threadId, prompt })
        return threadId
    }
})

export const threadBranch = mutation({
    args: { threadId: v.id('threads'), messageId: v.id('messages') },
    handler: async (ctx, { threadId, messageId }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return []
        }
        const thread = await ctx.db.get(threadId)
        if (!thread || (!thread.shared && thread.userId !== identity.subject)) {
            return null
        }
        const message = await ctx.db.get(messageId)
        if (!message || message.threadId !== threadId) {
            return null
        }
        const newThreadId = await ctx.db.insert('threads', {
            userId: identity.subject,
            type: thread.type || 'text',
            name: thread.name,
            pinned: false,
            shared: false,
            branched: true,
            updateTime: Date.now()
        })
        await ctx.scheduler.runAfter(0, internal.create.threadBranchMessagesInternal, { threadId, newThreadId, messageId })
        return newThreadId
    }
})

export const threadBranchMessagesInternal = internalMutation({
    args: { threadId: v.id('threads'), newThreadId: v.id('threads'), messageId: v.id('messages') },
    handler: async (ctx, { threadId, newThreadId, messageId }) => {
        const messages = await ctx.db
            .query('messages')
            .withIndex('by_thread', (q) => q.eq('threadId', threadId))
            .collect()
        const targetMessageIndex = messages.findIndex((message) => message._id === messageId)
        const messagesToCopy = targetMessageIndex === -1 ? messages : messages.slice(0, targetMessageIndex + 1)
        for (const message of messagesToCopy) {
            const newMessageId = await ctx.db.insert('messages', {
                threadId: newThreadId,
                type: message.type,
                status: message.status,
                service: message.service,
                model: message.model,
                provider: message.provider,
                label: message.label,
                prompt: message.prompt
            })
            if (message.storageId) {
                await ctx.scheduler.runAfter(0, internal.create.threadBranchStorageInternal, { newMessageId, storageId: message.storageId })
            }
            await ctx.scheduler.runAfter(0, internal.create.threadBranchChunksInternal, { messageId: message._id, newMessageId })
        }
    }
})

export const threadBranchStorageInternal = internalAction({
    args: { newMessageId: v.id('messages'), storageId: v.id('_storage') },
    handler: async (ctx, { newMessageId, storageId }) => {
        const storageBlob = await ctx.storage.get(storageId)
        if (storageBlob) {
            await ctx.runMutation(internal.update.messageStorageId, { messageId: newMessageId, storageId: await ctx.storage.store(storageBlob) })
        }
    }
})

export const threadBranchChunksInternal = internalMutation({
    args: { messageId: v.id('messages'), newMessageId: v.id('messages') },
    handler: async (ctx, { messageId, newMessageId }) => {
        const chunks = await ctx.db
            .query('chunks')
            .withIndex('by_message', (q) => q.eq('messageId', messageId))
            .collect()
        for (const chunk of chunks) {
            await ctx.db.insert('chunks', { messageId: newMessageId, text: chunk.text })
        }
    }
})

export const message = action({
    args: { threadId: v.id('threads'), modelId: v.id('models'), prompt: v.string() },
    handler: async (ctx, { threadId, modelId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        await ctx.runMutation(internal.create.messageInternal, { userId: identity.subject, modelId, threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.update.threadTime, { threadId })
    }
})

export const imageMessage = action({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        await ctx.runMutation(internal.create.imageMessageInternal, { userId: identity.subject, threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.update.threadTime, { threadId })
    }
})

export const voiceMessage = action({
    args: { threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { threadId, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            return null
        }
        await ctx.runMutation(internal.create.voiceMessageInternal, { userId: identity.subject, threadId, prompt })
        await ctx.scheduler.runAfter(0, internal.update.threadTime, { threadId })
    }
})

export const messageInternal = internalMutation({
    args: { userId: v.string(), modelId: v.id('models'), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { userId, modelId, threadId, prompt }) => {
        const model = (await ctx.runQuery(internal.get.model, { modelId })) as {
            service: 'openRouter' | 'openAi'
            model: string
            provider: string
            label: string
        }
        if (!model) {
            throw new Error('Model Not Found')
        }
        const messageId = await ctx.db.insert('messages', {
            threadId,
            type: 'text',
            status: 'pending',
            service: model.service,
            model: model.model,
            provider: model.provider,
            label: model.label,
            prompt
        })
        await ctx.scheduler.runAfter(0, internal.streaming.run, { userId, messageId })
        return messageId
    }
})

export const imageMessageInternal = internalMutation({
    args: { userId: v.string(), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { userId, threadId, prompt }) => {
        const model = await ctx.db
            .query('models')
            .withIndex('by_provider_and_label')
            .filter((q) => q.eq(q.field('provider'), 'OpenAI'))
            .filter((q) => q.eq(q.field('label'), 'DALL·E 3'))
            .first()
        if (!model) {
            throw new Error('Model Not Found')
        }
        const messageId = await ctx.db.insert('messages', {
            threadId,
            type: 'image',
            status: 'pending',
            service: model.service,
            model: model.model,
            provider: model.provider,
            label: model.label,
            prompt
        })
        await ctx.scheduler.runAfter(0, internal.create.generateImageInternal, { userId, messageId, prompt })
        return messageId
    }
})

export const voiceMessageInternal = internalMutation({
    args: { userId: v.string(), threadId: v.id('threads'), prompt: v.string() },
    handler: async (ctx, { userId, threadId, prompt }) => {
        const model = await ctx.db
            .query('models')
            .withIndex('by_provider_and_label')
            .filter((q) => q.eq(q.field('provider'), 'ElevenLabs'))
            .filter((q) => q.eq(q.field('label'), 'Multilingual v2'))
            .first()
        if (!model) {
            throw new Error('Model Not Found')
        }
        const messageId = await ctx.db.insert('messages', {
            threadId,
            type: 'sound',
            status: 'pending',
            service: model.service,
            model: model.model,
            provider: model.provider,
            label: model.label,
            prompt
        })
        await ctx.scheduler.runAfter(0, internal.eleven.generateVoiceInternal, { userId, messageId, prompt })
        return messageId
    }
})

export const chunk = internalMutation({
    args: { messageId: v.id('messages'), text: v.string(), final: v.boolean() },
    handler: async (ctx, { messageId, text, final }) => {
        const message = await ctx.db.get(messageId)
        if (!message) {
            throw new Error('Message not found')
        }
        if (message.status === 'pending') {
            await ctx.db.patch(messageId, { status: 'streaming' })
        } else if (message.status !== 'streaming') {
            throw new Error('Stream is not streaming; did it timeout?')
        }
        await ctx.db.insert('chunks', { messageId, text })
        if (final) {
            await ctx.db.patch(messageId, { status: 'done' })
        }
    }
})

export const generateImageInternal = internalAction({
    args: { userId: v.string(), messageId: v.id('messages'), prompt: v.string() },
    handler: async (ctx, { userId, messageId, prompt }) => {
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'streaming' })
        const openai = createOpenAI({ apiKey: await ctx.runQuery(internal.get.apiKey, { userId, service: 'openAi' }) })
        const { image } = await generateImage({ model: openai.image('dall-e-3'), prompt, size: '1024x1024' })
        const storageId = await ctx.storage.store(new Blob([image.uint8Array], { type: image.mimeType }))
        await ctx.runMutation(internal.update.messageStorageId, { messageId, storageId })
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'done' })
    }
})
