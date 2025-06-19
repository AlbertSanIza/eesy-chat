import { KeyIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/zustand/store'

export function ApiKeysDialog() {
    const key = useStore((state) => state.key)
    const [isOpen, setIsOpen] = useState(false)
    const [tempKey, setTempKey] = useState(key)
    const setKey = useStore((state) => state.setKey)

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setTempKey(key)
        }
        setIsOpen(open)
    }

    const handleSave = () => {
        setIsOpen(false)
        setKey(tempKey)
    }

    const hasValidOpenRouterKey = tempKey.openRouter.trim().length === 0 || tempKey.openRouter.startsWith('sk-or-v1-') || false
    const hasValidOpenAiKey = tempKey.openAi.trim().length === 0 || tempKey.openAi.startsWith('sk-') || false
    const hasValidElevenLabsKey = tempKey.elevenLabs.trim().length === 0 || (tempKey.elevenLabs.length ?? 0) >= 32
    const allKeysValid = hasValidOpenRouterKey && hasValidOpenAiKey && hasValidElevenLabsKey

    const hasStoredOpenRouterKey = !!key.openRouter.trim()
    const hasStoredOpenAiKey = !!key.openAi.trim()
    const hasStoredElevenLabsKey = !!key.elevenLabs.trim()
    const hasAllStoredKeys = hasStoredOpenRouterKey && hasStoredOpenAiKey && hasStoredElevenLabsKey
    const hasPartialStoredKeys = (hasStoredOpenRouterKey || hasStoredOpenAiKey || hasStoredElevenLabsKey) && !hasAllStoredKeys
    const hasNoStoredKeys = !hasStoredOpenRouterKey && !hasStoredOpenAiKey && !hasStoredElevenLabsKey

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <KeyIcon />
                    {hasAllStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-green-500" />}
                    {hasPartialStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-orange-500" />}
                    {hasNoStoredKeys && <div className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-red-500" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>API Keys</DialogTitle>
                    <DialogDescription>Enter your API keys to unlock AI models. Your keys are only stored locally and never on our servers.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="openrouter-api-key"
                                placeholder="sk-or-v1-..."
                                value={tempKey.openRouter}
                                onChange={(event) => setTempKey({ ...tempKey, openRouter: event.target.value })}
                            />
                            {tempKey.openRouter && (
                                <Button variant="destructive" size="icon" onClick={() => setTempKey({ ...tempKey, openRouter: '' })} type="button">
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempKey.openRouter && !hasValidOpenRouterKey && (
                            <p className="text-xs text-destructive">OpenRouter API key should start with "sk-or-v1-"</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="openai-api-key">OpenAI API Key (Image Gen)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                id="openai-api-key"
                                placeholder="sk-..."
                                value={tempKey.openAi}
                                onChange={(event) => setTempKey({ ...tempKey, openAi: event.target.value })}
                            />
                            {tempKey.openAi && (
                                <Button variant="destructive" size="icon" onClick={() => setTempKey({ ...tempKey, openAi: '' })} type="button">
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempKey.openAi && !hasValidOpenAiKey && <p className="text-xs text-destructive">OpenAI API key should start with "sk-"</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="elevenlabs-api-key">ElevenLabs API Key (Voice Gen)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                autoComplete="off"
                                className="flex-1"
                                placeholder="sk_..."
                                id="elevenlabs-api-key"
                                value={tempKey.elevenLabs}
                                onChange={(event) => setTempKey({ ...tempKey, elevenLabs: event.target.value })}
                            />
                            {tempKey.elevenLabs && (
                                <Button variant="destructive" size="icon" onClick={() => setTempKey({ ...tempKey, elevenLabs: '' })} type="button">
                                    <XIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                        {tempKey.elevenLabs && !hasValidElevenLabsKey && (
                            <p className="text-xs text-destructive">ElevenLabs API key should be at least 32 characters</p>
                        )}
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-sidebar text-sidebar-foreground dark:bg-pink-800" onClick={handleSave} disabled={!allKeysValid}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
