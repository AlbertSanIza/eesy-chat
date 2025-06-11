import { type UseChatHelpers } from '@ai-sdk/react'
import { LoaderCircleIcon, SendHorizontalIcon, SquareIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export default function Input({
    input,
    status,
    onInputChange,
    onSubmit,
    onStop
}: {
    input: string
    status: UseChatHelpers['status']
    onInputChange: UseChatHelpers['handleInputChange']
    onSubmit: UseChatHelpers['handleSubmit']
    onStop?: UseChatHelpers['stop']
}) {
    const { open } = useSidebar()
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (input && textAreaRef.current && document.activeElement !== textAreaRef.current) {
            textAreaRef.current.focus()
        }
    }, [input])

    const handleSubmit = async () => {
        textAreaRef.current?.style.setProperty('height', 'auto')
        onSubmit()
    }

    return (
        <div className="fixed bottom-0 left-0 flex w-full">
            <div className={cn('hidden h-full transition-[width,height] duration-75 ease-linear md:block', open ? 'w-(--sidebar-width)' : 'w-0')} />
            <div className="flex-1 px-8">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto max-w-2xl rounded-t-3xl border-x border-t bg-sidebar/80 px-1.5 pt-1.5 shadow-2xl shadow-sky-300 backdrop-blur-xs dark:shadow-none"
                >
                    <div className="rounded-t-[18px] border-x border-t bg-background/80 p-3 shadow">
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
                                        handleSubmit()
                                    }
                                }
                            }}
                            onChange={(event) => {
                                onInputChange(event)
                                textAreaRef.current?.style.setProperty('height', 'auto')
                                textAreaRef.current?.style.setProperty('height', `${Math.min(event.target.scrollHeight, 5 * 24)}px`)
                            }}
                            autoFocus
                        />
                        <div className="flex items-center justify-between">
                            <div>Model Selection Here!</div>
                            {status === 'ready' && (
                                <Button size="icon" type="submit">
                                    <SendHorizontalIcon />
                                </Button>
                            )}
                            {(status === 'submitted' || status === 'streaming') && (
                                <div className="flex items-center gap-2">
                                    <LoaderCircleIcon className="size-4 animate-spin opacity-50" />
                                    <Button size="icon" onClick={onStop}>
                                        <SquareIcon />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
