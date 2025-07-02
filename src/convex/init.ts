import { internalMutation } from './_generated/server'

const modelsData = [
    { enabled: true, label: 'GPT-4.1 Nano', model: 'openai/gpt-4.1-nano', provider: 'OpenAI', service: 'openRouter', withKey: false } as const,
    { enabled: true, label: 'Claude 3 Haiku', model: 'anthropic/claude-3.5-haiku', provider: 'Anthropic', service: 'openRouter', withKey: true } as const,
    { enabled: true, label: 'GPT Image', model: 'gpt-image-1', provider: 'OpenAI', service: 'openAi', withKey: true } as const,
    { enabled: true, label: 'Claude Sonnet 42', model: 'anthropic/claude-sonnet-4', provider: 'Anthropic', service: 'openRouter', withKey: true } as const,
    { enabled: true, label: 'Multilingual v2', model: 'eleven_monolingual_v2', provider: 'ElevenLabs', service: 'elevenLabs', withKey: true } as const
]

export default internalMutation({
    args: {},
    handler: async ({ db }) => {
        for (const model of modelsData) {
            await db.insert('models', model)
        }
    }
})
