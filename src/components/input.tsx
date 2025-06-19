import { SignInButton, useUser } from '@clerk/clerk-react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useAction, useMutation } from 'convex/react'
import { ChevronDownIcon, LoaderCircleIcon, SendHorizontalIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { InputApiKeys } from '@/components/input/api-keys'
import { InputModelsSelect } from '@/components/input/models'
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
    const sendImage = useAction(api.create.imageMessage)
    const sendVoice = useAction(api.create.voiceMessage)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const [canScrollDown, setCanScrollDown] = useState(false)
    const createImageThread = useMutation(api.create.imageThread)
    const createVoiceThread = useMutation(api.create.voiceThread)
    const [showSignInDialog, setShowSignInDialog] = useState(false)
    const { input, status, handleInputChange } = useAiChat({ id: threadId || 'home' })
    const { threads, key, models, model, setModel } = useStore()

    const currentThread = threads.find((thread) => thread._id === threadId)
    const isImageThread = currentThread?.type === 'image'
    const isVoiceThread = currentThread?.type === 'sound'
    const availableModels = models.filter((model) => {
        // Image generation model - only available when creating new thread or in image thread
        if (model.label === 'GPT ImageGen') {
            return (!threadId || isImageThread) && key.openAi
        }
        // Voice generation model - only available when creating new thread or in voice thread
        if (model.label === 'ElevenLabs VoiceGen') {
            return (!threadId || isVoiceThread) && key.elevenLabs
        }
        // For regular text models, check if we have the required API key
        return key.openRouter || !model.withKey
    })
    const isImageGenModel = model?.label === 'GPT ImageGen'
    const isVoiceGenModel = model?.label === 'ElevenLabs VoiceGen'

    useEffect(() => {
        if (models.length > 0 && threadId) {
            if (isImageThread && key.openAi) {
                const imageGenModel = models.find((model) => model.label === 'GPT ImageGen')
                if (imageGenModel) {
                    setModel(imageGenModel)
                }
            } else if (isVoiceThread && key.elevenLabs) {
                const voiceGenModel = models.find((model) => model.label === 'ElevenLabs VoiceGen')
                if (voiceGenModel) {
                    setModel(voiceGenModel)
                }
            } else if (!isImageThread && !isVoiceThread) {
                if (model?.label === 'GPT ImageGen' || model?.label === 'ElevenLabs VoiceGen') {
                    const gpt41Model = models.find((model) => model.model === 'openai/gpt-4.1-nano')
                    if (gpt41Model) {
                        setModel(gpt41Model)
                    }
                }
            }
        }
    }, [key.elevenLabs, isImageThread, isVoiceThread, models, key.openAi, model?.label, setModel, threadId])

    useEffect(() => {
        if (textAreaRef.current && document.activeElement !== textAreaRef.current) {
            textAreaRef.current.focus()
        }
    }, [input, threadId])

    useEffect(() => {
        const handleScrollAndResize = () => {
            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const isScrollable = documentHeight > windowHeight + 10
            const isNearBottom = scrollTop + windowHeight >= documentHeight - 200
            setCanScrollDown(isScrollable && !isNearBottom)
        }

        window.addEventListener('scroll', handleScrollAndResize)
        window.addEventListener('resize', handleScrollAndResize)
        handleScrollAndResize()

        return () => {
            window.removeEventListener('scroll', handleScrollAndResize)
            window.removeEventListener('resize', handleScrollAndResize)
        }
    }, [threadId])

    const handleOnSubmit = async (newInput: string) => {
        textAreaRef.current?.style.setProperty('height', 'auto')
        if (!model) {
            return
        }
        if (isImageThread && !key.openAi) {
            return
        }
        if (isVoiceThread && !key.elevenLabs) {
            return
        }
        if (threadId) {
            if (isImageThread && key.openAi) {
                sendImage({
                    apiKey: key.openAi || undefined,
                    threadId: threadId as Id<'threads'>,
                    prompt: newInput.trim()
                })
            } else if (isVoiceThread && key.elevenLabs) {
                sendVoice({
                    apiKey: key.elevenLabs || undefined,
                    threadId: threadId as Id<'threads'>,
                    prompt: newInput.trim()
                })
            } else {
                send({
                    apiKey: key.openRouter || undefined,
                    threadId: threadId as Id<'threads'>,
                    prompt: newInput.trim(),
                    modelId: model._id
                })
            }
            handleInputChange({ id: threadId, value: '' })
            return
        }
        let newThreadId
        if (isImageGenModel && key.openAi) {
            newThreadId = await createImageThread({ apiKey: key.openAi, prompt: input.trim() })
        } else if (isVoiceGenModel && key.elevenLabs) {
            newThreadId = await createVoiceThread({ apiKey: key.elevenLabs, prompt: input.trim() })
        } else {
            newThreadId = await createThread({ apiKey: key.openRouter || undefined, modelId: model._id, prompt: input.trim() })
        }

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
                                    if (status === 'ready' && !(isImageThread && !key.openAi) && !(isVoiceThread && !key.elevenLabs)) {
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
                                <InputModelsSelect />
                                <InputApiKeys />
                            </div>
                            <div className="flex items-center gap-2">
                                {(status === 'submitted' || status === 'streaming') && <LoaderCircleIcon className="size-4 animate-spin opacity-50" />}
                                <Button
                                    size="icon"
                                    type="submit"
                                    className="bg-linear-to-t from-primary via-sidebar-accent/10 to-primary"
                                    disabled={status !== 'ready' || availableModels.length === 0 || (isImageThread && !key.openAi)}
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
