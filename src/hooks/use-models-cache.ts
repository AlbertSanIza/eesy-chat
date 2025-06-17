import { useQuery } from 'convex/react'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/zustand/store'

export function useModelsCache() {
    const models = useQuery(api.get.models)
    const { selectedModel, setModels, setSelectedModel } = useStore()

    useEffect(() => {
        if (models) {
            setModels(models)
            if (!selectedModel) {
                const defaultModel = models.find((m) => m.model === 'openai/gpt-4.1-nano')
                if (defaultModel) {
                    setSelectedModel(defaultModel)
                }
            } else if (selectedModel) {
                if (!models.find((m) => m.model === selectedModel.model)) {
                    const defaultModel = models.find((m) => m.model === 'openai/gpt-4.1-nano')
                    if (defaultModel) {
                        setSelectedModel(defaultModel)
                    }
                }
            }
        }
    }, [models, selectedModel, setModels, setSelectedModel])
}
