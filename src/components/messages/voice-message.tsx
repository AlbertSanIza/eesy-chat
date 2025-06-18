import { DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { MessageOptions } from '@/components/messages/options'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
        <div className="group/image-message">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <audio ref={audioRef} src={content} preload="metadata" />
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={togglePlay}>
                        {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
                    </Button>
                    <div className="flex-1">
                        <div className="h-2 cursor-pointer rounded-full bg-muted" onClick={handleSeek}>
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                            />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={downloadAudio}>
                        <DownloadIcon className="size-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">"{content}"</p>
            </div>
            <MessageOptions message={message} onCopy={() => {}} className="group-hover/sound-message:opacity-100" />
        </div>
    )
}
