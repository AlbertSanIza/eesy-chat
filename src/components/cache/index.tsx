import { ThreadsCache } from '@/components/cache/threads'
import { useCachedThreads } from '@/hooks/use-cached-threads'
import { useCachedUser } from '@/hooks/use-cached-user'

export function Cache() {
    useCachedUser()
    useCachedThreads()

    return (
        <>
            <ThreadsCache />
        </>
    )
}
