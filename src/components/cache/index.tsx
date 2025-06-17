import { MessagesCache } from '@/components/cache/messages'
import { useModelsCache } from '@/hooks/use-models-cache'
import { useThreadsCache } from '@/hooks/use-threads-cache'
import { useUserCache } from '@/hooks/use-user-cache'
import { highlightCode } from '@/lib/shiki'

export function Cache() {
    useUserCache()
    useThreadsCache()
    useModelsCache()
    highlightCode('', 'text')

    return <MessagesCache />
}
