import { MessageOptions } from '@/components/messages/options'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Doc } from '@/convex/_generated/dataModel'

export function ImageMessage({ message, content }: { message: Doc<'messages'>; content: string }) {
    if (message.status === 'streaming') {
        return <Skeleton className="size-40 rounded-lg" />
    }
    return (
        <div className="group/image-message">
            <Dialog>
                <DialogTrigger asChild>
                    <img className="mb-1.5 size-60 cursor-pointer rounded-lg border transition-opacity hover:opacity-80" src={content} alt={message.prompt} />
                </DialogTrigger>
                <DialogContent className="max-h-[95vh] max-w-[95vw] border-0 bg-transparent p-0 shadow-none">
                    <div className="relative flex items-center justify-center">
                        <img className="max-h-[95vh] max-w-full rounded-lg object-contain" src={content} alt={message.prompt} />
                    </div>
                </DialogContent>
            </Dialog>
            <MessageOptions
                message={message}
                onCopy={async () => {
                    try {
                        const response = await fetch(content)
                        const blob = await response.blob()
                        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
                    } catch (error) {
                        console.error('Failed to copy image:', error)
                        navigator.clipboard.writeText(content)
                    }
                }}
            />
        </div>
    )
}
