import { useCachedThreads } from '@/hooks/use-cached-threads'
import { useCachedUser } from '@/hooks/use-cached-user'

export function Cache() {
    useCachedThreads()
    useCachedUser()
    return null
}
