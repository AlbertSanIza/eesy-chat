import { useQuery } from 'convex/react'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/zustand/store'

export function useModelsCache() {
    const models = useQuery(api.get.models)
    const model = useStore((state) => state.model)
    const setModel = useStore((state) => state.setModel)
    const setModels = useStore((state) => state.setModels)

    useEffect(() => {
        if (models) {
            setModels(models)
        }
    }, [models, model, setModels, setModel])
}
