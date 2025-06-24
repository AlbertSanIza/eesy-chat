'use node'

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { v } from 'convex/values'
import OpenAI from 'openai'

import { api, internal } from './_generated/api'
import { internalAction } from './_generated/server'

export const imageInternal = internalAction({
    args: { userId: v.string(), threadId: v.id('threads'), messageId: v.id('messages'), prompt: v.string() },
    handler: async (ctx, { userId, threadId, messageId, prompt }) => {
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'streaming' })
        const history = await ctx.runQuery(api.streaming.getHistory, { threadId })
        const openai = new OpenAI({ apiKey: await ctx.runQuery(internal.get.apiKey, { userId, service: 'openAi' }) })
        let response: OpenAI.Images.ImagesResponse & { _request_id?: string | null }
        if (history.length === 2) {
            response = await openai.images.generate({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'medium' })
        } else {
            const lastMessageWithImage = history[history.length - 3]
            const imageResponse = await fetch(lastMessageWithImage.experimental_attachments?.[0].url || '')
            const imageBlob = await imageResponse.blob()
            response = await openai.images.edit({
                image: imageBlob,
                n: 1,
                size: '1024x1024',
                quality: 'medium',
                prompt
            })
        }
        if (!response) {
            await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'error' })
            return
        }
        const image = response.data?.[0]
        if (image && image.b64_json) {
            const storageId = await ctx.storage.store(new Blob([Uint8Array.from(atob(image.b64_json), (c) => c.charCodeAt(0))], { type: 'image/png' }))
            await ctx.runMutation(internal.update.messageStorageId, { messageId, storageId })
            await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'done' })
        } else {
            await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'error' })
        }
    }
})

export const soundInternal = internalAction({
    args: { userId: v.string(), messageId: v.id('messages'), prompt: v.string() },
    handler: async (ctx, { userId, messageId, prompt }) => {
        const apiKey = await ctx.runQuery(internal.get.apiKey, { userId, service: 'elevenLabs' })
        if (!apiKey) {
            throw new Error('No ElevenLabs API key found for user')
        }
        const elevenLabs = new ElevenLabsClient({ apiKey: apiKey })
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'streaming' })
        const audioStream = await elevenLabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
            text: prompt,
            modelId: 'eleven_multilingual_v2',
            outputFormat: 'mp3_44100_128'
        })
        const chunks: Uint8Array[] = []
        const reader = audioStream.getReader()
        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                chunks.push(value)
            }
        } finally {
            reader.releaseLock()
        }
        const audioBuffer = Buffer.concat(chunks)
        const storageId = await ctx.storage.store(new Blob([audioBuffer], { type: 'audio/mp3' }))
        await ctx.runMutation(internal.update.messageStorageId, { messageId, storageId })
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'done' })
    }
})
