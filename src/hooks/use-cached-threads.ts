import { useQuery } from 'convex/react'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/store'

export function useCachedThreads() {
    const threads = useQuery(api.threads.findAll)
    const { setThreads } = useStore()

    useEffect(() => {
        if (threads) {
            setThreads(threads)
        }
    }, [setThreads, threads])
}
