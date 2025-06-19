import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { CheckIcon, CopyIcon, GitForkIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

export function MessageOptions({
    threadId,
    messageId,
    modelProviderAndLabel,
    showCopy = true,
    showBranchOff = true,
    showModel = true,
    className,
    onCopy
}: {
    threadId: Id<'threads'>
    messageId: Id<'messages'>
    modelProviderAndLabel: string
    showCopy?: boolean
    showBranchOff?: boolean
    showModel?: boolean
    className?: string
    onCopy?: () => void
}) {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)
    const branchOff = useMutation(api.create.threadBranch)

    return (
        <div className={cn('flex items-center gap-1 opacity-0 transition-opacity', className)}>
            {showCopy && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                            onClick={() => {
                                onCopy?.()
                                setCopied(true)
                                setTimeout(() => setCopied(false), 1000)
                            }}
                        >
                            {copied ? <CheckIcon /> : <CopyIcon />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Copy Message</TooltipContent>
                </Tooltip>
            )}
            {showBranchOff && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                            onClick={async () => await navigate({ to: `/${await branchOff({ threadId, messageId })}` })}
                        >
                            <GitForkIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Branch Off</TooltipContent>
                </Tooltip>
            )}
            {showModel && <span className="text-sm">{modelProviderAndLabel}</span>}
        </div>
    )
}
