import type { Message } from '@ai-sdk/react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { CheckIcon, CopyIcon, GitForkIcon } from 'lucide-react'
import { useState } from 'react'

import { MemoizedMarkdown } from '@/components/memoized-markdown'
import { ImageMessage } from '@/components/messages/image-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'

export function AssistantMessage({ promptMessage, message, showExtras }: { promptMessage?: Doc<'messages'>; message: Message; showExtras?: boolean }) {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)
    const branchOff = useMutation(api.create.threadBranch)

    const handleBranchOff = async (currentThreadId: Id<'threads'>, messageId: Id<'messages'>) => {
        const newThreadId = await branchOff({ threadId: currentThreadId, messageId: messageId })
        await navigate({ to: `/${newThreadId}` })
    }

    if (promptMessage?.type === 'image') {
        return <ImageMessage status={promptMessage.status} content={message.content} prompt={promptMessage.prompt} />
    }

    return (
        <div className="group/assistant-message">
            <div className="markdown">
                <MemoizedMarkdown id={message.id} content={message.content} />
            </div>
            {showExtras && promptMessage && (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/assistant-message:opacity-100">
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
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]"
                                onClick={() => handleBranchOff(promptMessage.threadId, promptMessage._id)}
                            >
                                <GitForkIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Branch Off</TooltipContent>
                    </Tooltip>
                    <span className="text-sm">{`${promptMessage.provider}: ${promptMessage.label}`}</span>
                </div>
            )}
        </div>
    )
}
