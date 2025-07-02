'use node'

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { v } from 'convex/values'
import OpenAI from 'openai'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { internalAction } from './_generated/server'

export const imageInternal = internalAction({
    args: { userId: v.string(), threadId: v.id('threads'), messageId: v.id('messages'), prompt: v.string() },
    handler: async (ctx, { userId, threadId, messageId, prompt }) => {
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'streaming' })
        const history = await ctx.runQuery(api.streaming.getHistory, { threadId })
        const apiKey = await ctx.runQuery(internal.get.apiKey, { userId, service: 'openAi' })
        const openai = new OpenAI({ apiKey })
        let response: (OpenAI.Images.ImagesResponse & { _request_id?: string | null }) | undefined
        if (history.length === 2) {
            response = await openai.images.generate({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'medium' })
        } else {
            const lastMessageWithImage = history[history.length - 3]
            const message = await ctx.runQuery(api.streaming.getMessage, { messageId: lastMessageWithImage.id as Id<'messages'> })
            if (message && message.storageId) {
                const storageBlob = await ctx.storage.get(message.storageId)
                if (!storageBlob) {
                    await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'error' })
                    return
                }
                const body = new FormData()
                body.append('image', storageBlob, 'image.png')
                body.append('prompt', prompt)
                body.append('model', 'gpt-image-1')
                body.append('n', '1')
                body.append('size', '1024x1024')
                body.append('quality', 'medium')
                const fetchResponse = await fetch('https://api.openai.com/v1/images/edits', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${apiKey}` },
                    body
                })
                try {
                    response = await fetchResponse.json()
                } catch {
                    await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'error' })
                    return
                }
            }
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
