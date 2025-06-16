import type { Message } from '@ai-sdk/react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function UserMessage({ message, showExtras }: { message: Message; showExtras?: boolean }) {
    const [copied, setCopied] = useState(false)

    return (
        <div className="group/user-message flex flex-col items-end gap-1.5">
            <div className="ml-auto w-fit rounded-lg border bg-sidebar px-4 py-3 text-right text-[#492C61] dark:bg-[#2C2632] dark:text-[#F2EBFA]">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {showExtras && (
                <div className="opacity-0 transition-opacity group-hover/user-message:opacity-100">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                                onClick={() => {
                                    navigator.clipboard.writeText(message.content)
                                    setCopied(true)
                                    setTimeout(() => setCopied(false), 1000)
                                }}
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Copy Message</TooltipContent>
                    </Tooltip>
                </div>
            )}
        </div>
    )
}
