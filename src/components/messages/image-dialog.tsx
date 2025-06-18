import { DownloadIcon } from 'lucide-react'

import { MessageOptions } from '@/components/messages/options'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Doc } from '@/convex/_generated/dataModel'

export function ImageMessage({ message, content }: { message: Doc<'messages'>; content: string }) {
    const handleDownload = async () => {
        try {
            const response = await fetch(content)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `image-${message._id}.${blob.type.split('/')[1] || 'png'}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to download image:', error)
        }
    }

    const handleCopy = async () => {
        try {
            const response = await fetch(content)
            const blob = await response.blob()
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
        } catch (error) {
            console.error('Failed to copy image:', error)
            navigator.clipboard.writeText(content)
        }
    }

    if (message.status === 'streaming') {
        return <Skeleton className="size-40 rounded-lg border bg-sidebar" />
    }
    return (
        <div className="group/image-message">
            <div className="flex items-center gap-1.5">
                <Dialog>
                    <DialogTrigger asChild>
                        <img
                            className="mb-1.5 size-60 cursor-pointer rounded-lg border transition-opacity hover:opacity-80"
                            src={content}
                            alt={message.prompt}
                        />
                    </DialogTrigger>
                    <DialogContent className="border-0 bg-transparent p-0 backdrop-blur">
                        <img className="rounded-lg object-contain" src={content} alt={message.prompt} />
                    </DialogContent>
                </Dialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]" onClick={handleDownload}>
                            <DownloadIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Download</TooltipContent>
                </Tooltip>
            </div>
            <MessageOptions message={message} onCopy={handleCopy} className="group-hover/image-message:opacity-100" />
        </div>
    )
}
