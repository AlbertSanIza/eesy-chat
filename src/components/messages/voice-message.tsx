import { DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { MessageOptions } from '@/components/messages/options'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Doc } from '@/convex/_generated/dataModel'

export function VoiceMessage({ message, content }: { message: Doc<'messages'>; content: string }) {
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
        const onEnded = () => setIsPlaying(false)
        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', updateDuration)
        audio.addEventListener('ended', onEnded)
        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', updateDuration)
            audio.removeEventListener('ended', onEnded)
        }
    }, [content])

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
        if (content) {
            const a = document.createElement('a')
            a.href = content
            a.download = `voice-${message._id}.mp3`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
    }

    if (message.status === 'pending' || message.status === 'streaming') {
        return <Skeleton className="h-20 w-full rounded-lg border bg-sidebar" />
    }

    return (
        <div className="group/sound-message">
            <div className="mb-1.5 flex items-center gap-1.5">
                <Button variant="outline" size="icon" onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <audio ref={audioRef} src={content} preload="metadata" />
                <div className="mt-2 flex flex-1 items-center rounded-lg">
                    <div className="w-full">
                        <Progress className="cursor-pointer dark:bg-[#2C2632]" value={duration ? (currentTime / duration) * 100 : 0} onClick={handleSeek} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="size-8 hover:bg-sidebar dark:hover:bg-[#2C2632]" onClick={downloadAudio}>
                            <DownloadIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Download</TooltipContent>
                </Tooltip>
            </div>
            <MessageOptions message={message} onCopy={() => {}} className="group-hover/sound-message:opacity-100" />
        </div>
    )
}
