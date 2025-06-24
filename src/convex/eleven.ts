'use node'

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction } from './_generated/server'

export const createVoiceInternal = internalAction({
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
