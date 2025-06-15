import { MessagesCache } from '@/components/cache/messages'
import { useCacheModels } from '@/hooks/use-cache-models'
import { useCachedThreads } from '@/hooks/use-cached-threads'
import { useCachedUser } from '@/hooks/use-cached-user'

export function Cache() {
    useCachedUser()
    useCachedThreads()
    useCacheModels()

    return <MessagesCache />
}
