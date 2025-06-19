import type { Message } from '@ai-sdk/react'
import { DownloadIcon } from 'lucide-react'

import { MessageOptions } from '@/components/messages/options'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Id } from '@/convex/_generated/dataModel'

export function ImageMessage({
    threadId,
    provider,
    message,
    showOptions
}: {
    threadId?: Id<'threads'>
    provider?: string
    message: Message
    showOptions?: boolean
}) {
    const handleDownload = async () => {
        try {
            const response = await fetch(message.experimental_attachments![0]!.url)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `image-${message.id}.${blob.type.split('/')[1] || 'png'}`
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
            const response = await fetch(message.experimental_attachments![0]!.url)
            const blob = await response.blob()
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
        } catch (error) {
            console.error('Failed to copy image:', error)
            navigator.clipboard.writeText(message.experimental_attachments![0]!.url)
        }
    }

    return (
        <div className="group/image-message">
            <div className="flex items-center gap-1.5">
                <Dialog>
                    <DialogTrigger asChild>
                        <img
                            className="mb-1.5 size-60 cursor-pointer rounded-lg border transition-opacity hover:opacity-80"
                            src={message.experimental_attachments?.[0]?.url}
                            alt={message.content}
                        />
                    </DialogTrigger>
                    <DialogContent className="border-0 bg-transparent p-0 backdrop-blur">
                        <DialogHeader className="hidden">
                            <DialogTitle />
                            <DialogDescription />
                        </DialogHeader>
                        <img className="rounded-lg object-contain" src={message.experimental_attachments?.[0]?.url} alt={message.content} />
                    </DialogContent>
                </Dialog>
                {showOptions && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]" onClick={handleDownload}>
                                <DownloadIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Download</TooltipContent>
                    </Tooltip>
                )}
            </div>
            {showOptions && (
                <MessageOptions
                    className="group-hover/image-message:opacity-100"
                    threadId={threadId}
                    provider={provider}
                    onCopy={handleCopy}
                    messageId={message.id as Id<'messages'>}
                />
            )}
        </div>
    )
}
