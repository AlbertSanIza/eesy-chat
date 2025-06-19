import { useQuery } from 'convex/react'
import { useEffect } from 'react'

import { api } from '@/convex/_generated/api'
import { useStore } from '@/lib/zustand/store'

export function useThreadsCache() {
    const threads = useQuery(api.get.threads)
    const setThreads = useStore((state) => state.setThreads)

    useEffect(() => {
        if (threads) {
            setThreads(threads)
        }
    }, [setThreads, threads])
}
