import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { CheckIcon, CopyIcon, GitForkIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

export function MessageOptions({ message, content }: { message: Doc<'messages'>; content: string }) {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)
    const branchOff = useMutation(api.create.threadBranch)

    return (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/image-message:opacity-100">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                        onClick={() => {
                            navigator.clipboard.writeText(content)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 1000)
                        }}
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Copy Message</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                        onClick={async () => await navigate({ to: `/${await branchOff({ threadId: message.threadId, messageId: message._id })}` })}
                    >
                        <GitForkIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Branch Off</TooltipContent>
            </Tooltip>
            <span className="text-sm">{`${message.provider}: ${message.label}`}</span>
        </div>
    )
}
