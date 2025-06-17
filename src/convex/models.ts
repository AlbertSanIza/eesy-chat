import { v } from 'convex/values'

import { internalQuery, query } from './_generated/server'

export const findOne = query({
    args: { modelId: v.id('models') },
    handler: async (ctx, { modelId }) => {
        const model = await ctx.db.get(modelId)
        if (!model) {
            return {
                _id: 'kh7cy4mfjaqrdvz6byjf4fhy897hw5mj',
                openRouterId: 'openai/gpt-4.1-nano',
                provider: 'OpenAI',
                label: 'GPT-4.1 Nano',
                enabled: true,
                withKey: false,
                _creationTime: Date.now()
            }
        }
        return model
    }
})

export const findOneInternal = internalQuery({
    args: { modelId: v.id('models') },
    handler: async (ctx, { modelId }) => {
        const model = await ctx.db.get(modelId)
        if (!model) {
            return {
                _id: 'kh7cy4mfjaqrdvz6byjf4fhy897hw5mj',
                openRouterId: 'openai/gpt-4.1-nano',
                provider: 'OpenAI',
                label: 'GPT-4.1 Nano',
                enabled: true,
                withKey: false,
                _creationTime: Date.now()
            }
        }
        return model
    }
})
