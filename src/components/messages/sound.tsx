import type { Message } from '@ai-sdk/react'
import { DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { MessageOptions } from '@/components/messages/options'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Id } from '@/convex/_generated/dataModel'

export function SoundMessage({
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
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) {
            return
        }
        const updateTime = () => setCurrentTime(audio.currentTime)
        const updateDuration = () => setDuration(audio.duration)
        const onEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
            audio.currentTime = 0
        }
        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', onEnded)
        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', onEnded)
        }
    }, [])

    const togglePlay = () => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current
        if (!audio || !duration) return

        const rect = e.currentTarget.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        const newTime = percent * duration
        audio.currentTime = newTime
        setCurrentTime(newTime)
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const downloadAudio = () => {
        if (message.experimental_attachments?.[0]?.url) {
            const a = document.createElement('a')
            a.href = message.experimental_attachments?.[0]?.url
            a.download = `voice-${message.id}.mp3`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
    }

    return (
        <div className="group/sound-message">
            <div className="mb-1.5 flex items-center gap-1.5">
                <Button variant="outline" size="icon" onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <audio ref={audioRef} src={message.experimental_attachments?.[0]?.url} preload="metadata" />
                <div className="mt-2 flex flex-1 items-center rounded-lg">
                    <div className="w-full">
                        <Progress
                            className="cursor-pointer dark:bg-[#2C2632] [&>div]:bg-pink-400/60!"
                            onClick={handleSeek}
                            value={duration ? (currentTime / duration) * 100 : 0}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
                {threadId && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]" onClick={downloadAudio}>
                                <DownloadIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Download</TooltipContent>
                    </Tooltip>
                )}
            </div>
            {showOptions && threadId && (
                <MessageOptions
                    className="group-hover/sound-message:opacity-100"
                    onCopy={() => {}}
                    threadId={threadId}
                    provider={provider}
                    messageId={message.id as Id<'messages'>}
                />
            )}
        </div>
    )
}
