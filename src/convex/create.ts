import { createOpenAI } from '@ai-sdk/openai'
import { experimental_generateImage as generateImage } from 'ai'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction, internalMutation, mutation } from './_generated/server'
import { SCHEMA_TYPE } from './schema'

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

export const message = mutation({
    args: {
        threadId: v.optional(v.id('threads')),
        modelId: v.id('models'),
        type: v.union(v.literal('text'), v.literal('image'), v.literal('sound')),
        prompt: v.string()
    },
    handler: async (ctx, { threadId, modelId, type, prompt }) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
            throw new Error('Not Authenticated')
        }
        if (threadId) {
            await ctx.scheduler.runAfter(0, internal.create.messageInternal, { userId: identity.subject, threadId, modelId, type, prompt })
            return
        }
        const newThreadId = await ctx.db.insert('threads', {
            userId: identity.subject,
            type: type,
            name: 'New Thread',
            pinned: false,
            shared: false,
            branched: false,
            updateTime: Date.now()
        })
        await ctx.scheduler.runAfter(0, internal.update.threadNameWithAi, { userId: identity.subject, threadId: newThreadId, type, prompt })
        await ctx.scheduler.runAfter(0, internal.create.messageInternal, { userId: identity.subject, threadId: newThreadId, modelId, type, prompt })
        return newThreadId
    }
})

export const messageInternal = internalMutation({
    args: { userId: v.string(), threadId: v.id('threads'), modelId: v.id('models'), type: SCHEMA_TYPE, prompt: v.string() },
    handler: async (ctx, { userId, threadId, modelId, type, prompt }) => {
        const model = await ctx.db.get(modelId)
        if (!model) {
            throw new Error('Model Not Found')
        }
        await ctx.scheduler.runAfter(0, internal.update.threadTime, { threadId })
        const messageId = await ctx.db.insert('messages', {
            threadId,
            type,
            status: 'pending',
            service: model.service,
            model: model.model,
            provider: model.provider,
            label: model.label,
            prompt
        })
        switch (type) {
            case 'text':
                await ctx.scheduler.runAfter(0, internal.streaming.run, { userId, messageId })
                break
            case 'image':
                await ctx.scheduler.runAfter(0, internal.create.generateImageInternal, { userId, messageId, prompt })
                break
            case 'sound':
                await ctx.scheduler.runAfter(0, internal.eleven.generateVoiceInternal, { userId, messageId, prompt })
                break
        }
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
