import { SignInButton, useUser } from '@clerk/clerk-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useAction, useMutation } from 'convex/react'
import { ChevronDownIcon, LoaderCircleIcon, SendHorizontalIcon, SquareIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSidebar } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useAiChat } from '@/hooks/use-ai-chat'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export function Input() {
    const { isSignedIn } = useUser()
    const { open } = useSidebar()
    const navigate = useNavigate()
    const send = useAction(api.messages.send)
    const { threadId } = useParams({ strict: false })
    const createThread = useMutation(api.threads.create)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const { models, selectedModel, setSelectedModel } = useStore()
    const [showSignInDialog, setShowSignInDialog] = useState(false)
    const { input, status, handleInputChange } = useAiChat({ id: threadId || 'home' })

    useEffect(() => {
        if (textAreaRef.current && document.activeElement !== textAreaRef.current) {
            textAreaRef.current.focus()
        }
    }, [input, threadId])

    const handleOnSubmit = async (newInput: string) => {
        textAreaRef.current?.style.setProperty('height', 'auto')
        if (threadId) {
            // handleSubmit({ id: threadId, override: newInput })
            send({ threadId: threadId as Id<'threads'>, openRouterId: selectedModel, prompt: newInput.trim() })
            handleInputChange({ id: threadId, value: '' })
            return
        }
        const newThreadId = await createThread({ openRouterId: selectedModel, prompt: input.trim() })
        if (newThreadId) {
            // handleSubmit({ id: newThreadId.toString(), override: newInput })
            await navigate({ to: `/${newThreadId}` })
            handleInputChange({ id: 'home', value: '' })
        } else if (!isSignedIn) {
            setShowSignInDialog(true)
        }
    }

    return (
        <div className="fixed bottom-0 left-0 flex w-full">
            <div className={cn('hidden h-full transition-[width,height] duration-75 ease-linear md:block', open ? 'w-(--sidebar-width)' : 'w-0')} />
            <div className="flex-1 px-4 sm:px-8">
                <form
                    onSubmit={(event) => {
                        event.preventDefault()
                        handleOnSubmit(input)
                    }}
                    className="z-50 mx-auto max-w-2xl rounded-t-3xl border-x border-t bg-sidebar/30 px-1.5 pt-1.5 shadow-2xl shadow-pink-300 backdrop-blur-sm dark:bg-sidebar/40 dark:shadow-none"
                >
                    <div className="rounded-t-[18px] border-x border-t bg-background/50 p-3 shadow">
                        <textarea
                            rows={2}
                            ref={textAreaRef}
                            placeholder="Type your message here..."
                            className="min-h-6 w-full resize-none text-base leading-6 outline-none"
                            value={input}
                            onKeyDown={async (event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault()
                                    if (status === 'ready') {
                                        handleOnSubmit(input)
                                    }
                                }
                            }}
                            onChange={(event) => {
                                handleInputChange({ id: threadId || 'home', value: event.target.value })
                                textAreaRef.current?.style.setProperty('height', 'auto')
                                textAreaRef.current?.style.setProperty('height', `${Math.min(event.target.scrollHeight, 5 * 24)}px`)
                            }}
                            autoFocus
                        />
                        <div className="flex items-center justify-between">
                            <div className="grid grid-cols-1 text-sm">
                                <select
                                    className="col-start-1 row-start-1 h-9 cursor-pointer appearance-none rounded-md border bg-background pr-7 pl-2 shadow-xs outline-none hover:bg-accent hover:text-accent-foreground"
                                    value={selectedModel}
                                    onChange={(event) => setSelectedModel(event.target.value)}
                                >
                                    {models.map((model) => (
                                        <option key={model._id} value={model.openRouterId}>
                                            {model.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="pointer-events-none col-start-1 row-start-1 mr-2 self-center justify-self-end sm:size-4"
                                />
                            </div>
                            {status === 'ready' && (
                                <Button size="icon" type="submit" className="bg-linear-to-t from-primary via-sidebar-accent/10 to-primary">
                                    <SendHorizontalIcon />
                                </Button>
                            )}
                            {(status === 'submitted' || status === 'streaming') && (
                                <div className="flex items-center gap-2">
                                    <LoaderCircleIcon className="size-4 animate-spin opacity-50" />
                                    <Button size="icon" className="bg-linear-to-t from-primary via-sidebar-accent/10 to-primary" onClick={stop}>
                                        <SquareIcon />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
            <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign in to Continue</DialogTitle>
                        <DialogDescription>You need to sign in to start a conversation. Please sign in to continue.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSignInDialog(false)}>
                            Cancel
                        </Button>
                        <SignInButton>
                            <Button>Sign In</Button>
                        </SignInButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
