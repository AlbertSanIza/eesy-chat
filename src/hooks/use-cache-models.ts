import { useQuery } from 'convex/react'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/store'

export function useCacheModels() {
    const models = useQuery(api.models.findAll)
    const { setModels } = useStore()

    useEffect(() => {
        if (models) {
            setModels(models)
        }
    }, [models, setModels])
}
