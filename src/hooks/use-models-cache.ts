import { useQuery } from 'convex/react'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/zustand/store'

export function useModelsCache() {
    const models = useQuery(api.get.models)
    const { setModels } = useStore()

    useEffect(() => {
        if (models) {
            setModels(models)
        }
    }, [models, setModels])
}
