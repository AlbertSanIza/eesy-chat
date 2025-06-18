import { Skeleton } from '@/components/ui/skeleton'
import type { Doc } from '@/convex/_generated/dataModel'

export function ImageMessage({ status, content, prompt }: { status: Doc<'messages'>['status']; content: string; prompt: string }) {
    return status === 'streaming' ? <Skeleton className="size-80 rounded-lg" /> : <img className="size-80 rounded-lg" src={content} alt={prompt} />
}
