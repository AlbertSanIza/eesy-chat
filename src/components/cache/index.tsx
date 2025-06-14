import { MessagesCache } from '@/components/cache/messages'
import { useCachedThreads } from '@/hooks/use-cached-threads'
import { useCachedUser } from '@/hooks/use-cached-user'

export function Cache() {
    useCachedUser()
    useCachedThreads()

    return <MessagesCache />
}
