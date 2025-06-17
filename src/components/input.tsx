import { SignInButton, useUser } from '@clerk/clerk-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useAction, useMutation } from 'convex/react'
import { ChevronDownIcon, LoaderCircleIcon, SendHorizontalIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { ApiKeysDialog } from '@/components/api-keys-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSidebar } from '@/components/ui/sidebar'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useAiChat } from '@/hooks/use-ai-chat'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/zustand/store'

export function Input() {
    const { open } = useSidebar()
    const navigate = useNavigate()
    const { isSignedIn } = useUser()
    const send = useAction(api.create.message)
    const { threadId } = useParams({ strict: false })
    const createThread = useMutation(api.create.thread)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [canScrollDown, setCanScrollDown] = useState(false)
    const [showSignInDialog, setShowSignInDialog] = useState(false)
    const { openRouterApiKey, models, selectedModel, setSelectedModel } = useStore()
    const { input, status, handleInputChange } = useAiChat({ id: threadId || 'home' })

    useEffect(() => {
        if (textAreaRef.current && document.activeElement !== textAreaRef.current) {
            textAreaRef.current.focus()
        }
    }, [input, threadId])

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const isNearBottom = scrollTop + windowHeight >= documentHeight - 200
            setCanScrollDown(!isNearBottom)
        }
        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleOnSubmit = async (newInput: string) => {
        textAreaRef.current?.style.setProperty('height', 'auto')
        if (!selectedModel) {
            return
        }
        if (threadId) {
            send({
                apiKey: openRouterApiKey || undefined,
                threadId: threadId as Id<'threads'>,
                prompt: newInput.trim(),
                modelId: selectedModel._id
            })
            handleInputChange({ id: threadId, value: '' })
            return
        }
        const newThreadId = await createThread({ apiKey: openRouterApiKey || undefined, modelId: selectedModel._id, prompt: input.trim() })
        if (newThreadId) {
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
                    {canScrollDown && (
                        <motion.div
                            className="absolute -top-10 right-0 mb-20"
                            exit={{ opacity: 0, scale: 0.8 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Button
                                size="sm"
                                className="text-xs opacity-90"
                                onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
                                }}
                            >
                                Scroll to bottom
                                <ChevronDownIcon className="size-4" />
                            </Button>
                        </motion.div>
                    )}
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
                            <div className="flex items-center gap-1">
                                <div className="grid grid-cols-1 text-sm">
                                    <select
                                        className="col-start-1 row-start-1 h-9 cursor-pointer appearance-none rounded-md border bg-background pr-7 pl-2 shadow-xs outline-none hover:bg-accent hover:text-accent-foreground"
                                        value={selectedModel?._id}
                                        onChange={(event) => {
                                            const modelId = event.target.value
                                            const model = models.find((m) => m._id === modelId)
                                            if (model) {
                                                setSelectedModel(model)
                                            }
                                        }}
                                    >
                                        {models
                                            .filter((model) => openRouterApiKey || !model.withKey)
                                            .map((model) => (
                                                <option key={model._id} value={model._id}>
                                                    {model.label}
                                                </option>
                                            ))}
                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 self-center justify-self-end sm:size-4"
                                    />
                                </div>
                                <ApiKeysDialog />
                            </div>
                            <div className="flex items-center gap-2">
                                {(status === 'submitted' || status === 'streaming') && <LoaderCircleIcon className="size-4 animate-spin opacity-50" />}
                                <Button
                                    size="icon"
                                    type="submit"
                                    className="bg-linear-to-t from-primary via-sidebar-accent/10 to-primary"
                                    disabled={status !== 'ready'}
                                >
                                    <SendHorizontalIcon />
                                </Button>
                            </div>
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
