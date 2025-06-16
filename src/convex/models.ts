import { v } from 'convex/values'

import { internalQuery, query } from './_generated/server'

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query('models')
            .withIndex('by_provider_and_label')
            .filter((q) => q.eq(q.field('enabled'), true))
            .order('asc')
            .collect()
    }
})

export const findOne = internalQuery({
    args: { modelId: v.id('models') },
    handler: async (ctx, { modelId }) => {
        const model = await ctx.db.get(modelId)
        if (!model) {
            return {
                _id: 'jd7z8x9y2a1b3c4d5e6f7g8h',
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
