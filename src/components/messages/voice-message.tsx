import { useQuery } from 'convex/react'
import { DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

export function VoiceMessage({ message, content }: { message: Doc<'messages'>; content: string }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    // Get the audio URL from storage
    const audioUrl = useQuery(api.get.storageUrl, message.storageId ? { storageId: message.storageId } : 'skip')

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

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
    }, [audioUrl])

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
        if (audioUrl) {
            const a = document.createElement('a')
            a.href = audioUrl
            a.download = `voice-${message._id}.mp3`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
    }

    if (message.status === 'pending' || message.status === 'streaming') {
        return (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">Generating voice...</p>
                    <p className="text-xs text-muted-foreground">"{content}"</p>
                </div>
            </div>
        )
    }

    if (message.status === 'error') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                    <span className="text-destructive">✕</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Voice generation failed</p>
                    <p className="text-xs text-muted-foreground">"{content}"</p>
                </div>
            </div>
        )
    }

    if (!audioUrl) {
        return (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <span>🔊</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">Loading audio...</p>
                    <p className="text-xs text-muted-foreground">"{content}"</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

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
    )
}
