'use node'

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalAction } from './_generated/server'

export const generateVoiceInternal = internalAction({
    args: { apiKey: v.string(), messageId: v.id('messages'), prompt: v.string() },
    handler: async (ctx, { apiKey, messageId, prompt }) => {
        await ctx.runMutation(internal.update.messageStatus, { messageId, status: 'streaming' })
        const elevenLabs = new ElevenLabsClient({ apiKey })
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
